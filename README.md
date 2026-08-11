# 実質タダ電卓（Nagoya Vibe Edition）

高級品のリセールバリューを計算し、「実質タダ」であることを数字で証明するWebアプリケーション。

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwind-css)

<img width="1808" height="1172" alt="image" src="https://github.com/user-attachments/assets/a3453f0e-a91f-45af-b6f9-66dc68345a10" />

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

### Vercelへのデプロイ（推奨・無料）

**最も簡単な方法！** Next.js開発元が提供する無料ホスティングサービスです。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/monmondayo/web-app-3)

**3ステップで完了**:
1. [Vercel](https://vercel.com)でGitHubアカウントと連携
2. このリポジトリをインポート
3. 「Deploy」をクリック → 完了！

詳細な手順は [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) を参照してください。

### Azure App Serviceへのデプロイ

このアプリはAzure App Serviceにもデプロイできます。詳細な手順は [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md) を参照してください。

**クイックスタート**:
1. Azure App Serviceを作成（Node.js 22 LTS）
2. GitHub Secretsに発行プロファイルを設定
3. `main`ブランチまたは`claude/deploy-azure-web-app-fYLJ3`ブランチにプッシュで自動デプロイ

## 🔧 API統合（本番環境向け）

### 自動商品検索の設定

現在は**モックデータ**で動作していますが、APIキーを設定すると**リアルタイムで商品検索**できます！

#### 1. 楽天市場API（推奨）

1. [楽天ウェブサービス](https://webservice.rakuten.co.jp/)にアクセス
2. アプリIDとAccess Keyを取得（無料）
3. `.env.local` ファイルを作成：

```bash
cp .env.local.example .env.local
```

4. `.env.local` に認証情報を設定：

```
RAKUTEN_APPLICATION_ID=your_rakuten_app_id_here
RAKUTEN_ACCESS_KEY=your_rakuten_access_key_here
```

5. 開発サーバーを再起動：

```bash
npm run dev
```

#### 2. Amazon Creators API（オプション）

1. [Amazon Creators API](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/onboarding)にアクセス
2. Amazonアソシエイト・プログラムに参加（審査が必要）
3. Creators APIのClient IDとClient Secretを取得
4. `.env.local` に追加：

```
AMAZON_CREATORS_CLIENT_ID=your_creators_api_client_id
AMAZON_CREATORS_CLIENT_SECRET=your_creators_api_client_secret
AMAZON_CREATORS_CREDENTIAL_VERSION=3.3
AMAZON_ASSOCIATE_TAG=your_amazon_associate_tag
```

日本向けの新しいCredential Versionは`3.3`です。旧Cognito Credentialを利用する場合は`2.3`を指定してください。

**注意**: Amazon Creators APIは審査制です：
- Amazonアソシエイト・プログラムに登録済みであること
- Creators APIへのアクセスが承認済みであること
- 対象マーケットプレイスの有効なアソシエイトタグを使用すること

#### 3. Yahoo!ショッピングAPI（オプション）

1. [Yahoo!デベロッパーネットワーク](https://e.developer.yahoo.co.jp/)にアクセス
2. Client IDを取得
3. `.env.local` に追加：

```
YAHOO_CLIENT_ID=your_yahoo_client_id_here
```

### 検索ソース

楽天市場API、Amazon Creators API、Yahoo!ショッピングAPIを並列検索します。すべての外部サービスで結果がない場合のみモックデータへフォールバックします。

検索結果にはサービスごとに「取得済み」「該当なし」「未設定」「エラー」の状態が表示されます。

### ビックカメラ・ヨドバシカメラについて

**ビックカメラ**と**ヨドバシカメラ**は公式のAPI提供がないため、現時点では直接検索できません。

**代替案**：
- 手動入力モードを使用して、各サイトで確認した価格を入力
- 楽天市場やYahoo!ショッピングに出店している場合は、それらのAPIで検索可能
- Amazonに出品されている商品も多いため、Amazon Creators APIで検索可能

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

## 🔒 セキュリティとレート制限

このアプリケーションは一般公開を想定した以下のセキュリティ対策を実装しています：

### APIレート制限

- **制限**: 1分間に30リクエストまで（IP単位）
- **実装場所**: `middleware.ts`
- **超過時**: HTTP 429エラーとリトライ推奨時間を返却

### 環境変数の保護

- すべてのAPIキーは環境変数で管理
- `.gitignore`でシークレットファイルを除外
- `.env.local.example`にはサンプル値のみ記載

### セキュリティベストプラクティス

1. **本番環境へのデプロイ前**:
   ```bash
   # 依存パッケージの脆弱性チェック
   npm audit

   # 修正可能な脆弱性を自動修正
   npm audit fix
   ```

2. **環境変数の設定**:
   - Vercel: Dashboard > Settings > Environment Variables
   - Azure: Configuration > Application Settings

3. **定期的なメンテナンス**:
   - 依存パッケージの定期更新
   - セキュリティアップデートの適用

## 📝 プロジェクト構造

```
web-app-3/
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

このアプリケーションは、楽天市場API、Amazon Creators API、Yahoo!ショッピングAPIを利用しています。これらのAPIを使用する際は、各サービスの利用規約を遵守する必要があります。

### 必須の対応事項

#### 1. 商品ページへのリンク表示（実装済み）
- 各APIの規約により、商品情報を表示する際は**必ず商品ページへのリンクを含める**必要があります
- 本アプリでは検索結果に「商品ページを見る」ボタンを表示しています

#### 2. アフィリエイトリンクの使用（実装済み）
- Amazon Creators APIを使用する場合、アソシエイトタグを含むAPI提供リンクを使用します
- 楽天市場APIでも、アフィリエイトURLが提供される場合は優先的に使用します

#### 3. 画像の使用制限
- APIから取得した商品画像は、各ECサイトの利用規約に従って使用してください
- 本アプリでは画像ダウンロード時に確認ダイアログを表示し、個人利用のみを推奨しています
- 商用利用や再配布は禁止されています

### 各API利用規約リンク

- [楽天ウェブサービス利用規約](https://webservice.rakuten.co.jp/agreement/)
- [Amazon Creators API ライセンス契約](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/license-agreement)
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
