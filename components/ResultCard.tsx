'use client';

import React, { useRef } from 'react';
import { domToPng } from 'modern-screenshot';
import { Download, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { JissitsuTadaResult, ResaleAnalysis } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generatePriceDistribution } from '@/lib/resaleCalculator';

interface ResultCardProps {
  result: JissitsuTadaResult;
  analysis: ResaleAnalysis;
  productName: string;
}

export default function ResultCard({ result, analysis, productName }: ResultCardProps) {
  const resultRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!resultRef.current) return;

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
    <div className="space-y-6">
      {/* ダウンロード可能な結果カード */}
      <div
        ref={resultRef}
        className="bg-white border-2 border-indigo-300 rounded-2xl p-8 shadow-2xl"
      >
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-indigo-600 text-2xl">✨</span>
            <h2 className="text-3xl font-serif text-indigo-900 tracking-wide">
              実質タダ電卓 Pro
            </h2>
            <span className="text-indigo-600 text-2xl">✨</span>
          </div>
          <p className="text-sm text-indigo-600 font-serif">リセールバリュー分析</p>
        </div>

        {/* 商品名 */}
        <div className="mb-6 text-center">
          <p className="text-gray-800 text-lg font-serif">{productName}</p>
        </div>

        {/* メイン結果 */}
        <div className="bg-indigo-600 border border-indigo-500 rounded-xl p-6 mb-6 shadow-lg">
          <div className="text-center mb-4">
            <p className="text-indigo-200 text-sm mb-2 font-serif">1日あたりのコスト</p>
            <p className="text-white text-6xl font-bold mb-2">
              ¥{result.dailyCost.toLocaleString()}
            </p>
            <p className="text-indigo-100 text-2xl font-serif">{result.comparison}</p>
          </div>

          <div className="border-t border-indigo-400 pt-4 mt-4">
            <p className="text-white text-center text-lg font-serif">
              {result.savingsMessage}
            </p>
          </div>
        </div>

        {/* 詳細情報 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-indigo-200 rounded-lg p-4 shadow">
            <p className="text-indigo-600 text-xs mb-1 font-serif">購入価格</p>
            <p className="text-gray-900 text-xl font-bold">
              ¥{result.itemPrice.toLocaleString()}
            </p>
          </div>
          <div className="bg-white border border-indigo-200 rounded-lg p-4 shadow">
            <p className="text-indigo-600 text-xs mb-1 font-serif">推定リセール</p>
            <p className="text-gray-900 text-xl font-bold">
              ¥{result.estimatedResaleValue.toLocaleString()}
            </p>
          </div>
          <div className="bg-white border border-indigo-200 rounded-lg p-4 shadow">
            <p className="text-indigo-600 text-xs mb-1 font-serif">使用期間</p>
            <p className="text-gray-900 text-xl font-bold">{result.yearsOfUse}年</p>
          </div>
          <div className="bg-white border border-indigo-200 rounded-lg p-4 shadow">
            <p className="text-indigo-600 text-xs mb-1 font-serif">実質コスト</p>
            <p className="text-gray-900 text-xl font-bold">
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

      {/* アクション */}
      <div className="flex gap-4">
        <button
          onClick={handleDownload}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
        >
          <Download className="w-5 h-5" />
          インスタに投稿する画像をダウンロード
        </button>
      </div>

      {/* 価格分布グラフ */}
      <div className="bg-white border border-indigo-200 rounded-2xl p-6 shadow-lg">
        <h3 className="text-gray-800 text-xl font-serif mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          中古相場の価格分布
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="range"
                stroke="#6366f1"
                style={{ fontSize: '12px' }}
                label={{ value: '価格帯', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                stroke="#6366f1"
                style={{ fontSize: '12px' }}
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
              <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-gray-700 space-y-1">
          <p>• データ件数: {analysis.dataPoints}件（外れ値除外済み）</p>
          <p>• 推定リセール: ¥{analysis.estimatedResaleValue.toLocaleString()}（中央値）</p>
          <p>• 標準偏差: ¥{analysis.standardDeviation.toLocaleString()}</p>
          <p className={volatilityColor[analysis.volatility]}>
            • 相場の安定性: {volatilityLabel[analysis.volatility]}
            {analysis.volatility === 'high' && ' - 価格変動が大きいため注意が必要です'}
          </p>
        </div>
      </div>
    </div>
  );
}
