# 実質タダ電卓 Pro（Nagoya Vibe Edition）

高級品のリセールバリューを計算し、「実質タダ」であることを数字で証明するWebアプリケーション。

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwind-css)

## 🌟 主な機能

### 1. 2つの入力モード

#### 🔍 商品検索モード
- ブランド品や高級品をキーワードで検索
- モックデータで動作（API実装済み、本番ではAPIキーを設定するだけ）
- 対応商品例：
  - 時計：ロレックス サブマリーナ
  - バッグ：エルメス バーキン、シャネル、ルイヴィトン
  - カメラ：ニコン Z9/Z8、ソニー α7R V、キヤノン EOS R5
  - デジタル：iPhone 16 Pro Max、MacBook Pro

#### ✍️ 手動入力モード（NEW！）
- **任意の商品で計算可能**
- 商品名、新品価格、推定リセール価格を入力
- ヤフオクやメルカリで調べた中古相場をそのまま入力できる
- モックデータにない商品でもすぐに計算できる

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
- modern-screenshotによる高品質な画像生成
- Tailwind CSS 4のLab色にも対応
- インスタグラムのストーリーズに最適化

### 5. 価格分布の可視化
- Rechartsによる美しいグラフ表示
- 中古相場の価格分布を一目で把握

## 🎨 デザインコンセプト

**"Nagoya Rich"** - ゴージャスだが、数字にはシビア

- カラー: 黒、ゴールド、白を基調とした高級感
- フォント: Noto Serif JP（明朝体）で説得力を演出

## 🛠️ 技術スタック

- **Frontend**: Next.js 16 (App Router, React 19)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Chart**: Recharts
- **Image Generation**: modern-screenshot
- **Icons**: Lucide React
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

## ☁️ デプロイ

### Azure App Serviceへのデプロイ

このアプリはAzure App Serviceにデプロイできます。詳細な手順は [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md) を参照してください。

**クイックスタート**:
1. Azure App Serviceを作成（Node.js 22 LTS）
2. GitHub Secretsに発行プロファイルを設定
3. `main`ブランチまたは`claude/deploy-azure-web-app-fYLJ3`ブランチにプッシュで自動デプロイ

## 🔧 API統合（本番環境向け）

### 自動商品検索の設定

現在は**モックデータ**で動作していますが、APIキーを設定すると**リアルタイムで商品検索**できます！

#### 1. 楽天市場API（推奨）

1. [楽天ウェブサービス](https://webservice.rakuten.co.jp/)にアクセス
2. アプリIDを取得（無料）
3. `.env.local` ファイルを作成：

```bash
cp .env.local.example .env.local
```

4. `.env.local` にアプリIDを設定：

```
RAKUTEN_APPLICATION_ID=your_rakuten_app_id_here
```

5. 開発サーバーを再起動：

```bash
npm run dev
```

#### 2. Amazon Product Advertising API（オプション）

1. [Amazon Product Advertising API](https://affiliate.amazon.co.jp/)にアクセス
2. Amazonアソシエイト・プログラムに参加（審査が必要）
3. [PA-API利用申請](https://affiliate.amazon.co.jp/assoc_credentials/home)から認証情報を取得
4. `.env.local` に追加：

```
AMAZON_ACCESS_KEY=your_amazon_access_key
AMAZON_SECRET_KEY=your_amazon_secret_key
AMAZON_ASSOCIATE_TAG=your_amazon_associate_tag
```

**注意**: Amazon PA-APIは審査制で、以下の条件が必要です：
- Amazonアソシエイト・プログラムに登録済みであること
- 過去180日以内に3件以上の適格販売があること
- PA-API利用規約に同意すること

#### 3. Yahoo!ショッピングAPI（オプション）

1. [Yahoo!デベロッパーネットワーク](https://e.developer.yahoo.co.jp/)にアクセス
2. Client IDを取得
3. `.env.local` に追加：

```
YAHOO_CLIENT_ID=your_yahoo_client_id_here
```

### 検索ソースの優先順位

1. **楽天市場API**（設定されている場合）
2. **Amazon PA-API**（楽天が失敗した場合、設定されている場合）
3. **Yahoo!ショッピングAPI**（楽天とAmazonが失敗した場合）
4. **モックデータ**（APIが設定されていない場合）

設定後は、検索結果に「楽天市場」「Amazon.co.jp」「Yahoo!ショッピング」「モックデータ」のバッジが表示されます。

### ビックカメラ・ヨドバシカメラについて

**ビックカメラ**と**ヨドバシカメラ**は公式のAPI提供がないため、現時点では直接検索できません。

**代替案**：
- 手動入力モードを使用して、各サイトで確認した価格を入力
- 楽天市場やYahoo!ショッピングに出店している場合は、それらのAPIで検索可能
- Amazonに出品されている商品も多いため、Amazon PA-APIで検索可能

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

## ⚠️ 重要：API利用規約の遵守について

このアプリケーションは、楽天市場API、Amazon Product Advertising API、Yahoo!ショッピングAPIを利用しています。これらのAPIを使用する際は、各サービスの利用規約を遵守する必要があります。

### 必須の対応事項

#### 1. 商品ページへのリンク表示（実装済み）
- 各APIの規約により、商品情報を表示する際は**必ず商品ページへのリンクを含める**必要があります
- 本アプリでは検索結果に「商品ページを見る」ボタンを表示しています

#### 2. アフィリエイトリンクの使用（実装済み）
- Amazon PA-APIを使用する場合、アソシエイトタグを含むリンクを提供する必要があります
- 楽天市場APIでも、アフィリエイトURLが提供される場合は優先的に使用します

#### 3. 画像の使用制限
- APIから取得した商品画像は、各ECサイトの利用規約に従って使用してください
- 本アプリでは画像ダウンロード時に確認ダイアログを表示し、個人利用のみを推奨しています
- 商用利用や再配布は禁止されています

### 各API利用規約リンク

- [楽天ウェブサービス利用規約](https://webservice.rakuten.co.jp/agreement/)
- [Amazon Product Advertising API ライセンス契約](https://affiliate.amazon.co.jp/help/operating/agreement)
- [Yahoo!ショッピング API利用規約](https://e.developer.yahoo.co.jp/webservices/license.html)

### 推奨される使用方法

1. **個人での検証・計算ツールとして使用**
2. **商品ページへのリンクは必ず維持**
3. **ダウンロードした画像の商用利用は避ける**
4. **APIキーは適切に管理し、公開しない**

## 📋 注意事項

※本アプリはプロトタイプです。リセールバリューは推定値であり、実際の売却価格を保証するものではありません。

---

**Powered by Next.js | Designed with Nagoya Rich Vibes** 💎
