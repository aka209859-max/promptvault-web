'use client'

/**
 * PromptVault Web — アップグレードクライアントコンポーネント
 *
 * Free / Pro プランを比較する料金カードを表示し、
 * Stripe Checkout へのリダイレクトを処理する。
 *
 * チェックアウトフロー:
 * 1. "アップグレードする" ボタンをクリック
 * 2. POST /api/create-checkout を呼び出す（認証情報はサーバーが cookies から取得）
 * 3. レスポンスの url に window.location.href でリダイレクト
 * 4. Stripe 決済完了後、/success にリダイレクト（cancel_url: /upgrade）
 */

import { useState } from 'react'
import { type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

// ─── 型定義 ──────────────────────────────────────────────────────────────────

/**
 * UpgradeClient の Props 型。
 * サーバーが cookies から認証情報を取得するため、クライアントからの userId 受け渡しは不要。
 */
type UpgradeClientProps = Record<string, never>

/**
 * /api/create-checkout のレスポンス型（判別共用体）。
 * 'error' キーの有無で成功・失敗を判別する。
 */
type CheckoutResponse = { url: string } | { error: string }

/**
 * 機能リストのアイテム型。
 * available = false の場合はグレーアウト（× アイコン）で表示する。
 */
type FeatureItem = {
  text: string
  available: boolean
}

/** PricingCard コンポーネントの Props 型 */
type PricingCardProps = {
  title: string
  badge: string
  badgeStyle: 'current' | 'recommended'
  priceLabel: string
  features: FeatureItem[]
  isPro?: boolean
  footer: ReactNode
}

// ─── 定数 ────────────────────────────────────────────────────────────────────

/** Free プランの機能一覧 */
const FREE_FEATURES: FeatureItem[] = [
  { text: 'プロンプト保存（最大 30 件）', available: true },
  { text: 'スラッシュコマンド（/ コマンド）', available: true },
  { text: 'ChatGPT / Claude / Gemini 対応', available: true },
  { text: '無制限プロンプト保存', available: false },
  { text: '優先サポート', available: false },
]

/** Pro プランの機能一覧 */
const PRO_FEATURES: FeatureItem[] = [
  { text: 'プロンプト保存（無制限）', available: true },
  { text: 'スラッシュコマンド（/ コマンド）', available: true },
  { text: 'ChatGPT / Claude / Gemini 対応', available: true },
  { text: '無制限プロンプト保存', available: true },
  { text: '優先サポート', available: true },
]

// ─── サブコンポーネント ────────────────────────────────────────────────────────

/**
 * 料金カードコンポーネント。
 * Free と Pro の両方で使用する共通 UI。
 * isPro フラグで背景色・ボーダーカラー・アイコンカラーを切り替える。
 */
function PricingCard({
  title,
  badge,
  badgeStyle,
  priceLabel,
  features,
  isPro = false,
  footer,
}: PricingCardProps) {
  // Pro カード専用のスタイル値
  const borderColor = isPro ? '#6366F1' : '#222222'
  const bgColor = isPro ? '#0D0D1A' : '#111111'
  const checkColor = isPro ? '#6366F1' : '#10B981'
  const checkBg = isPro ? 'rgba(99,102,241,0.18)' : 'rgba(16,185,129,0.14)'

  return (
    <div
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '16px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        height: '100%',
        boxSizing: 'border-box',
        // Pro カードにはインディゴのグロー効果を付与
        boxShadow: isPro ? '0 0 32px rgba(99,102,241,0.18)' : 'none',
      }}
    >
      {/* ─── カードヘッダー ─────────────────────────────────────────────── */}
      <div>
        {/* プラン名 + ステータスバッジ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '14px',
          }}
        >
          <span
            style={{ fontSize: '20px', fontWeight: 700, color: '#F0F0F0' }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '100px',
              backgroundColor:
                badgeStyle === 'recommended'
                  ? 'rgba(99,102,241,0.15)'
                  : '#1A1A1A',
              color:
                badgeStyle === 'recommended' ? '#6366F1' : '#8A8A8A',
              border: `1px solid ${badgeStyle === 'recommended' ? 'rgba(99,102,241,0.3)' : '#333333'}`,
            }}
          >
            {badge}
          </span>
        </div>

        {/* 料金ラベル */}
        <p style={{ fontSize: '14px', color: '#8A8A8A', margin: 0 }}>
          {priceLabel}
        </p>
      </div>

      {/* ─── 機能リスト ─────────────────────────────────────────────────── */}
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {features.map((feature) => (
          <li
            key={feature.text}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              color: feature.available ? '#D0D0D0' : '#444444',
            }}
          >
            {feature.available ? (
              /* チェックマークアイコン（利用可能） */
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{ flexShrink: 0 }}
                aria-hidden="true"
              >
                <circle cx="8" cy="8" r="8" fill={checkBg} />
                <path
                  d="M5 8l2 2 4-4"
                  stroke={checkColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              /* × アイコン（利用不可） */
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{ flexShrink: 0 }}
                aria-hidden="true"
              >
                <circle cx="8" cy="8" r="8" fill="rgba(255,255,255,0.04)" />
                <path
                  d="M5.5 5.5l5 5M10.5 5.5l-5 5"
                  stroke="#444444"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {feature.text}
          </li>
        ))}
      </ul>

      {/* ─── フッター（CTA / 現在プラン表示） ───────────────────────────── */}
      <div style={{ marginTop: 'auto' }}>{footer}</div>
    </div>
  )
}

// ─── メインコンポーネント ─────────────────────────────────────────────────────

/**
 * アップグレード UI 本体。
 * ヘッダー + Free / Pro 料金カード + チェックアウト処理を内包する。
 */
export default function UpgradeClient(_props: UpgradeClientProps) {
  const router = useRouter()

  // ─── 状態管理 ────────────────────────────────────────────────────────────
  /** チェックアウト API の処理中フラグ */
  const [loading, setLoading] = useState(false)
  /** チェックアウト API のエラーメッセージ（null = エラーなし） */
  const [error, setError] = useState<string | null>(null)

  // ─── チェックアウトハンドラ ──────────────────────────────────────────────

  /**
   * Stripe Checkout を開始する。
   * /api/create-checkout に POST し、返ってきた URL にリダイレクトする。
   */
  async function handleCheckout() {
    setLoading(true)
    setError(null)

    try {
      // 認証情報（ユーザーのメールアドレス）はサーバーが cookies から取得するため、
      // リクエストボディには何も含める必要がない
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
      })

      // レスポンスを判別共用体として型付けする
      const data: CheckoutResponse = await res.json() as CheckoutResponse

      if ('error' in data) {
        // API エラー: エラーメッセージを表示してボタンを再度有効化
        setError(data.error)
        setLoading(false)
        return
      }

      // 成功: Stripe の決済ページへリダイレクト
      // window.location.href を使うことで Next.js のルーターをバイパスし、
      // 外部 URL への完全なページ遷移を行う
      window.location.href = data.url
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'チェックアウトの開始に失敗しました。しばらく時間をおいて再試行してください。',
      )
      setLoading(false)
    }
  }

  // ─── レンダリング ────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080808' }}>
      {/* ── ヘッダー ────────────────────────────────────────────────────── */}
      <header
        style={{
          height: '56px',
          backgroundColor: '#111111',
          borderBottom: '1px solid #222222',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        {/* PromptVault ロゴ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              backgroundColor: '#6366F1',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
              letterSpacing: '-0.5px',
            }}
          >
            PV
          </div>
          <span
            style={{ fontSize: '15px', fontWeight: 600, color: '#F0F0F0' }}
          >
            PromptVault
          </span>
        </div>

        {/* ← ダッシュボードへ戻るリンク */}
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#8A8A8A',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 8px',
            borderRadius: '6px',
          }}
        >
          ← ダッシュボードへ戻る
        </button>
      </header>

      {/* ── メインコンテンツ ─────────────────────────────────────────────── */}
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '64px 24px 80px',
        }}
      >
        {/* ページタイトル */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#F0F0F0',
              margin: '0 0 12px',
              letterSpacing: '-0.5px',
            }}
          >
            Proプランにアップグレード
          </h1>
          <p style={{ fontSize: '15px', color: '#8A8A8A', margin: 0 }}>
            無制限のプロンプト保存と、すべての機能をご利用いただけます。
          </p>
        </div>

        {/* ── 料金カード（2カラム） ─────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            maxWidth: '680px',
            width: '100%',
            alignItems: 'stretch',
            flexWrap: 'wrap',
          }}
        >
          {/* Free カード */}
          <div style={{ flex: '1 1 280px', minWidth: '0' }}>
            <PricingCard
              title="Free"
              badge="現在のプラン"
              badgeStyle="current"
              priceLabel="¥0 / 月"
              features={FREE_FEATURES}
              isPro={false}
              footer={
                /* 現在利用中の状態表示（クリック不可） */
                <div
                  style={{
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '10px',
                    backgroundColor: '#1A1A1A',
                    fontSize: '14px',
                    color: '#4A4A4A',
                    border: '1px solid #222222',
                  }}
                >
                  現在ご利用中
                </div>
              }
            />
          </div>

          {/* Pro カード */}
          <div style={{ flex: '1 1 280px', minWidth: '0' }}>
            <PricingCard
              title="Pro"
              badge="おすすめ"
              badgeStyle="recommended"
              priceLabel="月額サブスクリプション"
              features={PRO_FEATURES}
              isPro
              footer={
                <Button
                  variant="primary"
                  onClick={handleCheckout}
                  disabled={loading}
                  style={{ width: '100%', height: '48px', fontSize: '15px' }}
                >
                  {loading ? '処理中...' : 'アップグレードする →'}
                </Button>
              }
            />
          </div>
        </div>

        {/* エラーメッセージ */}
        {error !== null && (
          <div
            role="alert"
            style={{
              marginTop: '24px',
              maxWidth: '560px',
              width: '100%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#EF4444',
              fontSize: '13px',
              lineHeight: '1.5',
            }}
          >
            {error}
          </div>
        )}

        {/* セキュリティ注記 */}
        <p
          style={{
            marginTop: '40px',
            fontSize: '12px',
            color: '#4A4A4A',
            textAlign: 'center',
            maxWidth: '400px',
            lineHeight: '1.8',
            margin: '40px auto 0',
          }}
        >
          🔒 クレジットカード情報は Stripe が安全に管理します。
          <br />
          いつでもキャンセル可能です。
        </p>
      </main>
    </div>
  )
}
