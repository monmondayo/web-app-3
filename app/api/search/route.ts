import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/mockData';
import { Product } from '@/lib/types';

/**
 * 楽天市場APIから商品を検索
 */
async function searchRakuten(keyword: string): Promise<Product[]> {
  const RAKUTEN_APP_ID = process.env.RAKUTEN_APPLICATION_ID;

  if (!RAKUTEN_APP_ID) {
    throw new Error('RAKUTEN_APPLICATION_ID is not set');
  }

  const url = new URL('https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706');
  url.searchParams.append('format', 'json');
  url.searchParams.append('keyword', keyword);
  url.searchParams.append('applicationId', RAKUTEN_APP_ID);
  url.searchParams.append('hits', '10');
  url.searchParams.append('sort', '-itemPrice'); // 価格が高い順

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Rakuten API error: ${response.status}`);
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
    condition: 'new' as const
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

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Yahoo API error: ${response.status}`);
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
    condition: 'new' as const
  }));
}

/**
 * 複数のソースから商品を検索
 */
async function searchFromMultipleSources(keyword: string): Promise<{ products: Product[], source: string }> {
  const results: Product[] = [];
  let source = 'mock';

  // 楽天市場APIを試す
  if (process.env.RAKUTEN_APPLICATION_ID) {
    try {
      const rakutenProducts = await searchRakuten(keyword);
      if (rakutenProducts.length > 0) {
        results.push(...rakutenProducts);
        source = 'rakuten';
      }
    } catch (error) {
      console.warn('Rakuten API failed, trying next source:', error);
    }
  }

  // Yahoo!ショッピングAPIを試す
  if (results.length === 0 && process.env.YAHOO_CLIENT_ID) {
    try {
      const yahooProducts = await searchYahoo(keyword);
      if (yahooProducts.length > 0) {
        results.push(...yahooProducts);
        source = 'yahoo';
      }
    } catch (error) {
      console.warn('Yahoo API failed, falling back to mock data:', error);
    }
  }

  // APIが設定されていないか、全て失敗した場合はモックデータを使用
  if (results.length === 0) {
    const mockProducts = searchProducts(keyword);
    results.push(...mockProducts);
    source = 'mock';
  }

  return { products: results, source };
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

    // 複数ソースから検索
    const { products, source } = await searchFromMultipleSources(keyword);

    if (products.length === 0) {
      return NextResponse.json(
        {
          products: [],
          source: 'none',
          message: '該当する商品が見つかりませんでした。別のキーワードをお試しください。'
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      products,
      source,
      message: source === 'mock'
        ? 'モックデータを表示中。楽天市場APIやYahoo!ショッピングAPIを設定すると、リアルタイムで商品検索できます。'
        : undefined
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: '検索中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
