import { Product } from './types';

// 新品商品のモックデータ
export const mockNewProducts: Record<string, Product[]> = {
  'ロレックス サブマリーナ': [
    {
      id: '1',
      name: 'ロレックス サブマリーナ デイト 126610LN 新品',
      price: 1580000,
      imageUrl: '/placeholder-rolex.jpg',
      shopName: '高級時計専門店',
      condition: 'new'
    },
    {
      id: '2',
      name: 'ロレックス サブマリーナ ノンデイト 124060 新品',
      price: 1420000,
      imageUrl: '/placeholder-rolex.jpg',
      shopName: 'ブランド時計館',
      condition: 'new'
    },
    {
      id: '3',
      name: 'ロレックス サブマリーナ グリーン 126610LV 新品',
      price: 2180000,
      imageUrl: '/placeholder-rolex.jpg',
      shopName: 'ラグジュアリーウォッチ',
      condition: 'new'
    }
  ],
  'エルメス バーキン': [
    {
      id: '4',
      name: 'エルメス バーキン30 トゴ ブラック 新品',
      price: 2800000,
      imageUrl: '/placeholder-hermes.jpg',
      shopName: 'エルメス専門店',
      condition: 'new'
    },
    {
      id: '5',
      name: 'エルメス バーキン25 エプソン ゴールド 新品',
      price: 3200000,
      imageUrl: '/placeholder-hermes.jpg',
      shopName: 'ブランドバッグ館',
      condition: 'new'
    }
  ],
  'iPhone 16 Pro Max': [
    {
      id: '6',
      name: 'iPhone 16 Pro Max 1TB ナチュラルチタニウム 新品',
      price: 234800,
      imageUrl: '/placeholder-iphone.jpg',
      shopName: 'Apple公式',
      condition: 'new'
    },
    {
      id: '7',
      name: 'iPhone 16 Pro Max 512GB ブラックチタニウム 新品',
      price: 204800,
      imageUrl: '/placeholder-iphone.jpg',
      shopName: 'Apple公式',
      condition: 'new'
    }
  ],
  'MacBook Pro': [
    {
      id: '8',
      name: 'MacBook Pro 16インチ M4 Max 新品',
      price: 548000,
      imageUrl: '/placeholder-macbook.jpg',
      shopName: 'Apple公式',
      condition: 'new'
    }
  ]
};

// 中古相場のモックデータ（価格リスト）
export const mockUsedPrices: Record<string, number[]> = {
  'ロレックス サブマリーナ': [
    1450000, 1480000, 1520000, 1380000, 1550000, 1490000,
    1460000, 1510000, 1475000, 1500000, 1485000, 1495000,
    1470000, 1505000, 1488000, 1492000, 1478000, 1512000,
    1465000, 1498000, 1482000, 1508000, 1472000, 1502000,
    // 外れ値
    980000, 2200000
  ],
  'エルメス バーキン': [
    3200000, 3450000, 3380000, 3520000, 3290000, 3410000,
    3350000, 3480000, 3370000, 3420000, 3390000, 3460000,
    3340000, 3440000, 3360000, 3430000, 3385000, 3455000,
    3365000, 3445000, 3375000, 3465000, 3355000, 3435000,
    // 外れ値
    2500000, 4800000
  ],
  'iPhone 16 Pro Max': [
    185000, 192000, 188000, 195000, 190000, 193000,
    189000, 191000, 187000, 194000, 186000, 196000,
    184000, 197000, 183000, 198000, 182000, 199000,
    181000, 200000, 180000, 201000, 179000, 202000,
    // 外れ値
    120000, 230000
  ],
  'MacBook Pro': [
    420000, 435000, 428000, 442000, 425000, 438000,
    430000, 440000, 427000, 437000, 432000, 441000,
    426000, 439000, 429000, 436000, 431000, 443000,
    424000, 444000, 423000, 445000, 422000, 446000,
    // 外れ値
    350000, 520000
  ]
};

// キーワード検索関数
export function searchProducts(keyword: string): Product[] {
  const normalizedKeyword = keyword.toLowerCase().trim();

  // 完全一致を優先
  for (const [key, products] of Object.entries(mockNewProducts)) {
    if (key.toLowerCase().includes(normalizedKeyword) || normalizedKeyword.includes(key.toLowerCase())) {
      return products;
    }
  }

  // 部分一致
  const results: Product[] = [];
  for (const products of Object.values(mockNewProducts)) {
    for (const product of products) {
      if (product.name.toLowerCase().includes(normalizedKeyword)) {
        results.push(product);
      }
    }
  }

  return results;
}

// 中古価格リストを取得
export function getUsedPrices(keyword: string): number[] {
  const normalizedKeyword = keyword.toLowerCase().trim();

  for (const [key, prices] of Object.entries(mockUsedPrices)) {
    if (key.toLowerCase().includes(normalizedKeyword) || normalizedKeyword.includes(key.toLowerCase())) {
      return prices;
    }
  }

  // デフォルトのフォールバック（キーワードに該当するデータがない場合）
  return [];
}
