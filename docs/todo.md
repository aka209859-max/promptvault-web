# PromptVault Web タスクリスト

## フェーズ1：基盤構築（完了）
- [x] Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui プロジェクト初期化
- [x] Supabase クライアント（Browser / Server）実装
- [x] Stripe Checkout API（/api/create-checkout）実装
- [x] Stripe Webhook API（/api/webhook）実装
- [x] データベーススキーマ（docs/schema.sql）作成
- [x] 環境変数テンプレート（.env.example）作成

## フェーズ2：認証 + 課金 UI（完了）
- [x] /login 認証ページ実装（マジックリンク方式に変更済み）
- [x] ログイン方式をマジックリンク（Email OTP）に変更（Google OAuth 廃止）
- [x] /dashboard ダッシュボード実装
- [x] /upgrade アップグレードページ（Stripe Checkout 連携）実装
- [x] /success 決済完了ページ実装
- [x] RLS（Row Level Security）違反バグ修正（addPrompt に user_id 追加）

## フェーズ3：本番デプロイ準備（完了）
- [x] vercel.json 作成（東京リージョン nrt1）
- [x] Webhook サーバーサイド認証強化（customer_email + listUsers 方式）
- [x] create-checkout サーバーサイド認証（cookies() 方式）
- [x] .gitignore 修正（.env.example を追跡対象に）
- [x] README.md 整備

## フェーズ4：ランディングページ（完了）
- [x] LP 実装（JP/EN 言語切り替え対応、8セクション）
  - [x] Navbar（固定ヘッダー + JP/EN トグル）
  - [x] Hero（clamp h1、インディゴグロー、デュアル CTA）
  - [x] Problem（課題 3 カード + CSS hover）
  - [x] Solution（CSS ブラウザモック UI）
  - [x] PricingSection（Free/Pro、JP ¥980・EN $9.99）
  - [x] Faq（5 問アコーディオン）
  - [x] FinalCta（グロー装飾 + 最終 CTA）
  - [x] Footer（コピーライト + リンク）

## フェーズ5：公開・運用（未着手）
- [ ] Supabase リダイレクト URL 設定（本番ドメイン追加）
- [ ] Stripe Webhook エンドポイント設定（本番 URL + シグネチャ登録）
- [ ] Vercel デプロイ実行・本番環境変数設定
- [ ] Chrome Web Store 公開（Chrome 拡張 promptvault）
