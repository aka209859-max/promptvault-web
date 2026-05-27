/**
 * PromptVault Web — アップグレードページ（Server Component）
 *
 * 処理フロー:
 * 1. サーバー用 Supabase クライアントを生成
 * 2. getUser() で認証チェック → 未認証の場合は /login にリダイレクト
 * 3. profiles テーブルから plan を取得
 * 4. plan === 'pro' のユーザーはすでにアップグレード済みのため /dashboard にリダイレクト
 * 5. userId を UpgradeClient に渡す（チェックアウト API 呼び出しで使用）
 *
 * userId をサーバーサイドで取得することで、クライアントへの露出リスクを低減する。
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UpgradeClient from './upgrade-client'

/**
 * アップグレードページ。
 * 認証とプランチェックをサーバーサイドで行い、
 * UpgradeClient に userId を安全に渡す。
 */
export default async function UpgradePage() {
  // ─── 認証チェック ──────────────────────────────────────────────────────────
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // ─── プランの取得 ──────────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan: 'free' | 'pro' =
    profile?.plan === 'pro' ? 'pro' : 'free'

  // Pro プランのユーザーはアップグレード不要のためダッシュボードへ戻す
  if (plan === 'pro') {
    redirect('/dashboard')
  }

  // ─── クライアントコンポーネントに userId を渡す ────────────────────────────
  return <UpgradeClient userId={user.id} />
}
