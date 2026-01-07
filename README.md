# 実質タダ電卓 Pro（Nagoya Vibe Edition）

高級品のリセールバリューを計算し、「実質タダ」であることを数字で証明するWebアプリケーション。

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwind-css)

## 🌟 主な機能

### 1. 商品検索機能
- ブランド品や高級品をキーワードで検索
- モックデータで動作（API実装済み、本番ではAPIキーを設定するだけ）
- 対応商品例：
  - 時計：ロレックス サブマリーナ
  - バッグ：エルメス バーキン、シャネル、ルイヴィトン
  - カメラ：ニコン Z9/Z8、ソニー α7R V、キヤノン EOS R5
  - デジタル：iPhone 16 Pro Max、MacBook Pro

### 2. リセールバリュー自動計算
高度な統計処理により、正確なリセールバリューを算出：
1. データクレンジング: 価格データを昇順にソート
2. 外れ値除外: 上位10%と下位10%を削除
3. 中央値算出: 残ったデータの中央値を推定リセールバリューとして採用
4. 信頼度評価: 標準偏差からボラティリティを判定

### 3. 「実質タダ」計算
- 購入価格とリセールバリューの差額を日割り計算
- わかりやすい比較表示（例：「スタバのラテより安い」）

### 4. シェア画像生成
- html2canvasによる高品質な画像生成
- インスタグラムのストーリーズに最適化

### 5. 価格分布の可視化
- Rechartsによる美しいグラフ表示
- 中古相場の価格分布を一目で把握

## 🎨 デザインコンセプト

**"Nagoya Rich"** - ゴージャスだが、数字にはシビア

- カラー: 黒、ゴールド、白を基調とした高級感
- フォント: Noto Serif JP（明朝体）で説得力を演出

## 🛠️ 技術スタック

- Frontend: Next.js 16 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Icons: Lucide React
- Charts: Recharts
- Image Generation: html2canvas

## 📦 セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build
npm start
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 🔧 API統合（本番環境向け）

現在はモックデータで動作していますが、楽天市場APIやYahoo!ショッピングAPIを統合可能です。

`app/api/search/route.ts` と `app/api/resale/route.ts` を編集し、環境変数を `.env.local` に設定してください。

## 📊 計算ロジックの詳細

### リセールバリュー計算

```
日割りコスト = (購入価格 - 推定リセールバリュー) ÷ (使用年数 × 365日)
```

### 使用例: ロレックス サブマリーナ

- 購入価格: ¥1,580,000
- 推定リセール: ¥1,490,000
- 使用期間: 10年
- 日割りコスト: ¥24/日 → **「缶コーヒーより安い」**

## 📝 プロジェクト構造

```
web-qpp-3/
├── app/
│   ├── api/search/route.ts      # 商品検索API
│   ├── api/resale/route.ts      # リセールバリュー計算API
│   ├── page.tsx                 # メインページ
│   └── layout.tsx               # レイアウト
├── components/
│   └── ResultCard.tsx           # 結果表示コンポーネント
├── lib/
│   ├── types.ts                 # 型定義
│   ├── mockData.ts              # モックデータ
│   └── resaleCalculator.ts      # 計算ロジック
└── package.json
```

## 注意事項

※本アプリはプロトタイプです。リセールバリューは推定値であり、実際の売却価格を保証するものではありません。

---

**Powered by Next.js | Designed with Nagoya Rich Vibes** 💎
