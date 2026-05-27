/**
 * PromptVault Web — アップグレードページ（Server Component）
 *
 * 処理フロー:
 * 1. サーバー用 Supabase クライアントを生成
 * 2. getUser() で認証チェック → 未認証の場合は /login にリダイレクト
 * 3. profiles テーブルから plan を取得
 * 4. plan === 'pro' のユーザーはすでにアップグレード済みのため /dashboard にリダイレクト
 * 5. UpgradeClient をレンダリング（props なし）
 *
 * Checkout API はサーバーサイドで cookies から認証情報を取得するため、
 * UpgradeClient への userId の受け渡しは不要。
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UpgradeClient from './upgrade-client'

/**
 * アップグレードページ。
 * 認証とプランチェックをサーバーサイドで行い、
 * Pro プランのユーザーはダッシュボードへリダイレクトする。
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

  // ─── クライアントコンポーネントをレンダリング ──────────────────────────────
  // create-checkout API がサーバーサイドで cookies から認証情報を取得するため、
  // UpgradeClient への props は不要
  return <UpgradeClient />
}
