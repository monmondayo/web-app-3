import { NextRequest, NextResponse } from 'next/server';
import { getUsedPrices } from '@/lib/mockData';
import { calculateResaleValue } from '@/lib/resaleCalculator';

/**
 * 新品価格から推定リセール価格を生成
 * 70-85%の範囲で24件のサンプルデータを生成
 */
function generateEstimatedUsedPrices(newPrice: number): number[] {
  const baseResaleRate = 0.75; // 基準リセール率75%
  const variance = 0.1; // ±10%の変動

  return Array.from({ length: 24 }, () => {
    // 70-85%の範囲でランダムに生成
    const rate = baseResaleRate + (Math.random() - 0.5) * variance;
    return Math.round(newPrice * rate);
  });
}

/**
 * リセールバリュー計算API
 * GET /api/resale?keyword=ロレックス&price=1000000
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    const priceParam = searchParams.get('price');

    if (!keyword) {
      return NextResponse.json(
        { error: 'キーワードを指定してください' },
        { status: 400 }
      );
    }

    // 中古価格リストを取得（本番環境では中古専門サイトのAPIを呼び出す）
    let usedPrices = getUsedPrices(keyword);
    let dataSource = 'actual'; // データソース: actual (実データ) or estimated (推定)

    // 中古相場データが見つからない場合、新品価格から推定
    if (usedPrices.length === 0) {
      if (!priceParam) {
        return NextResponse.json(
          {
            error: '中古相場データが見つかりませんでした',
            message: 'このキーワードの中古相場データはまだ登録されていません。商品価格を指定してください。'
          },
          { status: 404 }
        );
      }

      const newPrice = parseInt(priceParam);
      if (isNaN(newPrice) || newPrice <= 0) {
        return NextResponse.json(
          { error: '有効な価格を指定してください' },
          { status: 400 }
        );
      }

      // 新品価格から推定リセール価格を生成
      usedPrices = generateEstimatedUsedPrices(newPrice);
      dataSource = 'estimated';
    }

    // リセールバリューを計算
    const analysis = calculateResaleValue(usedPrices);

    return NextResponse.json({
      success: true,
      analysis,
      rawDataCount: usedPrices.length,
      dataSource,
      message: dataSource === 'estimated'
        ? '実際の中古相場データが見つからなかったため、新品価格の70-85%で推定リセール価格を算出しました。'
        : undefined
    });
  } catch (error) {
    console.error('Resale API error:', error);
    return NextResponse.json(
      {
        error: 'リセールバリュー計算中にエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
