import { ResaleAnalysis, JissitsuTadaResult } from './types';

/**
 * リセールバリューを計算する関数
 *
 * ロジック:
 * 1. 価格リストを昇順にソート
 * 2. 上位10%と下位10%を除外（外れ値除去）
 * 3. 残ったデータの中央値を推定リセールバリューとする
 * 4. 標準偏差を計算してボラティリティを判定
 */
export function calculateResaleValue(priceList: number[]): ResaleAnalysis {
  if (priceList.length === 0) {
    throw new Error('価格データがありません');
  }

  // 1. 昇順にソート
  const sortedPrices = [...priceList].sort((a, b) => a - b);

  // 2. 外れ値除外（上位10%と下位10%を削除）
  const removeCount = Math.floor(sortedPrices.length * 0.1);
  const cleanedPrices = sortedPrices.slice(removeCount, sortedPrices.length - removeCount);

  if (cleanedPrices.length === 0) {
    throw new Error('有効な価格データが不足しています');
  }

  // 3. 中央値を計算
  const median = calculateMedian(cleanedPrices);

  // 4. 標準偏差を計算
  const stdDev = calculateStandardDeviation(cleanedPrices);

  // 5. ボラティリティを判定（変動係数 CV = 標準偏差 / 平均）
  const mean = cleanedPrices.reduce((sum, price) => sum + price, 0) / cleanedPrices.length;
  const cv = stdDev / mean;

  let volatility: 'low' | 'medium' | 'high';
  if (cv < 0.05) {
    volatility = 'low';
  } else if (cv < 0.15) {
    volatility = 'medium';
  } else {
    volatility = 'high';
  }

  return {
    estimatedResaleValue: Math.round(median),
    priceList: cleanedPrices,
    standardDeviation: Math.round(stdDev),
    volatility,
    dataPoints: cleanedPrices.length
  };
}

/**
 * 中央値を計算
 */
function calculateMedian(numbers: number[]): number {
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  } else {
    return sorted[middle];
  }
}

/**
 * 標準偏差を計算
 */
function calculateStandardDeviation(numbers: number[]): number {
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  return Math.sqrt(variance);
}

/**
 * 「実質タダ」を計算する関数
 */
export function calculateJissitsuTada(
  itemPrice: number,
  estimatedResaleValue: number,
  yearsOfUse: number
): JissitsuTadaResult {
  // 実質コスト = 購入価格 - リセールバリュー
  const actualCost = itemPrice - estimatedResaleValue;

  // 日割りコスト = 実質コスト ÷ (年数 × 365日)
  const dailyCost = actualCost / (yearsOfUse * 365);

  // 比較対象を決定
  const comparison = getComparison(dailyCost);
  const savingsMessage = getSavingsMessage(actualCost, itemPrice);

  return {
    itemPrice,
    estimatedResaleValue,
    yearsOfUse,
    dailyCost: Math.round(dailyCost),
    comparison,
    savingsMessage
  };
}

/**
 * 日割りコストに応じた比較対象を返す
 */
function getComparison(dailyCost: number): string {
  if (dailyCost < 100) {
    return '缶コーヒーより安い';
  } else if (dailyCost < 300) {
    return 'コンビニ弁当1個より安い';
  } else if (dailyCost < 500) {
    return 'スタバのラテより安い';
  } else if (dailyCost < 1000) {
    return 'ランチ1回より安い';
  } else if (dailyCost < 3000) {
    return '居酒屋1回より安い';
  } else {
    return 'ディナー1回程度';
  }
}

/**
 * 節約メッセージを生成
 */
function getSavingsMessage(actualCost: number, itemPrice: number): string {
  const savingsRate = ((itemPrice - actualCost) / itemPrice * 100).toFixed(1);

  if (actualCost <= 0) {
    return '資産として増える可能性があります';
  } else if (parseFloat(savingsRate) > 80) {
    return `購入金額の${savingsRate}%が戻ってくる計算です`;
  } else if (parseFloat(savingsRate) > 50) {
    return `半分以上の価値が保たれます`;
  } else {
    return `使用後も${savingsRate}%の価値が残ります`;
  }
}

/**
 * 価格分布データを生成（Recharts用）
 */
export function generatePriceDistribution(priceList: number[]) {
  if (priceList.length === 0) return [];

  const min = Math.min(...priceList);
  const max = Math.max(...priceList);
  const range = max - min;
  const binCount = Math.min(10, Math.floor(priceList.length / 3)); // ビン数
  const binSize = range / binCount;

  const bins = Array(binCount).fill(0).map((_, i) => {
    const rangeMin = min + binSize * i;
    const rangeMax = min + binSize * (i + 1);
    const rangeMinMan = Math.round(rangeMin / 10000);
    const rangeMaxMan = Math.round(rangeMax / 10000);

    return {
      range: `${rangeMinMan}-${rangeMaxMan}万`,
      count: 0,
      minPrice: rangeMin,
      maxPrice: rangeMax
    };
  });

  priceList.forEach(price => {
    const binIndex = Math.min(
      Math.floor((price - min) / binSize),
      binCount - 1
    );
    bins[binIndex].count++;
  });

  return bins;
}
