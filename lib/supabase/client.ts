/**
 * ブラウザ（クライアントサイド）用 Supabase クライアント。
 *
 * Client Component や通常のブラウザコンテキストから呼び出す。
 * 認証トークンは @supabase/ssr が Cookie を通じて自動管理するため、
 * ログイン状態が Next.js のサーバーサイドとも同期される。
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * ブラウザ用 Supabase クライアントを生成して返す。
 * NEXT_PUBLIC_ プレフィックスの環境変数のみ使用するため
 * クライアントバンドルに含まれても安全。
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
