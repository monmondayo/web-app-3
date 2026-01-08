# Azure App Serviceへのデプロイ手順

このドキュメントでは、Next.jsアプリケーションをAzure App Serviceにデプロイする手順を説明します。

## 前提条件

- Azureアカウント
- Azure CLI（ローカル環境）
- GitHubリポジトリ

## ステップ1: Azure App Serviceの作成

### 1.1 Azureポータルでリソースグループを確認

1. [Azureポータル](https://portal.azure.com)にログイン
2. リソースグループ `azure-web-app-3` を確認

### 1.2 App Serviceの作成

Azure CLIを使用する場合：

```bash
# ログイン
az login

# App Service Planの作成
az appservice plan create \
  --name web-app-3-plan \
  --resource-group azure-web-app-3 \
  --location japaneast \
  --sku B1 \
  --is-linux

# Web Appの作成
az webapp create \
  --name web-app-3 \
  --resource-group azure-web-app-3 \
  --plan web-app-3-plan \
  --runtime "NODE:20-lts"
```

または、Azureポータルから手動で作成：

1. 「リソースの作成」→「Web App」を選択
2. 以下の設定で作成：
   - **リソースグループ**: `azure-web-app-3`
   - **名前**: `web-app-3`（グローバルに一意である必要があります）
   - **ランタイムスタック**: Node 20 LTS
   - **オペレーティングシステム**: Linux
   - **リージョン**: Japan East（または任意のリージョン）
   - **App Service プラン**: B1（Basic）以上

### 1.3 App Serviceの設定

作成したApp Serviceで以下の設定を行います：

1. **「構成」→「アプリケーション設定」**で環境変数を追加：
   ```
   NODE_ENV=production
   PORT=8080
   WEBSITE_NODE_DEFAULT_VERSION=20-lts
   ```

2. **「構成」→「全般設定」**：
   - **スタートアップコマンド**: `npm start`
   - **常時接続**: オン（推奨）

## ステップ2: GitHub Secretsの設定

### 2.1 発行プロファイルの取得

1. Azureポータルで作成したApp Serviceを開く
2. 「概要」→「発行プロファイルの取得」をクリック
3. ダウンロードされた `.PublishSettings` ファイルの内容をコピー

### 2.2 GitHub Secretsへの追加

1. GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」を開く
2. 「New repository secret」をクリック
3. 以下のシークレットを追加：
   - **Name**: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - **Value**: 取得した発行プロファイルの内容を貼り付け

## ステップ3: デプロイの実行

### 3.1 自動デプロイ

GitHub Actionsワークフローが設定済みなので、以下のブランチにプッシュすると自動的にデプロイされます：

- `main` ブランチ
- `claude/deploy-azure-web-app-fYLJ3` ブランチ

### 3.2 手動デプロイ

GitHub Actionsから手動でデプロイを実行する場合：

1. GitHubリポジトリの「Actions」タブを開く
2. 「Deploy to Azure App Service」ワークフローを選択
3. 「Run workflow」をクリック

## ステップ4: デプロイの確認

1. デプロイが完了したら、以下のURLにアクセス：
   ```
   https://web-app-3.azurewebsites.net
   ```
   ※ `web-app-3`の部分は作成したApp Serviceの名前に置き換えてください

2. Azure Portalの「ログストリーム」でアプリケーションログを確認できます

## トラブルシューティング

### ログの確認

```bash
# Azure CLIでログを確認
az webapp log tail --name web-app-3 --resource-group azure-web-app-3
```

または、Azureポータルの「ログストリーム」から確認できます。

### よくある問題

1. **デプロイは成功するがアプリが起動しない**
   - スタートアップコマンドが正しいか確認
   - 環境変数が正しく設定されているか確認
   - ログを確認してエラーメッセージを確認

2. **ビルドエラー**
   - Node.jsのバージョンが20.x以上であることを確認
   - `package-lock.json`が最新であることを確認

3. **ポート番号のエラー**
   - Azure App Serviceは`PORT`環境変数を自動的に設定します
   - Next.jsは自動的にこのポートを使用します

## カスタムドメインの設定（オプション）

カスタムドメインを使用する場合：

1. Azureポータルで「カスタムドメイン」を開く
2. ドメインを追加し、DNSレコードを設定
3. SSL/TLS証明書を設定（Let's Encryptの無料証明書が利用可能）

## 参考リンク

- [Azure App Service ドキュメント](https://docs.microsoft.com/ja-jp/azure/app-service/)
- [Next.js デプロイガイド](https://nextjs.org/docs/deployment)
- [GitHub Actions - Azure Web App Deploy](https://github.com/marketplace/actions/azure-webapp)
