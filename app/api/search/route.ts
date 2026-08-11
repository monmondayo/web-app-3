import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/mockData';
import {
  Product,
  ServiceSearchStatus,
  ServiceStatuses,
} from '@/lib/types';

type ProviderName = keyof ServiceStatuses;

interface ProviderResult {
  products: Product[];
  status: ServiceSearchStatus;
}

interface AmazonAccessToken {
  accessToken: string;
  credentialVersion: string;
  expiresAt: number;
}

interface RakutenItem {
  itemCode?: string;
  itemName?: string;
  itemPrice?: number;
  itemUrl?: string;
  affiliateUrl?: string;
  shopName?: string;
  mediumImageUrls?: Array<string | { imageUrl?: string }>;
  smallImageUrls?: Array<string | { imageUrl?: string }>;
}

interface AmazonItem {
  asin?: string;
  detailPageURL?: string;
  images?: {
    primary?: {
      large?: { url?: string };
      medium?: { url?: string };
    };
  };
  itemInfo?: {
    title?: { displayValue?: string };
  };
  offersV2?: {
    listings?: Array<{
      merchantInfo?: { name?: string };
      price?: { money?: { amount?: number } };
    }>;
  };
}

class ProviderError extends Error {
  constructor(
    public readonly provider: ProviderName,
    public readonly statusCode?: number,
    public readonly errorCode?: string,
  ) {
    super(`${provider} provider request failed`);
    this.name = 'ProviderError';
  }
}

let amazonTokenCache: AmazonAccessToken | null = null;
let amazonTokenRequest: Promise<AmazonAccessToken> | null = null;

/**
 * 指数バックオフ付きリトライを行うfetch
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000),
      });

      if (response.status >= 500 && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

function getErrorCode(body: string): string | undefined {
  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    if (typeof parsed.error === 'string') return parsed.error;
    if (typeof parsed.code === 'string') return parsed.code;
    if (typeof parsed.__type === 'string') return parsed.__type;

    for (const key of ['errors', 'Errors']) {
      const errors = parsed[key];
      if (!Array.isArray(errors) || errors.length === 0) continue;
      const first = errors[0];
      if (!first || typeof first !== 'object') continue;
      const error = first as Record<string, unknown>;
      if (typeof error.code === 'string') return error.code;
      if (typeof error.Code === 'string') return error.Code;
    }
  } catch {
    // 外部サービスのHTMLエラー等は公開・記録しない
  }

  return undefined;
}

async function throwProviderError(
  provider: ProviderName,
  response: Response,
): Promise<never> {
  const body = await response.text().catch(() => '');
  throw new ProviderError(provider, response.status, getErrorCode(body));
}

function firstImageUrl(
  images: Array<string | { imageUrl?: string }> | undefined,
): string {
  const image = images?.[0];
  if (typeof image === 'string') return image;
  return image?.imageUrl || '';
}

/**
 * 楽天市場商品検索API 2026-07-01から商品を検索
 */
async function searchRakuten(keyword: string): Promise<Product[]> {
  const applicationId = process.env.RAKUTEN_APPLICATION_ID?.trim();
  const accessKey = process.env.RAKUTEN_ACCESS_KEY?.trim();

  if (!applicationId || !accessKey) {
    throw new Error('Rakuten credentials are not configured');
  }

  const sanitizedKeyword = keyword.trim().replace(/\s+/g, ' ');
  if (!sanitizedKeyword) return [];

  const url = new URL(
    'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701',
  );
  url.searchParams.set('format', 'json');
  url.searchParams.set('formatVersion', '2');
  url.searchParams.set('keyword', sanitizedKeyword);
  url.searchParams.set('applicationId', applicationId);
  url.searchParams.set('accessKey', accessKey);
  url.searchParams.set('hits', '10');

  const response = await fetchWithRetry(url.toString());

  if (!response.ok) await throwProviderError('rakuten', response);

  const data = (await response.json()) as { items?: RakutenItem[] };
  return (data.items || [])
    .map((item): Product | null => {
      if (!item.itemCode || !item.itemName || !item.itemUrl) return null;
      const price = Number(item.itemPrice);
      if (!Number.isFinite(price) || price <= 0) return null;

      return {
        id: `rakuten_${item.itemCode}`,
        name: item.itemName,
        price,
        imageUrl:
          firstImageUrl(item.mediumImageUrls) ||
          firstImageUrl(item.smallImageUrls),
        shopName: item.shopName || '楽天市場',
        condition: 'new',
        url: item.itemUrl,
        affiliateUrl: item.affiliateUrl,
      };
    })
    .filter((product): product is Product => product !== null);
}

/**
 * Yahoo!ショッピングAPIから商品を検索
 */
async function searchYahoo(keyword: string): Promise<Product[]> {
  const clientId = process.env.YAHOO_CLIENT_ID;
  if (!clientId) throw new Error('Yahoo credentials are not configured');

  const url = new URL(
    'https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch',
  );
  url.searchParams.set('appid', clientId);
  url.searchParams.set('query', keyword);
  url.searchParams.set('results', '10');
  url.searchParams.set('sort', '-price');

  const response = await fetchWithRetry(url.toString());
  if (!response.ok) await throwProviderError('yahoo', response);

  const data = (await response.json()) as {
    hits?: Array<{
      code?: string;
      name?: string;
      price?: string | number;
      image?: { medium?: string; small?: string };
      seller?: { name?: string };
      url?: string;
    }>;
  };

  return (data.hits || [])
    .map((item): Product | null => {
      if (!item.code || !item.name || !item.url) return null;
      const price = Number(item.price);
      if (!Number.isFinite(price) || price <= 0) return null;

      return {
        id: `yahoo_${item.code}`,
        name: item.name,
        price,
        imageUrl: item.image?.medium || item.image?.small || '',
        shopName: item.seller?.name || 'Yahoo!ショッピング',
        condition: 'new',
        url: item.url,
        affiliateUrl: item.url,
      };
    })
    .filter((product): product is Product => product !== null);
}

function getAmazonCredentials() {
  return {
    clientId: process.env.AMAZON_CREATORS_CLIENT_ID?.trim(),
    clientSecret: process.env.AMAZON_CREATORS_CLIENT_SECRET?.trim(),
    credentialVersion:
      process.env.AMAZON_CREATORS_CREDENTIAL_VERSION?.trim() || '3.3',
    associateTag: process.env.AMAZON_ASSOCIATE_TAG?.trim(),
  };
}

async function requestAmazonAccessToken(): Promise<AmazonAccessToken> {
  const { clientId, clientSecret, credentialVersion } = getAmazonCredentials();
  if (!clientId || !clientSecret) {
    throw new Error('Amazon Creators API credentials are not configured');
  }

  let tokenUrl: string;
  let headers: HeadersInit;
  let body: string;

  if (credentialVersion === '2.3') {
    tokenUrl =
      'https://creatorsapi.auth.us-west-2.amazoncognito.com/oauth2/token';
    headers = { 'content-type': 'application/x-www-form-urlencoded' };
    body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'creatorsapi/default',
    }).toString();
  } else if (credentialVersion === '3.3') {
    tokenUrl = 'https://api.amazon.co.jp/auth/o2/token';
    headers = { 'content-type': 'application/json' };
    body = JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'creatorsapi::default',
    });
  } else {
    throw new ProviderError(
      'amazon',
      undefined,
      'unsupported_credential_version',
    );
  }

  const response = await fetchWithRetry(tokenUrl, {
    method: 'POST',
    headers,
    body,
  });
  if (!response.ok) await throwProviderError('amazon', response);

  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!data.access_token) {
    throw new ProviderError('amazon', response.status, 'missing_access_token');
  }

  const expiresInSeconds = Number(data.expires_in) || 3600;
  return {
    accessToken: data.access_token,
    credentialVersion,
    expiresAt: Date.now() + Math.max(expiresInSeconds - 60, 60) * 1000,
  };
}

async function getAmazonAccessToken(): Promise<AmazonAccessToken> {
  const credentialVersion = getAmazonCredentials().credentialVersion;
  if (
    amazonTokenCache &&
    amazonTokenCache.credentialVersion === credentialVersion &&
    amazonTokenCache.expiresAt > Date.now()
  ) {
    return amazonTokenCache;
  }

  if (!amazonTokenRequest) {
    amazonTokenRequest = requestAmazonAccessToken()
      .then((token) => {
        amazonTokenCache = token;
        return token;
      })
      .finally(() => {
        amazonTokenRequest = null;
      });
  }

  return amazonTokenRequest;
}

/**
 * Amazon Creators APIから商品を検索
 */
async function searchAmazon(keyword: string): Promise<Product[]> {
  const { associateTag } = getAmazonCredentials();
  if (!associateTag) {
    throw new Error('Amazon associate tag is not configured');
  }

  const token = await getAmazonAccessToken();
  const authorization = token.credentialVersion.startsWith('2.')
    ? `Bearer ${token.accessToken}, Version ${token.credentialVersion}`
    : `Bearer ${token.accessToken}`;

  const response = await fetchWithRetry(
    'https://creatorsapi.amazon/catalog/v1/searchItems',
    {
      method: 'POST',
      headers: {
        authorization,
        'content-type': 'application/json',
        'x-marketplace': 'www.amazon.co.jp',
      },
      body: JSON.stringify({
        keywords: keyword,
        resources: [
          'images.primary.large',
          'images.primary.medium',
          'itemInfo.title',
          'offersV2.listings.merchantInfo',
          'offersV2.listings.price',
        ],
        searchIndex: 'All',
        itemCount: 10,
        partnerTag: associateTag,
        marketplace: 'www.amazon.co.jp',
      }),
    },
  );

  if (!response.ok) await throwProviderError('amazon', response);

  const data = (await response.json()) as {
    searchResult?: { items?: AmazonItem[] };
  };

  return (data.searchResult?.items || [])
    .map((item): Product | null => {
      if (!item.asin) return null;
      const listing = item.offersV2?.listings?.[0];
      const price = Number(listing?.price?.money?.amount);
      if (!Number.isFinite(price) || price <= 0) return null;

      const productUrl =
        item.detailPageURL ||
        `https://www.amazon.co.jp/dp/${item.asin}?tag=${encodeURIComponent(associateTag)}`;

      return {
        id: `amazon_${item.asin}`,
        name: item.itemInfo?.title?.displayValue || 'タイトル不明',
        price: Math.round(price),
        imageUrl:
          item.images?.primary?.large?.url ||
          item.images?.primary?.medium?.url ||
          '',
        shopName: listing?.merchantInfo?.name || 'Amazon.co.jp',
        condition: 'new',
        url: productUrl,
        affiliateUrl: productUrl,
      };
    })
    .filter((product): product is Product => product !== null);
}

function publicErrorMessage(provider: ProviderName, error: unknown): string {
  const status = error instanceof ProviderError ? error.statusCode : undefined;

  if (status === 429) {
    return 'APIのリクエスト上限に達しました。時間をおいて再検索してください。';
  }
  if (status && status >= 500) {
    return 'サービスが一時的に利用できません。時間をおいて再検索してください。';
  }
  if (status === 401 || status === 403) {
    return provider === 'amazon'
      ? 'Creators APIの認証または利用権限を確認してください。'
      : 'APIの認証情報を確認してください。';
  }

  return '検索APIでエラーが発生しました。設定または実行ログを確認してください。';
}

async function runProvider(
  provider: ProviderName,
  configured: boolean,
  notConfiguredMessage: string,
  search: () => Promise<Product[]>,
): Promise<ProviderResult> {
  if (!configured) {
    return {
      products: [],
      status: { state: 'not_configured', message: notConfiguredMessage },
    };
  }

  try {
    const products = await search();
    return {
      products,
      status:
        products.length > 0
          ? { state: 'ok', message: `${products.length}件取得しました。` }
          : { state: 'empty', message: '該当する商品がありませんでした。' },
    };
  } catch (error) {
    const providerError = error instanceof ProviderError ? error : undefined;
    const cause = error instanceof Error ? error.cause : undefined;
    const causeCode =
      cause && typeof cause === 'object' && 'code' in cause
        ? String((cause as { code?: unknown }).code)
        : undefined;
    console.warn(`${provider} API failed`, {
      status: providerError?.statusCode,
      code: providerError?.errorCode,
      errorName: error instanceof Error ? error.name : typeof error,
      causeCode,
    });
    return {
      products: [],
      status: { state: 'error', message: publicErrorMessage(provider, error) },
    };
  }
}

async function searchFromMultipleSources(keyword: string): Promise<{
  rakuten: Product[];
  amazon: Product[];
  yahoo: Product[];
  statuses: ServiceStatuses;
}> {
  const amazonCredentials = getAmazonCredentials();
  const [rakuten, amazon, yahoo] = await Promise.all([
    runProvider(
      'rakuten',
      Boolean(
        process.env.RAKUTEN_APPLICATION_ID && process.env.RAKUTEN_ACCESS_KEY,
      ),
      'Application IDとAccess Keyが未設定です。',
      () => searchRakuten(keyword),
    ),
    runProvider(
      'amazon',
      Boolean(
        amazonCredentials.clientId &&
          amazonCredentials.clientSecret &&
          amazonCredentials.associateTag,
      ),
      'Creators APIのClient ID、Client Secret、Associate Tagが未設定です。',
      () => searchAmazon(keyword),
    ),
    runProvider(
      'yahoo',
      Boolean(process.env.YAHOO_CLIENT_ID),
      'Client IDが未設定です。',
      () => searchYahoo(keyword),
    ),
  ]);

  return {
    rakuten: rakuten.products,
    amazon: amazon.products,
    yahoo: yahoo.products,
    statuses: {
      rakuten: rakuten.status,
      amazon: amazon.status,
      yahoo: yahoo.status,
    },
  };
}

/**
 * 商品検索API
 * GET /api/search?keyword=ロレックス
 */
export async function GET(request: NextRequest) {
  try {
    const keyword = request.nextUrl.searchParams.get('keyword');
    if (!keyword?.trim()) {
      return NextResponse.json(
        { error: 'キーワードを指定してください' },
        { status: 400 },
      );
    }

    const results = await searchFromMultipleSources(keyword);
    const allEmpty =
      results.rakuten.length === 0 &&
      results.amazon.length === 0 &&
      results.yahoo.length === 0;

    if (allEmpty) {
      return NextResponse.json({
        rakuten: [],
        amazon: [],
        yahoo: [],
        mock: searchProducts(keyword),
        statuses: results.statuses,
        message:
          '外部サービスの結果がないため、利用可能なモックデータを表示しています。サービス別の状態をご確認ください。',
      });
    }

    return NextResponse.json({
      rakuten: results.rakuten,
      amazon: results.amazon,
      yahoo: results.yahoo,
      mock: [],
      statuses: results.statuses,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: '検索中にエラーが発生しました' },
      { status: 500 },
    );
  }
}
