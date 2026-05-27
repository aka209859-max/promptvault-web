'use client'

/**
 * PromptVault LP — FAQ セクションコンポーネント
 *
 * 5 問のアコーディオン形式で Q&A を表示する。
 * useState<number | null>(null) でオープンインデックスを管理し、
 * max-height トランジションでスムーズな開閉アニメーションを実現する。
 *
 * Q&A の内容はユーザー確認済みのテキストをそのまま使用する。
 */

import { useState } from 'react'

// ─── 型定義 ──────────────────────────────────────────────────────────────────

/** Lang 型（各ファイルでローカル宣言） */
type Lang = 'jp' | 'en'

/** コンポーネントの Props 型 */
type FaqProps = {
  lang: Lang
}

/** FAQ アイテムの型 */
type FaqItem = {
  question: string
  answer: string
}

// ─── FAQ コンテンツ ───────────────────────────────────────────────────────────

/** JP の FAQ コンテンツ（ユーザー確認済み・原文そのまま使用） */
const FAQ_JP: FaqItem[] = [
  {
    question: '無料プランでも十分使えますか？',
    answer:
      'はい。/ コマンドでのプロンプト呼び出し・保存（30件まで）は完全無料です。まず無料で始めて、物足りなくなったらProへ。',
  },
  {
    question: 'ChatGPT・Claude・Gemini以外でも使えますか？',
    answer:
      'はい。Webアプリ版はスマホ・PC・全ブラウザで動作します。Chrome拡張版はChatGPT・Claude・Geminiに特化した最適化がされています。',
  },
  {
    question: '解約はいつでもできますか？',
    answer:
      'はい。Stripeの管理画面からいつでも解約できます。解約後は次の更新日までProプランが使えます。',
  },
  {
    question: 'プロンプトのデータは安全ですか？',
    answer:
      'はい。データはSupabaseの暗号化されたデータベースに保存されます。他のユーザーがあなたのプロンプトを見ることはできません。',
  },
  {
    question: 'AIの自動改善機能はどう動きますか？',
    answer:
      '保存したプロンプトの横にある ✨ ボタンを押すと、Claude APIがプロンプトを自動で改善し、改善前後を並べて表示します。採用するかどうかはあなたが決めます。',
  },
]

/** EN の FAQ コンテンツ（ユーザー確認済み・原文そのまま使用） */
const FAQ_EN: FaqItem[] = [
  {
    question: 'Is the free plan good enough?',
    answer:
      'Yes. The / command, prompt storage (up to 30), and all browser support are free forever.',
  },
  {
    question: 'Does it work outside of ChatGPT/Claude/Gemini?',
    answer:
      'The web app works on any device and browser. The Chrome extension is optimized for ChatGPT, Claude, and Gemini with native integration.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes. Cancel anytime from your Stripe billing portal. You keep Pro access until the end of your billing period.',
  },
  {
    question: 'Is my data safe?',
    answer:
      'Yes. Your prompts are stored in Supabase with row-level security. Only you can access your data.',
  },
  {
    question: 'How does the AI auto-improve work?',
    answer:
      'Click the ✨ button next to any saved prompt. Claude API rewrites it to be more effective and shows you the before/after. You decide whether to keep the new version.',
  },
]

/** テキストコンテンツ（JP/EN） */
const CONTENT = {
  jp: {
    sectionLabel: 'よくある質問',
    title: 'FAQ',
    items: FAQ_JP,
  },
  en: {
    sectionLabel: 'FAQ',
    title: 'Frequently Asked Questions',
    items: FAQ_EN,
  },
} as const

// ─── メインコンポーネント ─────────────────────────────────────────────────────

/**
 * FAQ セクション。
 * 5 つの Q&A をアコーディオン形式で表示する。
 */
export default function Faq({ lang }: FaqProps) {
  /** 現在開いているアイテムのインデックス（null = 全閉） */
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const t = CONTENT[lang]

  return (
    <section
      id="faq"
      style={{
        backgroundColor: '#111111',
        padding: '100px 24px',
      }}
    >
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
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
              margin: 0,
              letterSpacing: '-0.5px',
            }}
          >
            {t.title}
          </h2>
        </div>

        {/* ── アコーディオンリスト ───────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {t.items.map((item, index) => {
            /** このアイテムが現在開いているか */
            const isOpen = openIndex === index

            return (
              <div
                key={item.question}
                style={{
                  backgroundColor: '#1A1A1A',
                  border: `1px solid ${isOpen ? 'rgba(99,102,241,0.3)' : '#2A2A2A'}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'border-color 200ms ease',
                }}
              >
                {/* ── 質問ヘッダー（クリック可・アクセシビリティ対応） ──── */}
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  aria-expanded={isOpen}
                >
                  {/* 質問テキスト */}
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#F0F0F0',
                      lineHeight: 1.4,
                    }}
                  >
                    {item.question}
                  </span>

                  {/* シェブロンアイコン（開閉状態で回転） */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{
                      flexShrink: 0,
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 300ms ease',
                      color: isOpen ? '#6366F1' : '#4A4A4A',
                    }}
                    aria-hidden="true"
                  >
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* ── 回答本文（max-height アニメーション） ─────────────── */}
                <div
                  style={{
                    maxHeight: isOpen ? '300px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                  }}
                >
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#8A8A8A',
                      lineHeight: 1.7,
                      margin: 0,
                      padding: '0 24px 20px',
                    }}
                  >
                    {item.answer}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
