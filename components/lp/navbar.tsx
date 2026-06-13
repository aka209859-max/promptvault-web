'use client'

/**
 * PromptVault LP — ナビバーコンポーネント
 *
 * fixed top-0 で常時表示。backdrop-blur でコンテンツとの視覚的な分離を実現。
 *
 * 左: PV ロゴアイコン（32×32 インディゴ rounded-lg）+ "PromptVault" テキスト
 * 右(PC): 「機能」「料金」アンカーリンク + 認証 UI + JP/EN トグル
 * 右(モバイル): 認証 UI + JP/EN トグルのみ（アンカーリンクは非表示）
 *
 * 認証 UI:
 *   未ログイン → 「無料で始める」CTA ボタン（/login へ遷移）
 *   ログイン済み → 「ダッシュボード」ボタン + アバタードロップダウン（ログアウト付き）
 */

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

// ─── 型定義 ──────────────────────────────────────────────────────────────────

/** Lang 型（各ファイルでローカル宣言） */
type Lang = 'jp' | 'en'

/** ナビバーの Props 型 */
type NavbarProps = {
  lang: Lang
  /** 言語切り替えハンドラ — LandingPageClient から渡される */
  setLang: (l: Lang) => void
  /** ログイン中のユーザー。未ログイン時は null。 */
  user: User | null
}

// ─── テキストコンテンツ ───────────────────────────────────────────────────────

/** JP/EN テキストコンテンツ */
const CONTENT = {
  jp: {
    features: '機能',
    pricing: '料金',
    cta: '無料で始める',
    dashboard: 'ダッシュボード',
    signout: 'ログアウト',
    signingOut: '処理中...',
    userMenuLabel: 'ユーザーメニューを開く',
  },
  en: {
    features: 'Features',
    pricing: 'Pricing',
    cta: 'Get started',
    dashboard: 'Dashboard',
    signout: 'Sign out',
    signingOut: 'Signing out...',
    userMenuLabel: 'Open user menu',
  },
} as const

// ─── メインコンポーネント ─────────────────────────────────────────────────────

/**
 * LP ナビバー。
 * スクロール位置に関わらず画面上部に固定表示する。
 * user が null の場合は未ログイン UI、null 以外はログイン済み UI を表示する。
 */
export default function Navbar({ lang, setLang, user }: NavbarProps) {
  const router = useRouter()
  // ブラウザ用 Supabase クライアント（signOut のみ使用）
  const supabase = createClient()
  const t = CONTENT[lang]

  /** アバタードロップダウンの表示フラグ */
  const [showUserMenu, setShowUserMenu] = useState(false)
  /** ログアウト処理中フラグ */
  const [logoutLoading, setLogoutLoading] = useState(false)
  /** ドロップダウンコンテナの ref（クリックアウト検知用） */
  const menuRef = useRef<HTMLDivElement>(null)

  /** セクション ID を受け取ってスムーズスクロールする */
  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  /**
   * ドロップダウン外クリックでメニューを閉じる。
   * showUserMenu が true の間のみリスナーを登録してパフォーマンスを最適化する。
   */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  /**
   * ログアウト処理。
   * Supabase のセッションを削除後、Server Component を再実行して
   * user = null 状態の UI に切り替える。
   */
  async function handleLogout() {
    setLogoutLoading(true)
    try {
      await supabase.auth.signOut()
    } catch {
      // ログアウト失敗時もクライアント側の状態をリセットしてトップへ遷移する
    } finally {
      setLogoutLoading(false)
      setShowUserMenu(false)
      // サーバーコンポーネントを再レンダリングして user = null を反映する
      router.refresh()
      router.push('/')
    }
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

          {user ? (
            // ── ログイン済み: ダッシュボードボタン + アバタードロップダウン ────
            <>
              {/* ダッシュボードへのリンクボタン */}
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                style={{
                  background: 'rgba(99,102,241,0.15)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  cursor: 'pointer',
                  color: '#A5B4FC',
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '6px 14px',
                  borderRadius: '8px',
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99,102,241,0.25)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(99,102,241,0.15)'
                }}
              >
                {t.dashboard}
              </button>

              {/* アバターボタン + ドロップダウンメニュー */}
              <div ref={menuRef} style={{ position: 'relative' }}>
                {/* ユーザーのメールアドレス頭文字をアバターとして表示 */}
                <button
                  type="button"
                  onClick={() => setShowUserMenu((prev) => !prev)}
                  aria-label={t.userMenuLabel}
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#6366F1',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    letterSpacing: '-0.5px',
                  }}
                >
                  {(user.email?.[0] ?? 'U').toUpperCase()}
                </button>

                {/* ── ドロップダウンメニュー ───────────────────────────── */}
                {showUserMenu && (
                  <div
                    role="menu"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      backgroundColor: '#1A1A1A',
                      border: '1px solid #2A2A2A',
                      borderRadius: '8px',
                      padding: '8px',
                      minWidth: '180px',
                      zIndex: 100,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                    }}
                  >
                    {/* ユーザーのメールアドレス（情報表示） */}
                    <div
                      style={{
                        padding: '6px 8px 10px',
                        fontSize: '12px',
                        color: '#8A8A8A',
                        borderBottom: '1px solid #2A2A2A',
                        marginBottom: '4px',
                        wordBreak: 'break-all',
                        lineHeight: 1.4,
                      }}
                    >
                      {user.email}
                    </div>

                    {/* ログアウトボタン */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      disabled={logoutLoading}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: 'none',
                        border: 'none',
                        cursor: logoutLoading ? 'not-allowed' : 'pointer',
                        color: '#EF4444',
                        fontSize: '13px',
                        fontWeight: 500,
                        textAlign: 'left',
                        borderRadius: '4px',
                        opacity: logoutLoading ? 0.5 : 1,
                        transition: 'background 100ms ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!logoutLoading) {
                          e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none'
                      }}
                    >
                      {logoutLoading ? t.signingOut : t.signout}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            // ── 未ログイン: 「無料で始める」CTA ボタン ──────────────────
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push('/login')}
            >
              {t.cta}
            </Button>
          )}

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
