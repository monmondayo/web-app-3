import { NextRequest, NextResponse } from 'next/server';
import { searchProducts, getUsedPrices } from '@/lib/mockData';
import { calculateResaleValue } from '@/lib/resaleCalculator';

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

    // モック検索（本番環境では楽天APIやYahoo APIを呼び出す）
    const products = searchProducts(keyword);

    if (products.length === 0) {
      return NextResponse.json(
        {
          products: [],
          message: '該当する商品が見つかりませんでした。「ロレックス サブマリーナ」「エルメス バーキン」「iPhone 16 Pro Max」「MacBook Pro」などをお試しください。'
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: '検索中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
