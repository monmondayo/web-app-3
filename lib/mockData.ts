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
  ],
  'ニコン Z9': [
    {
      id: '9',
      name: 'ニコン Z9 ボディ 新品',
      price: 698000,
      imageUrl: '/placeholder-nikon.jpg',
      shopName: 'カメラのキタムラ',
      condition: 'new'
    }
  ],
  'ニコン Z8': [
    {
      id: '10',
      name: 'ニコン Z8 ボディ 新品',
      price: 548000,
      imageUrl: '/placeholder-nikon.jpg',
      shopName: 'カメラのキタムラ',
      condition: 'new'
    }
  ],
  'ニコン Z': [
    {
      id: '11',
      name: 'ニコン Z9 ボディ 新品',
      price: 698000,
      imageUrl: '/placeholder-nikon.jpg',
      shopName: 'カメラのキタムラ',
      condition: 'new'
    },
    {
      id: '12',
      name: 'ニコン Z8 ボディ 新品',
      price: 548000,
      imageUrl: '/placeholder-nikon.jpg',
      shopName: 'カメラのキタムラ',
      condition: 'new'
    },
    {
      id: '13',
      name: 'ニコン Z6III ボディ 新品',
      price: 348000,
      imageUrl: '/placeholder-nikon.jpg',
      shopName: 'ヨドバシカメラ',
      condition: 'new'
    }
  ],
  'ソニー α7R V': [
    {
      id: '14',
      name: 'ソニー α7R V ILCE-7RM5 ボディ 新品',
      price: 548000,
      imageUrl: '/placeholder-sony.jpg',
      shopName: 'ソニーストア',
      condition: 'new'
    }
  ],
  'キヤノン EOS R5': [
    {
      id: '15',
      name: 'キヤノン EOS R5 Mark II ボディ 新品',
      price: 628000,
      imageUrl: '/placeholder-canon.jpg',
      shopName: 'キヤノンオンラインショップ',
      condition: 'new'
    }
  ],
  'ルイヴィトン': [
    {
      id: '16',
      name: 'ルイヴィトン ネヴァーフルMM モノグラム 新品',
      price: 280000,
      imageUrl: '/placeholder-lv.jpg',
      shopName: 'ルイヴィトン公式',
      condition: 'new'
    },
    {
      id: '17',
      name: 'ルイヴィトン スピーディ30 モノグラム 新品',
      price: 198000,
      imageUrl: '/placeholder-lv.jpg',
      shopName: 'ルイヴィトン公式',
      condition: 'new'
    }
  ],
  'シャネル': [
    {
      id: '18',
      name: 'シャネル マトラッセ チェーンショルダー 新品',
      price: 980000,
      imageUrl: '/placeholder-chanel.jpg',
      shopName: 'シャネル ブティック',
      condition: 'new'
    },
    {
      id: '19',
      name: 'シャネル ボーイシャネル ミディアム 新品',
      price: 850000,
      imageUrl: '/placeholder-chanel.jpg',
      shopName: 'シャネル ブティック',
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
  ],
  'ニコン Z9': [
    580000, 595000, 588000, 602000, 585000, 598000,
    590000, 600000, 587000, 597000, 592000, 601000,
    586000, 599000, 589000, 596000, 591000, 603000,
    584000, 604000, 583000, 605000, 582000, 606000,
    // 外れ値
    480000, 680000
  ],
  'ニコン Z8': [
    450000, 465000, 458000, 472000, 455000, 468000,
    460000, 470000, 457000, 467000, 462000, 471000,
    456000, 469000, 459000, 466000, 461000, 473000,
    454000, 474000, 453000, 475000, 452000, 476000,
    // 外れ値
    380000, 530000
  ],
  'ニコン Z': [
    450000, 465000, 458000, 472000, 455000, 468000,
    460000, 470000, 457000, 467000, 462000, 471000,
    456000, 469000, 459000, 466000, 461000, 473000,
    454000, 474000, 453000, 475000, 452000, 476000,
    // 外れ値
    380000, 530000
  ],
  'ソニー α7R V': [
    445000, 460000, 453000, 467000, 450000, 463000,
    455000, 465000, 452000, 462000, 457000, 466000,
    451000, 464000, 454000, 461000, 456000, 468000,
    449000, 469000, 448000, 470000, 447000, 471000,
    // 外れ値
    370000, 520000
  ],
  'キヤノン EOS R5': [
    520000, 535000, 528000, 542000, 525000, 538000,
    530000, 540000, 527000, 537000, 532000, 541000,
    526000, 539000, 529000, 536000, 531000, 543000,
    524000, 544000, 523000, 545000, 522000, 546000,
    // 外れ値
    450000, 610000
  ],
  'ルイヴィトン': [
    235000, 248000, 241000, 255000, 238000, 251000,
    243000, 253000, 240000, 250000, 245000, 254000,
    239000, 252000, 242000, 249000, 244000, 256000,
    237000, 257000, 236000, 258000, 234000, 259000,
    // 外れ値
    180000, 290000
  ],
  'シャネル': [
    820000, 845000, 833000, 857000, 828000, 850000,
    835000, 855000, 831000, 848000, 838000, 858000,
    829000, 852000, 834000, 847000, 837000, 860000,
    826000, 862000, 824000, 864000, 822000, 866000,
    // 外れ値
    720000, 950000
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
