'use client'

/**
 * PromptVault LP — ナビバーコンポーネント
 *
 * fixed top-0 で常時表示。backdrop-blur でコンテンツとの視覚的な分離を実現。
 *
 * 左: PV ロゴアイコン（32×32 インディゴ rounded-lg）+ "PromptVault" テキスト
 * 右(PC): 「機能」「料金」アンカーリンク + CTA ボタン + JP/EN トグル
 * 右(モバイル): CTA ボタン + JP/EN トグルのみ（アンカーリンクは非表示）
 */

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

// ─── 型定義 ──────────────────────────────────────────────────────────────────

/** Lang 型（各ファイルでローカル宣言） */
type Lang = 'jp' | 'en'

/** ナビバーの Props 型 */
type NavbarProps = {
  lang: Lang
  /** 言語切り替えハンドラ — LandingPageClient から渡される */
  setLang: (l: Lang) => void
}

// ─── テキストコンテンツ ───────────────────────────────────────────────────────

/** JP/EN テキストコンテンツ */
const CONTENT = {
  jp: {
    features: '機能',
    pricing: '料金',
    cta: '無料で始める',
  },
  en: {
    features: 'Features',
    pricing: 'Pricing',
    cta: 'Get started',
  },
} as const

// ─── メインコンポーネント ─────────────────────────────────────────────────────

/**
 * LP ナビバー。
 * スクロール位置に関わらず画面上部に固定表示する。
 */
export default function Navbar({ lang, setLang }: NavbarProps) {
  const router = useRouter()
  const t = CONTENT[lang]

  /** セクション ID を受け取ってスムーズスクロールする */
  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* ── モバイルでナビリンクを非表示にする CSS ─────────────────────── */}
      <style>{`
        @media (max-width: 640px) {
          .pv-nav-links { display: none !important; }
        }
      `}</style>

      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          backgroundColor: 'rgba(8,8,8,0.85)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 50,
        }}
      >
        {/* ── ロゴ（クリックでページ最上部へ） ───────────────────────── */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
          }}
        >
          {/* PV ロゴアイコン（32×32 インディゴ 角丸） */}
          <div
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#6366F1',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 800,
              color: '#fff',
              flexShrink: 0,
              letterSpacing: '-0.5px',
            }}
          >
            PV
          </div>
          <span
            style={{ fontSize: '16px', fontWeight: 700, color: '#F0F0F0' }}
          >
            PromptVault
          </span>
        </button>

        {/* ── 右側コントロール ─────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {/* PC のみ表示: ナビゲーションリンク */}
          <nav
            className="pv-nav-links"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => scrollToSection('solution')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#8A8A8A',
                fontSize: '14px',
                fontWeight: 500,
                padding: '8px 12px',
                borderRadius: '8px',
              }}
            >
              {t.features}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('pricing')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#8A8A8A',
                fontSize: '14px',
                fontWeight: 500,
                padding: '8px 12px',
                borderRadius: '8px',
              }}
            >
              {t.pricing}
            </button>
          </nav>

          {/* CTA ボタン → /login */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/login')}
          >
            {t.cta}
          </Button>

          {/* JP/EN 言語切り替えトグル */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '8px',
              padding: '2px',
              gap: '2px',
            }}
          >
            {(['jp', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: lang === l ? '#F0F0F0' : '#4A4A4A',
                  backgroundColor: lang === l ? '#6366F1' : 'transparent',
                  transition: 'all 150ms ease',
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>
    </>
  )
}
