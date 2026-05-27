'use client'

/**
 * PromptVault LP — 料金セクションコンポーネント
 *
 * Free / Pro の料金カードを JP/EN 対応で表示する。
 * upgrade-client.tsx の PricingCard 設計パターンを踏襲。
 * LP 上の CTA は Stripe ではなく /login へ誘導する。
 *
 * JP: Free ¥0/月 / Pro ¥980/月
 * EN: Free $0/mo / Pro $9.99/mo
 */

import { type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

// ─── 型定義 ──────────────────────────────────────────────────────────────────

/** Lang 型（各ファイルでローカル宣言） */
type Lang = 'jp' | 'en'

/** コンポーネントの Props 型 */
type PricingSectionProps = {
  lang: Lang
}

/** 機能リストアイテムの型 */
type FeatureItem = {
  text: string
  available: boolean
}

/** 料金カードコンポーネントの Props 型 */
type PricingCardProps = {
  title: string
  badge: string
  badgeStyle: 'current' | 'recommended'
  priceLabel: string
  priceNote: string
  features: FeatureItem[]
  isPro?: boolean
  footer: ReactNode
}

// ─── 機能一覧定数 ──────────────────────────────────────────────────────────

/** JP — Free プラン機能一覧 */
const FREE_FEATURES_JP: FeatureItem[] = [
  { text: 'プロンプト保存（最大 30 件）', available: true },
  { text: 'スラッシュコマンド（/ コマンド）', available: true },
  { text: 'ChatGPT / Claude / Gemini 対応', available: true },
  { text: '無制限プロンプト保存', available: false },
  { text: '優先サポート', available: false },
]

/** JP — Pro プラン機能一覧 */
const PRO_FEATURES_JP: FeatureItem[] = [
  { text: 'プロンプト保存（無制限）', available: true },
  { text: 'スラッシュコマンド（/ コマンド）', available: true },
  { text: 'ChatGPT / Claude / Gemini 対応', available: true },
  { text: '無制限プロンプト保存', available: true },
  { text: '優先サポート', available: true },
]

/** EN — Free プラン機能一覧 */
const FREE_FEATURES_EN: FeatureItem[] = [
  { text: 'Save up to 30 prompts', available: true },
  { text: 'Slash command (/ trigger)', available: true },
  { text: 'ChatGPT / Claude / Gemini', available: true },
  { text: 'Unlimited prompt storage', available: false },
  { text: 'Priority support', available: false },
]

/** EN — Pro プラン機能一覧 */
const PRO_FEATURES_EN: FeatureItem[] = [
  { text: 'Unlimited prompt storage', available: true },
  { text: 'Slash command (/ trigger)', available: true },
  { text: 'ChatGPT / Claude / Gemini', available: true },
  { text: 'All future features', available: true },
  { text: 'Priority support', available: true },
]

// ─── テキストコンテンツ ───────────────────────────────────────────────────────

/** JP/EN テキストコンテンツ */
const CONTENT = {
  jp: {
    sectionLabel: '料金',
    title: 'シンプルな料金体系',
    subtitle: 'まずは無料で始めて、必要になったらアップグレード。',
    freePriceLabel: '¥0 / 月',
    freePriceNote: '永久無料',
    proPriceLabel: '¥980 / 月',
    proPriceNote: 'いつでもキャンセル可',
    freeBadge: 'Free',
    proBadge: 'おすすめ',
    freeCta: '無料で始める',
    proCta: 'Pro で始める →',
    freeFeatures: FREE_FEATURES_JP,
    proFeatures: PRO_FEATURES_JP,
  },
  en: {
    sectionLabel: 'Pricing',
    title: 'Simple pricing',
    subtitle: 'Start free. Upgrade when you need more.',
    freePriceLabel: '$0 / mo',
    freePriceNote: 'Free forever',
    proPriceLabel: '$9.99 / mo',
    proPriceNote: 'Cancel anytime',
    freeBadge: 'Free',
    proBadge: 'Recommended',
    freeCta: 'Get started free',
    proCta: 'Start with Pro →',
    freeFeatures: FREE_FEATURES_EN,
    proFeatures: PRO_FEATURES_EN,
  },
} as const

// ─── サブコンポーネント ────────────────────────────────────────────────────────

/**
 * 料金カードコンポーネント。
 * upgrade-client.tsx の PricingCard と同等の設計パターンを使用。
 * isPro フラグでボーダーカラー・背景・アイコンカラーを切り替える。
 */
function PricingCard({
  title,
  badge,
  badgeStyle,
  priceLabel,
  priceNote,
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
      {/* ── カードヘッダー ─────────────────────────────────────────────── */}
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
              border: `1px solid ${
                badgeStyle === 'recommended'
                  ? 'rgba(99,102,241,0.3)'
                  : '#333333'
              }`,
            }}
          >
            {badge}
          </span>
        </div>

        {/* 料金表示 */}
        <p
          style={{
            fontSize: isPro ? '28px' : '24px',
            fontWeight: 800,
            color: '#F0F0F0',
            margin: '0 0 4px',
            letterSpacing: '-0.5px',
          }}
        >
          {priceLabel}
        </p>
        {/* 料金注記 */}
        <p style={{ fontSize: '13px', color: '#4A4A4A', margin: 0 }}>
          {priceNote}
        </p>
      </div>

      {/* ── 機能リスト ─────────────────────────────────────────────────── */}
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

      {/* ── フッター（CTA ボタン） ──────────────────────────────────────── */}
      <div style={{ marginTop: 'auto' }}>{footer}</div>
    </div>
  )
}

// ─── メインコンポーネント ─────────────────────────────────────────────────────

/**
 * 料金セクション。
 * Free / Pro カードを 2 列で並べ、登録ページへ誘導する。
 */
export default function PricingSection({ lang }: PricingSectionProps) {
  const router = useRouter()
  const t = CONTENT[lang]

  return (
    <section
      id="pricing"
      style={{
        backgroundColor: '#080808',
        padding: '100px 24px',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* ── セクションヘッダー ─────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          {/* セクションラベルバッジ */}
          <span
            style={{
              display: 'inline-block',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: '#6366F1',
              textTransform: 'uppercase',
              marginBottom: '16px',
              padding: '4px 12px',
              borderRadius: '100px',
              backgroundColor: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            {t.sectionLabel}
          </span>

          <h2
            style={{
              fontSize: 'clamp(24px,3.5vw,40px)',
              fontWeight: 800,
              color: '#F0F0F0',
              margin: '0 0 16px',
              letterSpacing: '-0.5px',
            }}
          >
            {t.title}
          </h2>

          <p style={{ fontSize: '16px', color: '#8A8A8A', margin: 0 }}>
            {t.subtitle}
          </p>
        </div>

        {/* ── 料金カード 2列 ─────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            maxWidth: '680px',
            margin: '0 auto',
            alignItems: 'stretch',
            flexWrap: 'wrap',
          }}
        >
          {/* Free カード */}
          <div style={{ flex: '1 1 280px', minWidth: '0' }}>
            <PricingCard
              title="Free"
              badge={t.freeBadge}
              badgeStyle="current"
              priceLabel={t.freePriceLabel}
              priceNote={t.freePriceNote}
              features={t.freeFeatures}
              isPro={false}
              footer={
                <Button
                  variant="secondary"
                  onClick={() => router.push('/login')}
                  style={{ width: '100%', height: '48px', fontSize: '15px' }}
                >
                  {t.freeCta}
                </Button>
              }
            />
          </div>

          {/* Pro カード */}
          <div style={{ flex: '1 1 280px', minWidth: '0' }}>
            <PricingCard
              title="Pro"
              badge={t.proBadge}
              badgeStyle="recommended"
              priceLabel={t.proPriceLabel}
              priceNote={t.proPriceNote}
              features={t.proFeatures}
              isPro
              footer={
                <Button
                  variant="primary"
                  onClick={() => router.push('/login')}
                  style={{ width: '100%', height: '48px', fontSize: '15px' }}
                >
                  {t.proCta}
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </section>
  )
}
