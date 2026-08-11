# Vercelへのデプロイ手順

VercelはNext.js開発元が提供するホスティングサービスで、Next.jsアプリに最適化されています。

## 特徴

- ✅ **完全無料プラン**あり（個人プロジェクト向け）
- ✅ **自動デプロイ**（GitHubにプッシュするだけ）
- ✅ **グローバルCDN**標準搭載
- ✅ **プレビューデプロイ**（プルリクエストごと）
- ✅ **自動HTTPS**
- ✅ **カスタムドメイン**対応

## デプロイ手順（3ステップで完了！）

### ステップ1: Vercelアカウントの作成

1. [Vercel](https://vercel.com)にアクセス
2. 「Sign Up」をクリック
3. **「Continue with GitHub」を選択**（推奨）
4. GitHubアカウントでログイン

### ステップ2: プロジェクトのインポート

1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. 「Import Git Repository」セクションで、このリポジトリ（`web-app-3`）を選択
3. 「Import」をクリック

### ステップ3: デプロイ設定

プロジェクトのインポート画面で以下を確認：

#### 基本設定
- **Framework Preset**: Next.js（自動検出されます）
- **Root Directory**: `./`（デフォルト）
- **Build Command**: `npm run build`（自動設定）
- **Output Directory**: `.next`（自動設定）
- **Install Command**: `npm install`（自動設定）

#### 環境変数（オプション）

外部サービスからリアルタイムの商品情報を取得する場合は、以下を設定：

```
RAKUTEN_APPLICATION_ID=your_rakuten_app_id_here
RAKUTEN_ACCESS_KEY=your_rakuten_access_key_here
RAKUTEN_APPLICATION_URL=https://your-app.example.com
AMAZON_CREATORS_CLIENT_ID=your_creators_api_client_id
AMAZON_CREATORS_CLIENT_SECRET=your_creators_api_client_secret
AMAZON_CREATORS_CREDENTIAL_VERSION=3.3
AMAZON_ASSOCIATE_TAG=your_amazon_associate_tag
YAHOO_CLIENT_ID=your_yahoo_client_id_here
```

環境変数は「Environment Variables」セクションでProduction、Preview、Developmentの必要な環境に設定し、変更後に再デプロイしてください。認証情報がないサービスは画面に「未設定」と表示され、すべての外部サービスで結果がない場合はモックデータへフォールバックします。

#### デプロイ実行

1. 設定を確認したら「Deploy」をクリック
2. **約1-2分でデプロイ完了！**

## デプロイ完了後

### 1. URLの確認

デプロイが完了すると、以下のようなURLが発行されます：

```
https://web-app-3.vercel.app
```

または

```
https://web-app-3-<random-hash>.vercel.app
```

### 2. 自動デプロイの確認

今後、GitHubの以下のブランチにプッシュすると**自動的にデプロイ**されます：

- **`main`ブランチ** → 本番環境にデプロイ
- **その他のブランチ** → プレビュー環境にデプロイ

### 3. プレビューデプロイ

プルリクエストを作成すると：
- 自動的にプレビュー環境が作成されます
- PRのコメントにプレビューURLが追加されます
- レビュー前に動作確認ができます

## カスタムドメインの設定（オプション）

独自ドメインを使用する場合：

1. Vercelダッシュボードでプロジェクトを開く
2. 「Settings」→「Domains」を選択
3. ドメインを追加し、DNS設定を行う
4. **HTTPS証明書は自動で設定されます**

### DNS設定例

**Aレコード**:
```
A     @     76.76.21.21
```

**CNAMEレコード**:
```
CNAME www   cname.vercel-dns.com
```

## ビルドログとデバッグ

### ログの確認

1. Vercelダッシュボードでプロジェクトを開く
2. 「Deployments」タブを選択
3. デプロイをクリックして詳細を確認

### よくある問題

#### 1. ビルドエラー

**症状**: デプロイが失敗する

**解決方法**:
- ローカルで `npm run build` が成功することを確認
- `package-lock.json` をコミットしているか確認
- Node.jsバージョンを確認（22.x以上）

#### 2. 環境変数が反映されない

**症状**: API統合が動作しない

**解決方法**:
- Vercelダッシュボードの「Settings」→「Environment Variables」で設定
- 設定後、再デプロイが必要（「Deployments」→「Redeploy」）

#### 3. 404エラー

**症状**: ページが見つからない

**解決方法**:
- Next.jsのApp Routerを使用しているため、ルーティングは自動
- `app/` ディレクトリ構造を確認

## Vercel CLI（上級者向け）

ローカルからコマンドラインでデプロイすることも可能です：

```bash
# Vercel CLIのインストール
npm install -g vercel

# ログイン
vercel login

# デプロイ（開発環境）
vercel

# デプロイ（本番環境）
vercel --prod
```

## 料金プラン

### Hobby（無料プラン）

- ✅ 個人プロジェクト向け
- ✅ 無制限のデプロイ
- ✅ 100GB帯域幅/月
- ✅ グローバルCDN
- ✅ 自動HTTPS
- ⚠️ 商用利用不可

### Pro（$20/月）

- ✅ 商用利用可能
- ✅ 1TB帯域幅/月
- ✅ パスワード保護
- ✅ チーム機能

このプロジェクトの場合、**Hobbyプラン（無料）で十分**です！

## トラブルシューティング

### サポート

- [Vercelドキュメント](https://vercel.com/docs)
- [Next.jsドキュメント](https://nextjs.org/docs)
- [Vercelコミュニティ](https://github.com/vercel/vercel/discussions)

### ログの確認

```bash
# Vercel CLIでログを確認
vercel logs <deployment-url>
```

## 参考リンク

- [Vercel公式サイト](https://vercel.com)
- [Vercelドキュメント](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [カスタムドメイン設定](https://vercel.com/docs/concepts/projects/custom-domains)

---

**🎉 これでVercelへのデプロイは完了です！GitHubにプッシュするだけで自動的にデプロイされます。**
