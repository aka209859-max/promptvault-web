# PromptVault Web

AI プロンプト管理 Web アプリケーション。  
Chrome 拡張機能 PromptVault と連携し、プロンプトの追加・編集・削除をブラウザから行える。

**技術スタック:** Next.js 16 · TypeScript · Tailwind CSS v4 · Supabase · Stripe

---

## セットアップ

### 前提条件

- Node.js v20 以上
- Supabase プロジェクト（[supabase.com](https://supabase.com)）
- Stripe アカウント（[stripe.com](https://stripe.com)）

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd promptvault-web
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.example` をコピーして `.env.local` を作成し、各値を設定する。

```bash
cp .env.example .env.local
```

### 4. Supabase スキーマの適用

Supabase ダッシュボードの SQL Editor で `docs/schema.sql` を実行する。

---

## 環境変数

| 変数名 | 説明 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトの URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の anon/public キー |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase のサービスロールキー（サーバー専用） |
| `STRIPE_SECRET_KEY` | Stripe のシークレットキー |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook の署名シークレット |
| `STRIPE_PRICE_ID` | Stripe サブスクリプションの Price ID |
| `NEXT_PUBLIC_APP_URL` | デプロイ先の URL（例: `https://your-app.vercel.app`） |

> **注意:** `SUPABASE_SERVICE_ROLE_KEY` と `STRIPE_SECRET_KEY` はサーバーサイド専用です。  
> `NEXT_PUBLIC_` プレフィックスのない変数はクライアントに露出しません。

---

## 開発サーバー起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開く。

---

## ビルド

```bash
npm run build
```

本番ビルドが成功することを確認してからデプロイする。

```bash
npm run start   # ビルド済みアプリをローカルで起動（動作確認用）
```

---

## ページ構成

| パス | 説明 |
|---|---|
| `/login` | ログイン / ユーザー登録 |
| `/dashboard` | プロンプト一覧・追加・編集・削除 |
| `/upgrade` | Pro プランへのアップグレード（Stripe Checkout） |
| `/success` | 課金完了画面 |

---

## Vercel へのデプロイ

1. [Vercel](https://vercel.com) にリポジトリをインポート
2. Environment Variables に `.env.local` の内容を登録
3. デプロイ後、Stripe ダッシュボードで Webhook エンドポイントを登録:  
   `https://your-app.vercel.app/api/webhook`  
   イベント: `checkout.session.completed`

---

## ライセンス

Private
