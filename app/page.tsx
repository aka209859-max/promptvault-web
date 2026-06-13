/**
 * PromptVault Web — トップページ（LP）
 *
 * Server Component。サーバーサイドでログイン状態を取得し、
 * LandingPageClient（"use client"）に props として渡す。
 * セッション取得に失敗した場合（環境変数未設定等）は
 * user = null としてフォールバックし、LP は未ログイン状態で表示する。
 */

import LandingPageClient from '@/components/lp/landing-page-client'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

/**
 * LP トップページ。
 * サーバーサイドでユーザー情報を取得し、ナビバーのログイン状態 UI に反映する。
 */
export default async function Home() {
  // サーバーサイドで認証ユーザーを取得する
  // getUser() は JWT をサーバーで検証するため getSession() より安全
  let user: User | null = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Supabase 未設定環境（ローカル開発・CI 等）ではスキップして未ログイン表示
  }

  return <LandingPageClient user={user} />
}
