'use client';

import React, { useState } from 'react';
import { Search, Sparkles, Calculator, Crown } from 'lucide-react';
import { Product, ResaleAnalysis, JissitsuTadaResult } from '@/lib/types';
import { calculateJissitsuTada } from '@/lib/resaleCalculator';
import ResultCard from '@/components/ResultCard';

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [yearsOfUse, setYearsOfUse] = useState(10);
  const [result, setResult] = useState<{
    calculation: JissitsuTadaResult;
    analysis: ResaleAnalysis;
  } | null>(null);
  const [error, setError] = useState<string>('');

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError('キーワードを入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setSearchResults([]);
    setSelectedProduct(null);
    setResult(null);

    try {
      const response = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '検索に失敗しました');
      }

      if (data.products.length === 0) {
        setError(data.message || '商品が見つかりませんでした');
      } else {
        setSearchResults(data.products);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '検索中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = async (product: Product) => {
    setSelectedProduct(product);
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // リセールバリューを取得
      const response = await fetch(`/api/resale?keyword=${encodeURIComponent(keyword)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'リセールバリューの取得に失敗しました');
      }

      // 実質タダを計算
      const calculation = calculateJissitsuTada(
        product.price,
        data.analysis.estimatedResaleValue,
        yearsOfUse
      );

      setResult({
        calculation,
        analysis: data.analysis
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
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* ヘッダー */}
      <header className="border-b border-yellow-700/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <Crown className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-serif text-yellow-500 tracking-wider">
              実質タダ電卓 Pro
            </h1>
            <Crown className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-center text-yellow-600 mt-2 font-serif text-sm">
            Nagoya Vibe Edition - 高級品の本当の価値を可視化
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* イントロ */}
        {!result && (
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-serif text-yellow-400">
                リセールバリューで「実質タダ」を証明
              </h2>
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
              欲しい高級品を検索すると、中古相場データから推定リセールバリューを自動計算。
              購入価格との差額を日割りで表示し、「実質タダ」であることを数字で証明します。
            </p>
          </div>
        )}

        {/* 検索セクション */}
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-700/50 rounded-2xl p-8 shadow-2xl mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-yellow-500" />
            <h3 className="text-xl font-serif text-yellow-500">商品を検索</h3>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="例: ロレックス サブマリーナ"
                className="flex-1 bg-black/50 border border-yellow-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 disabled:from-gray-700 disabled:to-gray-600 text-black font-bold px-8 py-3 rounded-lg transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
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
                  className="text-xs bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-400 px-3 py-1 rounded-full border border-yellow-700/50 transition-colors"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mt-4 bg-red-900/30 border border-red-700/50 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* 検索結果 */}
        {searchResults.length > 0 && !selectedProduct && (
          <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-700/30 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-serif text-yellow-500 mb-4">検索結果</h3>
            <div className="space-y-3">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="w-full bg-black/50 hover:bg-yellow-900/20 border border-yellow-700/30 hover:border-yellow-500 rounded-lg p-4 transition-all text-left group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-white font-serif mb-1 group-hover:text-yellow-400 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-gray-500 text-sm">{product.shopName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-500 font-bold text-xl">
                        ¥{product.price.toLocaleString()}
                      </p>
                      <p className="text-gray-500 text-xs">新品</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 使用年数設定 */}
        {selectedProduct && !result && (
          <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-700/30 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-yellow-500" />
              <h3 className="text-xl font-serif text-yellow-500">使用期間を設定</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2 text-sm">
                  何年使用する予定ですか？
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={yearsOfUse}
                  onChange={(e) => setYearsOfUse(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>1年</span>
                  <span className="text-yellow-500 font-bold text-lg">{yearsOfUse}年</span>
                  <span>30年</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ローディング */}
        {loading && selectedProduct && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
            <p className="text-yellow-500 mt-4 font-serif">計算中...</p>
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
                setSearchResults([]);
                setKeyword('');
              }}
              className="bg-gray-800 hover:bg-gray-700 text-yellow-500 font-serif px-8 py-3 rounded-lg border border-yellow-700/50 transition-all"
            >
              別の商品で計算する
            </button>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="border-t border-yellow-700/30 bg-black/50 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-500 text-sm font-serif">
            ※本アプリはプロトタイプです。リセールバリューは推定値であり、実際の売却価格を保証するものではありません。
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Powered by Next.js | Designed with Nagoya Rich Vibes
          </p>
        </div>
      </footer>
    </div>
  );
}
