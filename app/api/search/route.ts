import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/mockData';
import { Product } from '@/lib/types';
import crypto from 'crypto';

/**
 * 指数バックオフ付きリトライを行うfetch
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000) // 10秒タイムアウト
      });

      // 5xx エラーの場合はリトライ
      if (response.status >= 500 && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      // タイムアウトやネットワークエラーの場合はリトライ
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * 楽天市場APIから商品を検索
 */
async function searchRakuten(keyword: string): Promise<Product[]> {
  const RAKUTEN_APP_ID = process.env.RAKUTEN_APPLICATION_ID;

  if (!RAKUTEN_APP_ID) {
    throw new Error('RAKUTEN_APPLICATION_ID is not set');
  }

  // 最新のAPIバージョン 20220601 を使用
  const url = new URL('https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601');
  url.searchParams.append('format', 'json');
  url.searchParams.append('keyword', keyword);
  url.searchParams.append('applicationId', RAKUTEN_APP_ID);
  url.searchParams.append('hits', '10');
  url.searchParams.append('sort', '-itemPrice'); // 価格が高い順

  const response = await fetchWithRetry(url.toString());

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Rakuten API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  if (!data.Items || data.Items.length === 0) {
    return [];
  }

  // 楽天APIのレスポンスをProduct型に変換
  return data.Items.map((item: any, index: number) => ({
    id: `rakuten_${item.Item.itemCode}`,
    name: item.Item.itemName,
    price: item.Item.itemPrice,
    imageUrl: item.Item.mediumImageUrls?.[0]?.imageUrl || item.Item.smallImageUrls?.[0]?.imageUrl || '',
    shopName: item.Item.shopName,
    condition: 'new' as const,
    url: item.Item.itemUrl, // 商品ページURL（API規約準拠）
    affiliateUrl: item.Item.affiliateUrl // アフィリエイトURL
  }));
}

/**
 * Yahoo!ショッピングAPIから商品を検索
 */
async function searchYahoo(keyword: string): Promise<Product[]> {
  const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID;

  if (!YAHOO_CLIENT_ID) {
    throw new Error('YAHOO_CLIENT_ID is not set');
  }

  const url = new URL('https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch');
  url.searchParams.append('appid', YAHOO_CLIENT_ID);
  url.searchParams.append('query', keyword);
  url.searchParams.append('results', '10');
  url.searchParams.append('sort', '-price'); // 価格が高い順

  const response = await fetchWithRetry(url.toString());

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Yahoo API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  if (!data.hits || data.hits.length === 0) {
    return [];
  }

  // Yahoo APIのレスポンスをProduct型に変換
  return data.hits.map((item: any) => ({
    id: `yahoo_${item.code}`,
    name: item.name,
    price: parseInt(item.price),
    imageUrl: item.image?.medium || item.image?.small || '',
    shopName: item.seller?.name || 'Yahoo!ショッピング',
    condition: 'new' as const,
    url: item.url, // 商品ページURL（API規約準拠）
    affiliateUrl: item.url // Yahoo!ショッピングの場合、通常URLと同じ
  }));
}

/**
 * Amazon Product Advertising APIから商品を検索
 * PA-API 5.0を使用（署名バージョン4が必要）
 */
async function searchAmazon(keyword: string): Promise<Product[]> {
  const ACCESS_KEY = process.env.AMAZON_ACCESS_KEY;
  const SECRET_KEY = process.env.AMAZON_SECRET_KEY;
  const ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG;
  const REGION = 'us-west-2'; // PA-API endpoint (日本の場合は us-west-2)
  const HOST = 'webservices.amazon.co.jp'; // 日本のエンドポイント
  const MARKETPLACE = 'www.amazon.co.jp';

  if (!ACCESS_KEY || !SECRET_KEY || !ASSOCIATE_TAG) {
    throw new Error('Amazon credentials not set');
  }

  // PA-API 5.0 リクエストペイロード
  const payload = JSON.stringify({
    Keywords: keyword,
    Resources: [
      'Images.Primary.Large',
      'ItemInfo.Title',
      'Offers.Listings.Price',
      'ItemInfo.ByLineInfo'
    ],
    SearchIndex: 'All',
    ItemCount: 10,
    PartnerTag: ASSOCIATE_TAG,
    PartnerType: 'Associates',
    Marketplace: MARKETPLACE
  });

  // 署名バージョン4の生成
  const service = 'ProductAdvertisingAPI';
  const target = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems';
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  // リクエストヘッダー
  const headers: Record<string, string> = {
    'content-encoding': 'amz-1.0',
    'content-type': 'application/json; charset=utf-8',
    'host': HOST,
    'x-amz-date': amzDate,
    'x-amz-target': target
  };

  // 署名計算
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map(key => `${key}:${headers[key]}\n`)
    .join('');
  const signedHeaders = Object.keys(headers).sort().join(';');
  const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');

  const canonicalRequest = [
    'POST',
    '/paapi5/searchitems',
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');

  const credentialScope = `${dateStamp}/${REGION}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex')
  ].join('\n');

  // 署名キーの生成
  const getSignatureKey = (key: string, dateStamp: string, regionName: string, serviceName: string) => {
    const kDate = crypto.createHmac('sha256', `AWS4${key}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    return kSigning;
  };

  const signingKey = getSignatureKey(SECRET_KEY, dateStamp, REGION, service);
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

  // Authorization ヘッダー
  const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  try {
    const response = await fetch(`https://${HOST}/paapi5/searchitems`, {
      method: 'POST',
      headers: {
        ...headers,
        'Authorization': authorizationHeader
      },
      body: payload,
      signal: AbortSignal.timeout(10000) // 10秒タイムアウト
    });

    if (!response.ok) {
      const errorBody = await response.text();
      // 本番環境ではエラー詳細をログに出力しない（機密情報保護）
      if (process.env.NODE_ENV === 'development') {
        console.error('Amazon API error response:', errorBody);
      }
      throw new Error(`Amazon API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.SearchResult?.Items || data.SearchResult.Items.length === 0) {
      return [];
    }

    // Amazon APIのレスポンスをProduct型に変換
    return data.SearchResult.Items.map((item: any) => {
      const asin = item.ASIN;
      const productUrl = `https://www.amazon.co.jp/dp/${asin}`;
      const affiliateUrl = `https://www.amazon.co.jp/dp/${asin}?tag=${ASSOCIATE_TAG}`;

      // 価格の取得（円単位で返す）
      let price = 0;
      if (item.Offers?.Listings?.[0]?.Price) {
        const priceInfo = item.Offers.Listings[0].Price;
        price = priceInfo.Amount || 0;
      }

      return {
        id: `amazon_${asin}`,
        name: item.ItemInfo?.Title?.DisplayValue || 'タイトル不明',
        price: price,
        imageUrl: item.Images?.Primary?.Large?.URL || item.Images?.Primary?.Medium?.URL || '',
        shopName: 'Amazon.co.jp',
        condition: 'new' as const,
        url: productUrl, // 商品ページURL（API規約準拠）
        affiliateUrl: affiliateUrl // アフィリエイトURL（PA-API規約準拠）
      };
    }).filter((product: Product) => product.price > 0); // 価格が0のものは除外
  } catch (error) {
    console.error('Amazon PA-API error:', error);
    throw error;
  }
}

/**
 * 複数のソースから商品を検索（並列実行）
 */
async function searchFromMultipleSources(keyword: string): Promise<{
  rakuten: Product[],
  amazon: Product[],
  yahoo: Product[]
}> {
  // すべてのAPIを並列で実行
  const [rakutenResult, amazonResult, yahooResult] = await Promise.allSettled([
    // 楽天市場API
    process.env.RAKUTEN_APPLICATION_ID
      ? searchRakuten(keyword).catch(err => {
          console.warn('Rakuten API failed:', err);
          return [];
        })
      : Promise.resolve([]),

    // Amazon Product Advertising API
    process.env.AMAZON_ACCESS_KEY && process.env.AMAZON_SECRET_KEY && process.env.AMAZON_ASSOCIATE_TAG
      ? searchAmazon(keyword).catch(err => {
          console.warn('Amazon API failed:', err);
          return [];
        })
      : Promise.resolve([]),

    // Yahoo!ショッピングAPI
    process.env.YAHOO_CLIENT_ID
      ? searchYahoo(keyword).catch(err => {
          console.warn('Yahoo API failed:', err);
          return [];
        })
      : Promise.resolve([])
  ]);

  return {
    rakuten: rakutenResult.status === 'fulfilled' ? rakutenResult.value : [],
    amazon: amazonResult.status === 'fulfilled' ? amazonResult.value : [],
    yahoo: yahooResult.status === 'fulfilled' ? yahooResult.value : []
  };
}

/**
 * 商品検索API
 * GET /api/search?keyword=ロレックス
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');

    if (!keyword) {
      return NextResponse.json(
        { error: 'キーワードを指定してください' },
        { status: 400 }
      );
    }

    // 複数ソースから並列検索
    const results = await searchFromMultipleSources(keyword);

    // すべて空の場合はモックデータを返す
    const allEmpty = results.rakuten.length === 0 && results.amazon.length === 0 && results.yahoo.length === 0;

    if (allEmpty) {
      const mockProducts = searchProducts(keyword);
      return NextResponse.json({
        rakuten: [],
        amazon: [],
        yahoo: [],
        mock: mockProducts,
        message: 'モックデータを表示中。楽天市場API、Amazon PA-API、Yahoo!ショッピングAPIを設定すると、リアルタイムで商品検索できます。'
      });
    }

    return NextResponse.json({
      rakuten: results.rakuten,
      amazon: results.amazon,
      yahoo: results.yahoo,
      mock: []
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: '検索中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
