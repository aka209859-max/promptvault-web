/**
 * PromptVault Web — OAuth / PKCE コールバックルート
 *
 * Google OAuth（PKCE フロー）での認証完了後に Supabase がリダイレクトしてくる
 * エンドポイント。URL の ?code= パラメータを受け取り、セッションを確立する。
 *
 * フロー:
 *   1. signInWithOAuth の redirectTo にこのルートを指定する
 *   2. Google 認証後、Supabase がここへ ?code=... をつけてリダイレクトする
 *   3. exchangeCodeForSession でコードをセッションに交換する
 *   4. 成功時は /dashboard へ遷移、失敗時は /login にエラーパラメータ付きで遷移する
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET ハンドラ: OAuth コールバック処理
 *
 * @param request - Supabase からのコールバックリクエスト（?code= 含む）
 * @returns /dashboard または /login へのリダイレクトレスポンス
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url)

  // Supabase が付与する認可コード（PKCE フロー）
  const code = searchParams.get('code')

  // ?next= パラメータで最終遷移先を上書き可能（省略時は /dashboard）
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    try {
      const supabase = await createClient()

      // PKCE 認可コードをセッション（アクセストークン + リフレッシュトークン）に交換する
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        // セッション確立成功 → ダッシュボードへリダイレクト
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch {
      // Supabase クライアント生成失敗時（環境変数未設定等）はログインへフォールバック
    }
  }

  // コードなし・交換失敗 → ログインページへ（エラーパラメータ付き）
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
