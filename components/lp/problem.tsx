/**
 * PromptVault LP — 課題提起セクションコンポーネント
 *
 * ユーザーが抱える 3 つの課題（コピペ地獄・見つからない・クオリティ不安）を
 * カード形式で提示し、共感を呼び起こすセクション。
 * ホバーエフェクトは CSS <style> タグで実装（イベントハンドラ不要）。
 */

// ─── 型定義 ──────────────────────────────────────────────────────────────────

/** Lang 型（各ファイルでローカル宣言） */
type Lang = 'jp' | 'en'

/** コンポーネントの Props 型 */
type ProblemProps = {
  lang: Lang
}

/** 課題カードの型 */
type ProblemCard = {
  emoji: string
  title: string
  description: string
}

// ─── テキストコンテンツ ───────────────────────────────────────────────────────

/** JP/EN テキストコンテンツ */
const CONTENT: Record<Lang, { sectionLabel: string; title: string; cards: ProblemCard[] }> = {
  jp: {
    sectionLabel: '課題',
    title: 'こんな経験、ありませんか？',
    cards: [
      {
        emoji: '😩',
        title: 'コピペ地獄',
        description:
          '毎回メモやドキュメントを開いて、同じプロンプトをコピペ。この繰り返し作業で何分無駄にしていますか？',
      },
      {
        emoji: '🔍',
        title: '見つからない',
        description:
          'あの良いプロンプト、どこに保存したっけ？スプレッドシート、メモ帳、チャット履歴…バラバラに散在していませんか？',
      },
      {
        emoji: '📉',
        title: 'クオリティがバラバラ',
        description:
          '昨日の良いプロンプトを今日再現できない。アドホックな入力で毎回結果が違い、改善のサイクルが回らない。',
      },
    ],
  },
  en: {
    sectionLabel: 'Problem',
    title: 'Sound familiar?',
    cards: [
      {
        emoji: '😩',
        title: 'Copy-paste hell',
        description:
          'You open a doc, copy the prompt, switch tabs, paste it in. Every. Single. Time. How much time are you wasting?',
      },
      {
        emoji: '🔍',
        title: "Can't find it",
        description:
          "Where was that great prompt again? Spreadsheet? Notes app? Chat history? Your prompts are scattered everywhere.",
      },
      {
        emoji: '📉',
        title: 'Inconsistent quality',
        description:
          "You can't reproduce yesterday's great result. Ad-hoc inputs give different outputs every time, breaking your workflow.",
      },
    ],
  },
}

// ─── メインコンポーネント ─────────────────────────────────────────────────────

/**
 * 課題提起セクション。
 * ユーザーの痛点を 3 枚のカードで可視化し、ソリューションへの期待を高める。
 */
export default function Problem({ lang }: ProblemProps) {
  const t = CONTENT[lang]

  return (
    <section
      id="problem"
      style={{
        backgroundColor: '#080808',
        padding: '100px 24px',
      }}
    >
      {/* ── ホバーエフェクト CSS ────────────────────────────────────────── */}
      <style>{`
        .pv-problem-card {
          transition: border-color 200ms ease, box-shadow 200ms ease;
        }
        .pv-problem-card:hover {
          border-color: rgba(99,102,241,0.3) !important;
          box-shadow: 0 8px 32px rgba(99,102,241,0.08) !important;
        }
      `}</style>

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
              margin: 0,
              letterSpacing: '-0.5px',
            }}
          >
            {t.title}
          </h2>
        </div>

        {/* ── カードグリッド ─────────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}
        >
          {t.cards.map((card) => (
            <div
              key={card.title}
              className="pv-problem-card"
              style={{
                backgroundColor: '#111111',
                border: '1px solid #1E1E1E',
                borderRadius: '16px',
                padding: '32px',
              }}
            >
              {/* 絵文字アイコン */}
              <div style={{ fontSize: '36px', marginBottom: '20px' }}>
                {card.emoji}
              </div>

              {/* カードタイトル */}
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#F0F0F0',
                  margin: '0 0 12px',
                }}
              >
                {card.title}
              </h3>

              {/* カード説明文 */}
              <p
                style={{
                  fontSize: '14px',
                  color: '#8A8A8A',
                  margin: 0,
                  lineHeight: 1.7,
                }}
              >
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
