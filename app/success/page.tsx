/**
 * PromptVault Web — 課金完了ページ（Server Component）
 *
 * Stripe Checkout の success_url として指定されるページ。
 * サーバーサイドで取得するデータは不要なため、
 * 薄いラッパーとして SuccessClient をレンダリングするだけ。
 *
 * Server Component にすることで初期 HTML をすぐに送信でき、
 * インタラクション（アニメーション・ナビゲーション）は
 * SuccessClient（Client Component）で処理する。
 */

import SuccessClient from './success-client'

/**
 * 課金完了ページ。
 * データ取得なし。SuccessClient に処理を委譲する。
 */
export default function SuccessPage() {
  return <SuccessClient />
}
