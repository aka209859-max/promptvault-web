'use client'

/**
 * PromptVault LP — 最終 CTA セクションコンポーネント
 *
 * LP の締めとして再度コールトゥアクションを提示しコンバージョンを促す。
 * Hero と同等のグロー装飾 + CTA ボタン群を配置する。
 */

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

// ─── 型定義 ──────────────────────────────────────────────────────────────────

/** Lang 型（各ファイルでローカル宣言） */
type Lang = 'jp' | 'en'

/** コンポーネントの Props 型 */
type FinalCtaProps = {
  lang: Lang
}

// ─── テキストコンテンツ ───────────────────────────────────────────────────────

/** JP/EN テキストコンテンツ */
const CONTENT = {
  jp: {
    title: '今すぐ始める',
    subtitle: '30秒でセットアップ。クレジットカード不要。',
    primaryCta: '無料で始める →',
    secondaryCta: '料金を見る',
  },
  en: {
    title: 'Start for free today',
    subtitle: 'Set up in 30 seconds. No credit card required.',
    primaryCta: 'Get started free →',
    secondaryCta: 'View pricing',
  },
} as const

// ─── メインコンポーネント ─────────────────────────────────────────────────────

/**
 * 最終 CTA セクション。
 * ページ末尾で再度行動を促す重要なコンバージョンポイント。
 */
export default function FinalCta({ lang }: FinalCtaProps) {
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
        padding: '120px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── 背景グロー（下方向に配置してフッターとの境界を演出） ────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-200px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── コンテンツ ──────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          maxWidth: '560px',
          margin: '0 auto',
        }}
      >
        {/* タイトル */}
        <h2
          style={{
            fontSize: 'clamp(28px,4vw,48px)',
            fontWeight: 800,
            color: '#F0F0F0',
            margin: '0 0 16px',
            letterSpacing: '-0.5px',
            lineHeight: 1.2,
          }}
        >
          {t.title}
        </h2>

        {/* サブタイトル */}
        <p
          style={{
            fontSize: '16px',
            color: '#8A8A8A',
            margin: '0 0 40px',
            lineHeight: 1.6,
          }}
        >
          {t.subtitle}
        </p>

        {/* CTA ボタン群 */}
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
      </div>
    </section>
  )
}
