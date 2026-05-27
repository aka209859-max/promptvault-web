'use client'

/**
 * PromptVault LP — ヒーローセクションコンポーネント
 *
 * LP 最上部のファーストビュー。
 * h1 は clamp(40px,6vw,72px) で全画面サイズに対応する。
 * 背景グロー（インディゴ radial-gradient）でビジュアルの深みを演出する。
 *
 * JP: 「そのコピペ作業、」/ 「もう終わりにしよう。」
 * EN: "Stop copying." / "Start commanding."
 */

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

// ─── 型定義 ──────────────────────────────────────────────────────────────────

/** Lang 型（各ファイルでローカル宣言） */
type Lang = 'jp' | 'en'

/** コンポーネントの Props 型 */
type HeroProps = {
  lang: Lang
}

// ─── テキストコンテンツ ───────────────────────────────────────────────────────

/** JP/EN テキストコンテンツ */
const CONTENT = {
  jp: {
    badgeText: 'Chrome 拡張 + Web アプリ',
    line1: 'そのコピペ作業、',
    line2: 'もう終わりにしよう。',
    subtitle:
      '保存したプロンプトを「/」で瞬時に呼び出す。ChatGPT・Claude・Gemini すべてで動作。',
    primaryCta: '無料で始める →',
    secondaryCta: '料金を見る',
    trustBadge: '✓ クレジットカード不要　✓ 30秒でセットアップ　✓ いつでもキャンセル',
  },
  en: {
    badgeText: 'Chrome Extension + Web App',
    line1: 'Stop copying.',
    line2: 'Start commanding.',
    subtitle:
      'Summon your saved prompts instantly with "/". Works on ChatGPT, Claude, and Gemini.',
    primaryCta: 'Get started free →',
    secondaryCta: 'View pricing',
    trustBadge:
      '✓ No credit card required　✓ Set up in 30 seconds　✓ Cancel anytime',
  },
} as const

// ─── メインコンポーネント ─────────────────────────────────────────────────────

/**
 * ヒーローセクション。
 * LP の第一印象を決める最重要セクション。
 * 強いキャッチコピー + CTA で即座にコンバージョンを促す。
 */
export default function Hero({ lang }: HeroProps) {
  const router = useRouter()
  const t = CONTENT[lang]

  /** #pricing セクションへスムーズスクロールする */
  function scrollToPricing() {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      style={{
        backgroundColor: '#080808',
        paddingTop: '160px',
        paddingBottom: '120px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── 背景グロー（インディゴ radial-gradient） ──────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── コンテンツ（グローの手前に配置） ─────────────────────────── */}
      <div
        style={{
          position: 'relative',
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        {/* ── サービスカテゴリバッジ ────────────────────────────────────── */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '100px',
            backgroundColor: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.2)',
            marginBottom: '32px',
          }}
        >
          {/* アクセントカラーのドット */}
          <span
            style={{
              display: 'inline-block',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#6366F1',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#6366F1',
            }}
          >
            {t.badgeText}
          </span>
        </div>

        {/* ── メインキャッチコピー（H1 — 必ず clamp で大きく） ──────── */}
        <h1
          style={{
            fontSize: 'clamp(40px,6vw,72px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-1px',
            margin: '0 0 24px',
          }}
        >
          {/* 1行目: プライマリテキストカラー */}
          <span style={{ color: '#F0F0F0', display: 'block' }}>
            {t.line1}
          </span>
          {/* 2行目: インディゴアクセントカラー */}
          <span style={{ color: '#6366F1', display: 'block' }}>
            {t.line2}
          </span>
        </h1>

        {/* サブタイトル */}
        <p
          style={{
            fontSize: '18px',
            color: '#8A8A8A',
            lineHeight: 1.7,
            margin: '0 auto 48px',
            maxWidth: '560px',
          }}
        >
          {t.subtitle}
        </p>

        {/* ── CTA ボタン群 ────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* プライマリ CTA → /login */}
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/login')}
          >
            {t.primaryCta}
          </Button>

          {/* セカンダリ CTA → #pricing スムーズスクロール */}
          <Button
            variant="secondary"
            size="lg"
            onClick={scrollToPricing}
          >
            {t.secondaryCta}
          </Button>
        </div>

        {/* 信頼バッジ（クレジットカード不要など） */}
        <p
          style={{
            marginTop: '48px',
            fontSize: '13px',
            color: '#4A4A4A',
            lineHeight: 1.6,
          }}
        >
          {t.trustBadge}
        </p>
      </div>
    </section>
  )
}
