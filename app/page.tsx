/**
 * PromptVault Web — トップページ（LP）
 *
 * Server Component。
 * LandingPageClient を render するだけのシンプルなラッパー。
 * 言語状態の管理と全セクションの描画は LandingPageClient（"use client"）が担う。
 */

import LandingPageClient from '@/components/lp/landing-page-client'

/**
 * LP トップページ。
 * ランディングページクライアントコンポーネントをレンダリングする。
 */
export default function Home() {
  return <LandingPageClient />
}
