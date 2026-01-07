import { NextRequest, NextResponse } from 'next/server';
import { getUsedPrices } from '@/lib/mockData';
import { calculateResaleValue } from '@/lib/resaleCalculator';

/**
 * リセールバリュー計算API
 * GET /api/resale?keyword=ロレックス
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

    // 中古価格リストを取得（本番環境では中古専門サイトのAPIを呼び出す）
    const usedPrices = getUsedPrices(keyword);

    if (usedPrices.length === 0) {
      return NextResponse.json(
        {
          error: '中古相場データが見つかりませんでした',
          message: 'このキーワードの中古相場データはまだ登録されていません'
        },
        { status: 404 }
      );
    }

    // リセールバリューを計算
    const analysis = calculateResaleValue(usedPrices);

    return NextResponse.json({
      success: true,
      analysis,
      rawDataCount: usedPrices.length
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
