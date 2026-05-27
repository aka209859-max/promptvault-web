/**
 * PromptVault Web — 認証ミドルウェア
 *
 * 保護されたルートへの未認証アクセスを /login にリダイレクトする。
 * @supabase/ssr の createServerClient を使用し、
 * リクエスト/レスポンスのクッキー情報を型安全に引き継いで
 * セッションを同期する。
 *
 * Next.js ミドルウェアにおけるクッキーアクセスについて:
 *   - Server Component / Route Handler で使う `await cookies()` (next/headers) は不要。
 *   - ミドルウェアでは NextRequest の `request.cookies.getAll()` で同期的に読み取り、
 *     NextResponse の `response.cookies.set()` で書き込む。
 *   - `supabase.auth.getUser()` は async であるため、関数全体を async にする。
 *
 * 保護対象ルート:
 *   /dashboard/*  — ダッシュボード（認証必須）
 *   /upgrade/*    — アップグレードページ（認証必須）
 */

import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

/**
 * 認証ミドルウェア本体。
 *
 * 処理フロー:
 * 1. NextResponse を先行生成し、クッキーの読み書き用オブジェクトとして使用する。
 * 2. createServerClient でクッキーハンドラを設定し、セッションを復元する。
 * 3. supabase.auth.getUser() で認証状態を確認する。
 * 4. 未認証の場合は /login にリダイレクト、認証済みの場合はそのまま通過させる。
 *
 * @param request - Next.js が受け取った HTTP リクエスト
 * @returns リダイレクト、または通過のいずれかの NextResponse
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  /**
   * レスポンスを先行生成する。
   * リクエスト情報を引き継ぐことで、クッキー書き込み後の
   * ヘッダー情報が後続のサーバーコンポーネントに正しく伝達される。
   */
  let response = NextResponse.next({ request })

  /**
   * Supabase SSR クライアントを生成する。
   * ミドルウェアでは next/headers の cookies() は使用できないため、
   * request.cookies / response.cookies を直接操作するハンドラを渡す。
   */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * 現在のリクエストに含まれるすべてのクッキーを返す。
         * NextRequest.cookies は同期 API であるため await 不要。
         */
        getAll() {
          return request.cookies.getAll()
        },
        /**
         * セッション更新時などに Supabase がクッキーを書き込む際に呼ばれる。
         * リクエストとレスポンスの両方に反映させることで、
         * サーバーコンポーネントとの一貫性を保つ。
         */
        setAll(cookiesToSet) {
          // リクエスト側に反映（後続のサーバーコンポーネントへの伝達用）
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          // 新しいリクエスト情報でレスポンスを再生成する
          response = NextResponse.next({ request })
          // レスポンス側にも反映（ブラウザへの Set-Cookie ヘッダー送信用）
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  /**
   * 現在の認証ユーザーを取得する。
   * getSession() ではなく getUser() を使用することで、
   * JWT の有効期限を含むサーバーサイドの厳密な検証が行われる。
   * ここで await することでセッションクッキーが更新される。
   */
  const {
    data: { user },
  } = await supabase.auth.getUser()

  /**
   * 未認証の場合は /login にリダイレクトする。
   * user が null の場合（未ログインまたはセッション期限切れ）が対象。
   */
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 認証済みの場合はそのまま通過させる（クッキー更新済みのレスポンスを返す）
  return response
}

/**
 * ミドルウェアを適用するルートの設定。
 * matcher に指定されたパスへのリクエストにのみミドルウェアが実行される。
 *
 * 保護対象:
 *   /dashboard  /dashboard/settings  /dashboard/prompts など
 *   /upgrade    /upgrade/plan        など
 */
export const config = {
  matcher: ['/dashboard/:path*', '/upgrade/:path*'],
}
