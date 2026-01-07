// 商品データの型定義
export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  shopName: string;
  condition: 'new' | 'used';
}

// リセールバリュー計算結果の型定義
export interface ResaleAnalysis {
  estimatedResaleValue: number;
  priceList: number[];
  standardDeviation: number;
  volatility: 'low' | 'medium' | 'high';
  dataPoints: number;
}

// 「実質タダ」計算結果の型定義
export interface JissitsuTadaResult {
  itemPrice: number;
  estimatedResaleValue: number;
  yearsOfUse: number;
  dailyCost: number;
  comparison: string;
  savingsMessage: string;
}
