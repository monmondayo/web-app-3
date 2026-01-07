'use client';

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
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
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        logging: false
      });

      const link = document.createElement('a');
      link.download = `実質タダ電卓_${productName}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('画像生成エラー:', error);
      alert('画像の生成に失敗しました');
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
        className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-yellow-600 rounded-2xl p-8 shadow-2xl"
      >
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <h2 className="text-3xl font-serif text-yellow-500 tracking-wider">
              実質タダ電卓 Pro
            </h2>
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-sm text-yellow-600 font-serif">Nagoya Vibe Edition</p>
        </div>

        {/* 商品名 */}
        <div className="mb-6 text-center">
          <p className="text-white text-lg font-serif">{productName}</p>
        </div>

        {/* メイン結果 */}
        <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-600 rounded-xl p-6 mb-6">
          <div className="text-center mb-4">
            <p className="text-yellow-400 text-sm mb-2 font-serif">1日あたりのコスト</p>
            <p className="text-white text-6xl font-bold mb-2">
              ¥{result.dailyCost.toLocaleString()}
            </p>
            <p className="text-yellow-300 text-2xl font-serif">{result.comparison}</p>
          </div>

          <div className="border-t border-yellow-700 pt-4 mt-4">
            <p className="text-yellow-200 text-center text-lg font-serif">
              {result.savingsMessage}
            </p>
          </div>
        </div>

        {/* 詳細情報 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/40 border border-yellow-700/50 rounded-lg p-4">
            <p className="text-yellow-600 text-xs mb-1 font-serif">購入価格</p>
            <p className="text-white text-xl font-bold">
              ¥{result.itemPrice.toLocaleString()}
            </p>
          </div>
          <div className="bg-black/40 border border-yellow-700/50 rounded-lg p-4">
            <p className="text-yellow-600 text-xs mb-1 font-serif">推定リセール</p>
            <p className="text-white text-xl font-bold">
              ¥{result.estimatedResaleValue.toLocaleString()}
            </p>
          </div>
          <div className="bg-black/40 border border-yellow-700/50 rounded-lg p-4">
            <p className="text-yellow-600 text-xs mb-1 font-serif">使用期間</p>
            <p className="text-white text-xl font-bold">{result.yearsOfUse}年</p>
          </div>
          <div className="bg-black/40 border border-yellow-700/50 rounded-lg p-4">
            <p className="text-yellow-600 text-xs mb-1 font-serif">実質コスト</p>
            <p className="text-white text-xl font-bold">
              ¥{(result.itemPrice - result.estimatedResaleValue).toLocaleString()}
            </p>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center">
          <p className="text-yellow-700 text-xs font-serif">
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
          className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-black font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
        >
          <Download className="w-5 h-5" />
          インスタに投稿する画像をダウンロード
        </button>
      </div>

      {/* 価格分布グラフ */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-700/30 rounded-2xl p-6">
        <h3 className="text-yellow-500 text-xl font-serif mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          中古相場の価格分布
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis
                dataKey="range"
                stroke="#ca8a04"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#ca8a04" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #ca8a04',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="count" fill="#ca8a04" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-gray-400 space-y-1">
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
