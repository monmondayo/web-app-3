'use client';

import React, { useState } from 'react';
import { Search, Sparkles, Calculator, Crown, PenLine, List, TrendingUp, ExternalLink } from 'lucide-react';
import { Product, ResaleAnalysis, JissitsuTadaResult } from '@/lib/types';
import { calculateJissitsuTada, calculateResaleValue } from '@/lib/resaleCalculator';
import ResultCard from '@/components/ResultCard';

type SearchMode = 'search' | 'manual';

export default function Home() {
  const [searchMode, setSearchMode] = useState<SearchMode>('search');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    rakuten: Product[];
    amazon: Product[];
    yahoo: Product[];
    mock: Product[];
  }>({ rakuten: [], amazon: [], yahoo: [], mock: [] });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [yearsOfUse, setYearsOfUse] = useState(10);
  const [result, setResult] = useState<{
    calculation: JissitsuTadaResult;
    analysis: ResaleAnalysis;
  } | null>(null);
  const [error, setError] = useState<string>('');
  const [infoMessage, setInfoMessage] = useState<string>('');

  // 手動入力用のstate
  const [manualProductName, setManualProductName] = useState('');
  const [manualNewPrice, setManualNewPrice] = useState('');
  const [manualUsedPrice, setManualUsedPrice] = useState('');

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError('キーワードを入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setInfoMessage('');
    setSearchResults({ rakuten: [], amazon: [], yahoo: [], mock: [] });
    setSelectedProduct(null);
    setResult(null);

    try {
      const response = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '検索に失敗しました');
      }

      setSearchResults({
        rakuten: data.rakuten || [],
        amazon: data.amazon || [],
        yahoo: data.yahoo || [],
        mock: data.mock || []
      });

      const totalResults = (data.rakuten?.length || 0) + (data.amazon?.length || 0) + (data.yahoo?.length || 0) + (data.mock?.length || 0);

      if (totalResults === 0) {
        setError('商品が見つかりませんでした');
      } else if (data.message) {
        setInfoMessage(data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '検索中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setError('');
    setResult(null);
  };

  const handleCalculate = async () => {
    if (!selectedProduct) return;

    setLoading(true);
    setError('');

    try {
      // リセールバリューを取得（商品価格も渡す）
      const response = await fetch(
        `/api/resale?keyword=${encodeURIComponent(keyword)}&price=${selectedProduct.price}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'リセールバリューの取得に失敗しました');
      }

      // 実質タダを計算
      const calculation = calculateJissitsuTada(
        selectedProduct.price,
        data.analysis.estimatedResaleValue,
        yearsOfUse
      );

      setResult({
        calculation,
        analysis: data.analysis
      });

      // 推定データの場合は情報メッセージを表示
      if (data.message) {
        setInfoMessage(data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '計算中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCalculate = () => {
    // バリデーション
    if (!manualProductName.trim()) {
      setError('商品名を入力してください');
      return;
    }
    if (!manualNewPrice || parseFloat(manualNewPrice) <= 0) {
      setError('有効な新品価格を入力してください');
      return;
    }
    if (!manualUsedPrice || parseFloat(manualUsedPrice) <= 0) {
      setError('有効な推定リセール価格を入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const newPrice = parseFloat(manualNewPrice);
      const usedPrice = parseFloat(manualUsedPrice);

      // 簡易的な中古相場データを生成（±5%のバラつき）
      const mockUsedPrices = Array.from({ length: 24 }, (_, i) => {
        const variance = (Math.random() - 0.5) * 0.1; // -5% ~ +5%
        return Math.round(usedPrice * (1 + variance));
      });

      // 外れ値を追加
      mockUsedPrices.push(Math.round(usedPrice * 0.7)); // 低い外れ値
      mockUsedPrices.push(Math.round(usedPrice * 1.3)); // 高い外れ値

      // リセールバリューを計算
      const analysis = calculateResaleValue(mockUsedPrices);

      // 実質タダを計算
      const calculation = calculateJissitsuTada(
        newPrice,
        analysis.estimatedResaleValue,
        yearsOfUse
      );

      // 疑似商品オブジェクトを作成
      setSelectedProduct({
        id: 'manual',
        name: manualProductName,
        price: newPrice,
        imageUrl: '',
        shopName: '手動入力',
        condition: 'new',
        url: '#'
      });

      setResult({
        calculation,
        analysis
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '計算中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const exampleKeywords = [
    'ロレックス サブマリーナ',
    'エルメス バーキン',
    'ニコン Z9',
    'iPhone 16 Pro Max',
    'MacBook Pro',
    'シャネル'
  ];

  return (
    <div className="min-h-screen text-gray-900">
      {/* ヘッダー */}
      <header className="border-b border-indigo-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-serif text-indigo-900 tracking-wide">
              実質タダ電卓 Pro
            </h1>
            <Sparkles className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="text-center text-indigo-600 mt-2 font-serif text-sm">
            リセールバリューで賢い買い物を可視化
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* イントロ */}
        {!result && (
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-serif text-gray-800">
                リセールバリューで「実質タダ」を証明
              </h2>
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              欲しい高級品を検索すると、中古相場データから推定リセールバリューを自動計算。
              購入価格との差額を日割りで表示し、「実質タダ」であることを数字で証明します。
            </p>
          </div>
        )}

        {/* モード切り替えタブ */}
        {!result && (
          <div className="flex gap-2 mb-6 justify-center">
            <button
              onClick={() => setSearchMode('search')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-serif transition-all ${
                searchMode === 'search'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200'
              }`}
            >
              <List className="w-4 h-4" />
              商品を検索
            </button>
            <button
              onClick={() => setSearchMode('manual')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-serif transition-all ${
                searchMode === 'manual'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200'
              }`}
            >
              <PenLine className="w-4 h-4" />
              手動で入力
            </button>
          </div>
        )}

        {/* 検索モード */}
        {searchMode === 'search' && !result && (
          <>
            <div className="bg-white border border-indigo-200 rounded-2xl p-8 shadow-lg mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xl font-serif text-gray-800">商品を検索</h3>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="例: ロレックス サブマリーナ"
                    className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold px-8 py-3 rounded-lg transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-md"
                  >
                    {loading ? '検索中...' : '検索'}
                  </button>
                </div>

                {/* 例示キーワード */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-gray-500 text-sm">試してみる:</span>
                  {exampleKeywords.map((kw) => (
                    <button
                      key={kw}
                      onClick={() => setKeyword(kw)}
                      className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200 transition-colors"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>

              {/* エラー表示 */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* 情報メッセージ */}
              {infoMessage && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700 text-sm">{infoMessage}</p>
                </div>
              )}
            </div>

            {/* 検索結果 - 3列レイアウト */}
            {(searchResults.rakuten.length > 0 || searchResults.amazon.length > 0 || searchResults.yahoo.length > 0 || searchResults.mock.length > 0) && !selectedProduct && (
              <div className="mb-8">
                <h3 className="text-2xl font-serif text-gray-800 mb-6 text-center">検索結果</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 楽天市場 */}
                  <div className="bg-white border-2 border-red-200 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="bg-red-50 text-red-700 px-4 py-2 rounded-full font-serif text-sm border border-red-200">
                        楽天市場
                      </span>
                    </div>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {searchResults.rakuten.length > 0 ? (
                        searchResults.rakuten.map((product) => (
                          <div key={product.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <h4 className="text-gray-900 font-serif text-sm mb-2 line-clamp-2">{product.name}</h4>
                            <p className="text-indigo-600 font-bold text-lg mb-2">¥{product.price.toLocaleString()}</p>
                            <div className="flex gap-2">
                              {product.url !== '#' && (
                                <a href={product.affiliateUrl || product.url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white border border-red-300 text-red-700 px-3 py-1.5 rounded text-xs text-center hover:bg-red-50">
                                  詳細
                                </a>
                              )}
                              <button onClick={() => handleSelectProduct(product)} className="flex-1 bg-red-600 text-white px-3 py-1.5 rounded text-xs hover:bg-red-700">
                                計算
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8 text-sm">商品が見つかりませんでした</p>
                      )}
                    </div>
                  </div>

                  {/* Amazon */}
                  <div className="bg-white border-2 border-orange-200 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="bg-orange-50 text-orange-700 px-4 py-2 rounded-full font-serif text-sm border border-orange-200">
                        Amazon.co.jp
                      </span>
                    </div>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {searchResults.amazon.length > 0 ? (
                        searchResults.amazon.map((product) => (
                          <div key={product.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <h4 className="text-gray-900 font-serif text-sm mb-2 line-clamp-2">{product.name}</h4>
                            <p className="text-indigo-600 font-bold text-lg mb-2">¥{product.price.toLocaleString()}</p>
                            <div className="flex gap-2">
                              {product.url !== '#' && (
                                <a href={product.affiliateUrl || product.url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white border border-orange-300 text-orange-700 px-3 py-1.5 rounded text-xs text-center hover:bg-orange-50">
                                  詳細
                                </a>
                              )}
                              <button onClick={() => handleSelectProduct(product)} className="flex-1 bg-orange-600 text-white px-3 py-1.5 rounded text-xs hover:bg-orange-700">
                                計算
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8 text-sm">商品が見つかりませんでした</p>
                      )}
                    </div>
                  </div>

                  {/* Yahoo!ショッピング */}
                  <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full font-serif text-sm border border-purple-200">
                        Yahoo!ショッピング
                      </span>
                    </div>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {searchResults.yahoo.length > 0 ? (
                        searchResults.yahoo.map((product) => (
                          <div key={product.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <h4 className="text-gray-900 font-serif text-sm mb-2 line-clamp-2">{product.name}</h4>
                            <p className="text-indigo-600 font-bold text-lg mb-2">¥{product.price.toLocaleString()}</p>
                            <div className="flex gap-2">
                              {product.url !== '#' && (
                                <a href={product.affiliateUrl || product.url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white border border-purple-300 text-purple-700 px-3 py-1.5 rounded text-xs text-center hover:bg-purple-50">
                                  詳細
                                </a>
                              )}
                              <button onClick={() => handleSelectProduct(product)} className="flex-1 bg-purple-600 text-white px-3 py-1.5 rounded text-xs hover:bg-purple-700">
                                計算
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8 text-sm">商品が見つかりませんでした</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* モックデータの表示（すべてのAPIが利用不可の場合） */}
                {searchResults.mock.length > 0 && (
                  <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="bg-gray-50 text-gray-700 px-4 py-2 rounded-full font-serif text-sm border border-gray-200">
                        モックデータ
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {searchResults.mock.map((product) => (
                        <div key={product.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <h4 className="text-gray-900 font-serif text-sm mb-2 line-clamp-2">{product.name}</h4>
                          <p className="text-indigo-600 font-bold text-lg mb-2">¥{product.price.toLocaleString()}</p>
                          <button onClick={() => handleSelectProduct(product)} className="w-full bg-indigo-600 text-white px-3 py-1.5 rounded text-xs hover:bg-indigo-700">
                            計算
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* 手動入力モード */}
        {searchMode === 'manual' && !result && (
          <div className="bg-white border border-indigo-200 rounded-2xl p-8 shadow-lg mb-8">
            <div className="flex items-center gap-2 mb-6">
              <PenLine className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xl font-serif text-gray-800">商品情報を入力</h3>
            </div>

            <div className="space-y-6">
              {/* 商品名 */}
              <div>
                <label className="block text-gray-700 mb-2 text-sm font-serif">
                  商品名
                </label>
                <input
                  type="text"
                  value={manualProductName}
                  onChange={(e) => setManualProductName(e.target.value)}
                  placeholder="例: ニコン Z9 ボディ"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* 新品価格 */}
              <div>
                <label className="block text-gray-700 mb-2 text-sm font-serif">
                  新品価格（円）
                </label>
                <input
                  type="number"
                  value={manualNewPrice}
                  onChange={(e) => setManualNewPrice(e.target.value)}
                  placeholder="例: 698000"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* 推定リセール価格 */}
              <div>
                <label className="block text-gray-700 mb-2 text-sm font-serif">
                  推定リセール価格（円）
                </label>
                <input
                  type="number"
                  value={manualUsedPrice}
                  onChange={(e) => setManualUsedPrice(e.target.value)}
                  placeholder="例: 595000"
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
                <p className="text-gray-600 text-xs mt-2">
                  ※ ヤフオクやメルカリなどで同じ商品の中古相場を調べて入力してください
                </p>
              </div>

              {/* 使用年数 */}
              <div>
                <label className="block text-gray-700 mb-2 text-sm font-serif">
                  使用予定年数
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={yearsOfUse}
                  onChange={(e) => setYearsOfUse(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>1年</span>
                  <span className="text-indigo-600 font-bold text-lg">{yearsOfUse}年</span>
                  <span>30年</span>
                </div>
              </div>

              {/* 計算ボタン */}
              <button
                onClick={handleManualCalculate}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed font-serif text-lg shadow-md"
              >
                {loading ? '計算中...' : '実質タダを計算する'}
              </button>

              {/* エラー表示 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 使用年数設定（検索モードで商品選択後） */}
        {searchMode === 'search' && selectedProduct && !result && (
          <div className="bg-white border border-indigo-200 rounded-2xl p-8 mb-8 shadow-lg">
            {/* 選択した商品情報 */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <p className="text-gray-600 text-sm mb-2">選択した商品</p>
              <p className="text-gray-900 font-serif text-lg">{selectedProduct.name}</p>
              <p className="text-indigo-600 font-bold text-2xl mt-2">
                ¥{selectedProduct.price.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xl font-serif text-gray-800">使用期間を設定</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2 text-sm">
                  何年使用する予定ですか？
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={yearsOfUse}
                  onChange={(e) => setYearsOfUse(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>1年</span>
                  <span className="text-indigo-600 font-bold text-lg">{yearsOfUse}年</span>
                  <span>30年</span>
                </div>
              </div>

              {/* 計算ボタン */}
              <button
                onClick={handleCalculate}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed font-serif text-lg shadow-md"
              >
                {loading ? '計算中...' : '実質タダを計算する'}
              </button>

              {/* エラー表示 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ローディング */}
        {loading && (searchMode === 'search' ? selectedProduct : true) && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
            <p className="text-indigo-600 mt-4 font-serif">計算中...</p>
          </div>
        )}

        {/* 結果表示 */}
        {result && selectedProduct && (
          <ResultCard
            result={result.calculation}
            analysis={result.analysis}
            productName={selectedProduct.name}
          />
        )}

        {/* 新しく計算ボタン */}
        {result && (
          <div className="text-center mt-8">
            <button
              onClick={() => {
                setResult(null);
                setSelectedProduct(null);
                setSearchResults({ rakuten: [], amazon: [], yahoo: [], mock: [] });
                setKeyword('');
                setManualProductName('');
                setManualNewPrice('');
                setManualUsedPrice('');
              }}
              className="bg-white hover:bg-gray-50 text-indigo-600 font-serif px-8 py-3 rounded-lg border-2 border-indigo-300 hover:border-indigo-400 transition-all shadow-md"
            >
              別の商品で計算する
            </button>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="border-t border-indigo-200 bg-white/80 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600 text-sm font-serif mb-3">
            ※本アプリはプロトタイプです。リセールバリューは推定値であり、実際の売却価格を保証するものではありません。
          </p>
          <p className="text-gray-500 text-xs mt-2 mb-2">
            商品情報は楽天市場、Amazon.co.jp、Yahoo!ショッピングのAPIを利用しています。
          </p>
          <p className="text-gray-500 text-xs">
            Powered by Next.js | 賢い買い物を可視化
          </p>
        </div>
      </footer>
    </div>
  );
}
