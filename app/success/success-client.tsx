'use client'

/**
 * PromptVault Web — 課金完了クライアントコンポーネント
 *
 * Stripe 決済完了後に表示される画面。
 * アニメーション付きのチェックマークとナビゲーションカードを表示する。
 *
 * アニメーション仕様:
 *   - useEffect で mounted フラグを立て、SSR でのちらつきを防ぐ
 *   - チェックマーク円: tw-animate-css の animate-in zoom-in fade-in duration-500
 *
 * ナビゲーション:
 *   - ダッシュボードへ → router.push('/dashboard')
 *   - Chrome拡張機能を使う → Chrome ウェブストアを新しいタブで開く
 *     （CHROME_EXTENSION_URL は実際のストア URL に差し替えること）
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Chrome ウェブストアの拡張機能 URL。
 * 公開後に実際の URL に更新すること。
 */
const CHROME_EXTENSION_URL = 'https://chrome.google.com/webstore'

// ─── コンポーネント ────────────────────────────────────────────────────────────

/**
 * 課金完了画面の UI 本体。
 * アニメーション付きのチェックマーク + 完了メッセージ + ナビゲーションカードを表示する。
 */
export default function SuccessClient() {
  const router = useRouter()

  /**
   * マウント済みフラグ。
   * SSR ではアニメーションクラスを適用しないことでちらつきを防ぐ。
   * useEffect はクライアントサイドでのみ実行されるため、
   * mounted は必ず CSR 後に true になる。
   */
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // ─── レンダリング ──────────────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#080808',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      {/*
       * 完了カード
       * 中央に配置された白いカードの中にアニメーションと
       * ナビゲーションカードをまとめる。
       */}
      <div
        style={{
          backgroundColor: '#111111',
          border: '1px solid #222222',
          borderRadius: '20px',
          padding: '48px 40px',
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '28px',
        }}
      >
        {/*
         * チェックマーク円アイコン
         * mounted が true になったタイミングで tw-animate-css のクラスを付与。
         * SSR 時は opacity-0 で非表示にし、CSR 後にアニメーション開始。
         */}
        <div
          className={
            mounted
              ? 'animate-in zoom-in fade-in duration-500'
              : 'opacity-0'
          }
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.14)',
            border: '2px solid rgba(16, 185, 129, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {/* チェックマーク SVG */}
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 18l6 6 11-11"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* ─── 完了メッセージ ─────────────────────────────────────────── */}
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#F0F0F0',
              margin: '0 0 10px',
              letterSpacing: '-0.3px',
            }}
          >
            アップグレード完了！
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: '#8A8A8A',
              margin: 0,
              lineHeight: '1.7',
            }}
          >
            Proプランへようこそ。
            <br />
            すべての機能が使えるようになりました。
          </p>
        </div>

        {/* ─── ナビゲーションカード ────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%',
          }}
        >
          {/*
           * ダッシュボードへ（プライマリアクション）
           * インディゴ背景 + hover で一段濃くなる
           */}
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            style={{
              width: '100%',
              padding: '16px 20px',
              backgroundColor: '#6366F1',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4F46E5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6366F1'
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                ダッシュボードへ
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.65)',
                  marginTop: '2px',
                }}
              >
                プロンプトの管理を始める
              </div>
            </div>
            <span
              style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px' }}
              aria-hidden="true"
            >
              →
            </span>
          </button>

          {/*
           * Chrome 拡張機能を使う（セカンダリアクション）
           * ダーク背景 + hover でインディゴボーダー
           */}
          <button
            type="button"
            onClick={() => window.open(CHROME_EXTENSION_URL, '_blank', 'noopener,noreferrer')}
            style={{
              width: '100%',
              padding: '16px 20px',
              backgroundColor: '#1A1A1A',
              border: '1px solid #222222',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#6366F1'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#222222'
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#F0F0F0',
                }}
              >
                Chrome拡張機能を使う
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#8A8A8A',
                  marginTop: '2px',
                }}
              >
                AIチャットでスラッシュコマンドを有効化
              </div>
            </div>
            <span
              style={{ color: '#8A8A8A', fontSize: '16px' }}
              aria-hidden="true"
            >
              ↗
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
