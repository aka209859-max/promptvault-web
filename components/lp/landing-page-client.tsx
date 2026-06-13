'use client'

/**
 * PromptVault LP — ランディングページクライアントコンポーネント
 *
 * LP の言語状態（JP/EN）を保持し、全セクションコンポーネントに
 * lang プロップとして伝播させる "use client" ラッパー。
 * Navbar には setLang と user も渡して言語切り替えとログイン状態 UI を実現する。
 *
 * レンダリング構成:
 *   Navbar（固定ヘッダー）
 *   ├─ Hero（ファーストビュー）
 *   ├─ Problem（課題提起）
 *   ├─ Solution（デモ UI）
 *   ├─ PricingSection（料金）
 *   ├─ Faq（よくある質問）
 *   ├─ FinalCta（最終 CTA）
 *   └─ Footer（コピーライト）
 */

import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import Navbar from './navbar'
import Hero from './hero'
import Problem from './problem'
import Solution from './solution'
import PricingSection from './pricing-section'
import Faq from './faq'
import FinalCta from './final-cta'
import Footer from './footer'

// ─── 型定義 ──────────────────────────────────────────────────────────────────

/** Lang 型（各ファイルでローカル宣言） */
type Lang = 'jp' | 'en'

/** LandingPageClient の Props 型 */
type LandingPageClientProps = {
  /** サーバーサイドで取得したログインユーザー。未ログイン時は null。 */
  user: User | null
}

// ─── メインコンポーネント ─────────────────────────────────────────────────────

/**
 * LP ランディングページクライアントコンポーネント。
 * lang 状態を保持し、全セクションに props として伝播する。
 * デフォルト言語は 'jp'。
 */
export default function LandingPageClient({ user }: LandingPageClientProps) {
  /** 言語状態: 'jp'（デフォルト）| 'en' */
  const [lang, setLang] = useState<Lang>('jp')

  return (
    <div style={{ backgroundColor: '#080808', minHeight: '100vh' }}>
      {/* ── ナビバー（fixed で常時表示） ────────────────────────────────── */}
      <Navbar lang={lang} setLang={setLang} user={user} />

      {/* ── ナビバーの高さ（64px）分のパディングオフセット ────────────── */}
      <div style={{ paddingTop: '64px' }}>
        {/* ヒーローセクション: ファーストビュー・キャッチコピー + CTA */}
        <Hero lang={lang} />

        {/* 課題提起セクション: 3 つのペインポイントカード */}
        <Problem lang={lang} />

        {/* ソリューションセクション: CSS ブラウザモック UI デモ */}
        <Solution lang={lang} />

        {/* 料金セクション: Free / Pro 2 枚カード */}
        <PricingSection lang={lang} />

        {/* FAQ セクション: 5 問アコーディオン */}
        <Faq lang={lang} />

        {/* 最終 CTA セクション: ページ末尾のコンバージョンポイント */}
        <FinalCta lang={lang} />

        {/* フッター: コピーライト + リンク */}
        <Footer lang={lang} />
      </div>
    </div>
  )
}
