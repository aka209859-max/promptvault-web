/**
 * PromptVault Web — ダッシュボードページ（Server Component）
 *
 * 【Next.js 15対応】
 * `lib/supabase/server.ts` の `createClient()` は内部で `await cookies()` を
 * 実装済みのため、本ファイルでは `await createClient()` を呼ぶだけで
 * Next.js 15 の非同期 Cookie API に完全準拠する。
 *
 * 処理フロー:
 * 1. サーバー用 Supabase クライアントを生成（await cookies() 対応済み）
 * 2. getUser() で認証チェック → 未認証の場合は /login にリダイレクト
 * 3. profiles テーブルからユーザーの plan を取得
 * 4. prompts テーブルからプロンプト一覧を取得
 * 5. データを DashboardClient（クライアントコンポーネント）に props で渡す
 *
 * セキュリティ:
 * ミドルウェア（middleware.ts）でも未認証ガードを行っているが、
 * Server Component 側でも二重チェックすることで多層防御を実現する。
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPrompts } from '@/lib/prompts'
import DashboardClient from './dashboard-client'

/**
 * ダッシュボードページ。
 * 全データをサーバーサイドで取得し、クライアントコンポーネントに渡す。
 * これにより初期ロードが速く、SEO やセキュリティにも有利。
 */
export default async function DashboardPage() {
  // ─── 認証チェック ──────────────────────────────────────────────────────────
  // createClient() は await cookies() を内部処理済みの非同期関数
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 未認証の場合は即座に /login にリダイレクト
  // redirect() は Server Component から呼び出し可能（try/catch の外で使用）
  if (!user) {
    redirect('/login')
  }

  // ─── プランの取得 ──────────────────────────────────────────────────────────
  // profiles テーブルから該当ユーザーの plan を取得する。
  // レコードが存在しない場合（異常系）は 'free' にフォールバック。
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  // plan の値が 'pro' でない場合はすべて 'free' として扱う（型を確定させる）
  const plan: 'free' | 'pro' =
    profile?.plan === 'pro' ? 'pro' : 'free'

  // ─── プロンプト一覧の取得 ──────────────────────────────────────────────────
  // created_at 降順で取得（getPrompts 内部で order 設定済み）
  const prompts = await getPrompts(supabase)

  // ─── クライアントコンポーネントにデータを渡す ──────────────────────────────
  return (
    <DashboardClient
      initialPrompts={prompts}
      plan={plan}
      userEmail={user.email ?? ''}
    />
  )
}
