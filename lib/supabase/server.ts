/**
 * サーバーサイド（Server Component / Route Handler / Server Action）用 Supabase クライアント。
 *
 * @supabase/ssr の createServerClient を使用し、Next.js の cookies() API 経由で
 * 認証トークンを読み書きする。これにより、クライアントとサーバー間でセッションが同期される。
 *
 * 注意: この関数は必ず async な Server Component または Route Handler 内で呼び出すこと。
 * Client Component では client.ts の createClient() を使用する。
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * サーバー用 Supabase クライアントを生成して返す。
 * SUPABASE_SERVICE_ROLE_KEY は使用しない（RLS を尊重するため anon key を使用）。
 * 管理者権限が必要な処理（Webhook 等）では別途 service role client を作成すること。
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Server Component から呼ばれた場合は Cookie の書き込みが不可のため無視する
            // セッションの更新は Middleware 側で行われる
          }
        },
      },
    },
  )
}

/**
 * サービスロール（管理者権限）Supabase クライアントを生成して返す。
 * RLS をバイパスするため、Stripe Webhook など信頼済みサーバー処理専用。
 * クライアントサイドには絶対に露出させないこと。
 */
export function createServiceRoleClient() {
  // サービスロールキーは NEXT_PUBLIC_ プレフィックスなし（サーバー専用）
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        // Webhook 等のサーバー処理では Cookie 不要
        getAll: () => [],
        setAll: () => {},
      },
    },
  )
}
