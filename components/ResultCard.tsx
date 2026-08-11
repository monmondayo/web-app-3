'use client';

import React, { useRef } from 'react';
import { domToPng } from 'modern-screenshot';
import { Download, RotateCcw, TrendingUp } from 'lucide-react';
import { JissitsuTadaResult, ResaleAnalysis } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generatePriceDistribution } from '@/lib/resaleCalculator';

interface ResultCardProps {
  result: JissitsuTadaResult;
  analysis: ResaleAnalysis;
  productName: string;
  onReset: () => void;
}

export default function ResultCard({
  result,
  analysis,
  productName,
  onReset,
}: ResultCardProps) {
  const resultRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!resultRef.current) return;

    // 利用規約に関する確認
    const confirmed = window.confirm(
      '画像をダウンロードする前にご確認ください:\n\n' +
      '・この画像はあなた個人の使用のためにのみダウンロードできます\n' +
      '・SNS等への投稿は自己責任でお願いします\n' +
      '・商用利用や再配布は禁止されています\n\n' +
      '上記を理解した上でダウンロードしますか？'
    );

    if (!confirmed) return;

    try {
      // Google Fontsの読み込みを待つ
      await document.fonts.ready;

      // modern-screenshotを使用して画像を生成
      const dataUrl = await domToPng(resultRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        style: {
          background: '#ffffff',
          backgroundImage: 'none',
        },
      });

      const link = document.createElement('a');
      link.download = `実質タダ電卓_${productName.replace(/[/\\?%*:|"<>]/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('画像生成エラー詳細:', error);
      if (error instanceof Error) {
        alert(`画像の生成に失敗しました: ${error.message}\n\nブラウザのコンソールで詳細をご確認ください。`);
      } else {
        alert('画像の生成に失敗しました。もう一度お試しください。');
      }
    }
  };

  const distributionData = generatePriceDistribution(analysis.priceList);

  const volatilityLabel = {
    low: '安定',
    medium: '普通',
    high: '変動あり'
  };

  const volatilityColor = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-red-400'
  };

  return (
    <div className="space-y-3 lg:grid lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-3 lg:space-y-0">
      {/* ダウンロード可能な結果カード */}
      <div
        ref={resultRef}
        className="bg-white border-2 border-indigo-300 rounded-2xl p-4 shadow-xl lg:min-h-0 lg:overflow-hidden"
      >
        {/* ヘッダー */}
        <div className="mb-3 text-center">
          <div className="mb-1 flex items-center justify-center gap-2">
            <span className="text-lg text-indigo-600">✨</span>
            <h2 className="font-serif text-xl tracking-wide text-indigo-900 md:text-2xl">
              実質タダ電卓
            </h2>
            <span className="text-lg text-indigo-600">✨</span>
          </div>
          <p className="font-serif text-xs text-indigo-600">リセールバリュー分析</p>
        </div>

        {/* 商品名 */}
        <div className="mb-3 text-center">
          <p className="line-clamp-2 break-words px-2 font-serif text-sm leading-relaxed text-gray-800 md:text-base">
            {productName}
          </p>
        </div>

        {/* メイン結果 */}
        <div className="mb-3 rounded-xl border border-indigo-500 bg-indigo-600 p-3 shadow-lg md:p-4">
          <div className="mb-2 text-center">
            <p className="mb-1 font-serif text-xs text-indigo-200">1日あたりのコスト</p>
            <p className="mb-1 text-4xl font-bold text-white lg:text-5xl">
              ¥{result.dailyCost.toLocaleString()}
            </p>
            <p className="font-serif text-base text-indigo-100 md:text-lg">{result.comparison}</p>
          </div>

          <div className="mt-2 border-t border-indigo-400 pt-2">
            <p className="text-center font-serif text-sm text-white md:text-base">
              {result.savingsMessage}
            </p>
          </div>
        </div>

        {/* 詳細情報 */}
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-indigo-200 bg-white p-3 shadow-sm">
            <p className="text-indigo-600 text-xs mb-1 font-serif">購入価格</p>
            <p className="text-base font-bold text-gray-900 md:text-lg">
              ¥{result.itemPrice.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-indigo-200 bg-white p-3 shadow-sm">
            <p className="text-indigo-600 text-xs mb-1 font-serif">推定リセール</p>
            <p className="text-base font-bold text-gray-900 md:text-lg">
              ¥{result.estimatedResaleValue.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-indigo-200 bg-white p-3 shadow-sm">
            <p className="text-indigo-600 text-xs mb-1 font-serif">使用期間</p>
            <p className="text-base font-bold text-gray-900 md:text-lg">{result.yearsOfUse}年</p>
          </div>
          <div className="rounded-lg border border-indigo-200 bg-white p-3 shadow-sm">
            <p className="text-indigo-600 text-xs mb-1 font-serif">実質コスト</p>
            <p className="text-base font-bold text-gray-900 md:text-lg">
              ¥{(result.itemPrice - result.estimatedResaleValue).toLocaleString()}
            </p>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center">
          <p className="text-gray-600 text-xs font-serif">
            ※中古相場データ {analysis.dataPoints}件 を分析 |
            相場の安定性: <span className={volatilityColor[analysis.volatility]}>
              {volatilityLabel[analysis.volatility]}
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-3 lg:flex lg:min-h-0 lg:flex-col">
        {/* 価格分布グラフ */}
        <div className="rounded-2xl border border-indigo-200 bg-white p-4 shadow-lg lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          <h3 className="mb-2 flex items-center gap-2 font-serif text-lg text-gray-800">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            中古相場の価格分布
          </h3>
          <div className="h-52 lg:min-h-[180px] lg:flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 4, right: 8, bottom: 4, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="range"
                  stroke="#6366f1"
                  style={{ fontSize: '11px' }}
                  label={{ value: '価格帯', position: 'insideBottom', offset: -3 }}
                />
                <YAxis
                  stroke="#6366f1"
                  style={{ fontSize: '11px' }}
                  label={{ value: '件数', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #c7d2fe',
                    borderRadius: '8px',
                    color: '#1f2937'
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-xs text-gray-700 sm:grid-cols-2">
            <p>• データ件数: {analysis.dataPoints}件（外れ値除外済み）</p>
            <p>• 推定リセール: ¥{analysis.estimatedResaleValue.toLocaleString()}（中央値）</p>
            <p>• 標準偏差: ¥{analysis.standardDeviation.toLocaleString()}</p>
            <p className={volatilityColor[analysis.volatility]}>
              • 相場の安定性: {volatilityLabel[analysis.volatility]}
              {analysis.volatility === 'high' && '（価格変動に注意）'}
            </p>
          </div>
        </div>

        {/* アクション */}
        <div className="shrink-0 space-y-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-indigo-700"
            >
              <Download className="h-4 w-4" />
              投稿画像をダウンロード
            </button>
            <button
              onClick={onReset}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-indigo-300 bg-white px-4 py-3 font-serif text-sm text-indigo-600 shadow-sm transition-colors hover:bg-indigo-50"
            >
              <RotateCcw className="h-4 w-4" />
              別の商品で計算する
            </button>
          </div>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2">
            <p className="text-xs leading-relaxed text-yellow-800">
              ⚠️ 画像の使用は自己責任でお願いします。商用利用や再配布は禁止されています。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
