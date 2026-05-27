/**
 * PromptVault LP — ソリューションデモ UI セクションコンポーネント
 *
 * CSS/SVG のみで構成したブラウザモック UI を用いて、
 * スラッシュコマンド機能を視覚的にデモする。
 * 外部画像は一切使用しない。カーソル点滅は CSS アニメーション。
 */

// ─── 型定義 ──────────────────────────────────────────────────────────────────

/** Lang 型（各ファイルでローカル宣言） */
type Lang = 'jp' | 'en'

/** コンポーネントの Props 型 */
type SolutionProps = {
  lang: Lang
}

// ─── テキストコンテンツ ───────────────────────────────────────────────────────

/** JP/EN テキストコンテンツ */
const CONTENT = {
  jp: {
    sectionLabel: 'ソリューション',
    title: 'スラッシュ一発で、\nプロンプトを召喚。',
    subtitle:
      '「/」を入力するだけ。保存したプロンプトが瞬時に現れます。ChatGPT・Claude・Gemini すべてで動作します。',
    demoAddress: 'chatgpt.com',
    demoInput: '/ブログ記事',
    demoItems: [
      'ブログ記事の構成を考えてください',
      'ブログ記事を SEO 最適化で書いてください',
      'ブログ記事のタイトル案を 10 個出してください',
    ],
  },
  en: {
    sectionLabel: 'Solution',
    title: 'One slash.\nInstant access.',
    subtitle:
      'Just type "/". Your saved prompts appear instantly. Works on ChatGPT, Claude, and Gemini.',
    demoAddress: 'chatgpt.com',
    demoInput: '/blog post',
    demoItems: [
      'Write a blog post outline',
      'Write a SEO-optimized blog post',
      'Generate 10 blog post title ideas',
    ],
  },
} as const

// ─── メインコンポーネント ─────────────────────────────────────────────────────

/**
 * ソリューションセクション。
 * CSS のみで構成したブラウザモック UI でスラッシュコマンド体験をデモする。
 */
export default function Solution({ lang }: SolutionProps) {
  const t = CONTENT[lang]

  return (
    <section
      id="solution"
      style={{
        backgroundColor: '#111111',
        padding: '100px 24px',
      }}
    >
      {/* ── カーソル点滅アニメーション CSS ─────────────────────────────── */}
      <style>{`
        @keyframes pv-cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .pv-cursor {
          animation: pv-cursor-blink 1s step-end infinite;
        }
      `}</style>

      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* ── セクションヘッダー ─────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
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
              margin: '0 0 20px',
              letterSpacing: '-0.5px',
              whiteSpace: 'pre-line',
            }}
          >
            {t.title}
          </h2>

          <p
            style={{
              fontSize: '16px',
              color: '#8A8A8A',
              maxWidth: '560px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            {t.subtitle}
          </p>
        </div>

        {/* ── ブラウザモック UI ──────────────────────────────────────────── */}
        <div
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            backgroundColor: '#0D0D0D',
            border: '1px solid #2A2A2A',
            borderRadius: '16px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            overflow: 'hidden',
          }}
        >
          {/* ─ ブラウザヘッダー（タブバー + アドレスバー） ──────────────── */}
          <div
            style={{
              backgroundColor: '#1A1A1A',
              borderBottom: '1px solid #2A2A2A',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {/* macOS スタイルのウィンドウコントロールドット */}
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#FF5F57',
                }}
              />
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#FEBC2E',
                }}
              />
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#28C840',
                }}
              />
            </div>

            {/* アドレスバー風テキスト */}
            <div
              style={{
                flex: 1,
                backgroundColor: '#111111',
                borderRadius: '6px',
                padding: '4px 12px',
                fontSize: '12px',
                color: '#4A4A4A',
                textAlign: 'center',
              }}
            >
              🔒 {t.demoAddress}
            </div>
          </div>

          {/* ─ チャット入力エリア ────────────────────────────────────────── */}
          <div style={{ padding: '24px', position: 'relative' }}>
            {/* テキストエリア（CSS のみ、実際には操作不可） */}
            <div
              style={{
                backgroundColor: '#111111',
                border: '1px solid #2A2A2A',
                borderRadius: '12px',
                padding: '14px 16px',
                paddingBottom: '48px',
                minHeight: '80px',
                position: 'relative',
              }}
            >
              {/* 入力テキスト + 点滅カーソル */}
              <span style={{ fontSize: '14px', color: '#F0F0F0' }}>
                {t.demoInput}
                <span
                  className="pv-cursor"
                  style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '16px',
                    backgroundColor: '#6366F1',
                    verticalAlign: 'middle',
                    marginLeft: '2px',
                  }}
                />
              </span>

              {/* ─ PromptVault ポップアップリスト ──────────────────────── */}
              {/*
               * テキストエリアの上部に浮かぶプロンプト候補リスト。
               * bottom: '100%' + marginBottom で入力欄の直上に配置する。
               */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '0',
                  right: '0',
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #333333',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  marginBottom: '8px',
                }}
              >
                {/* ポップアップヘッダー — PromptVault ロゴ + テキスト */}
                <div
                  style={{
                    padding: '8px 12px 6px',
                    borderBottom: '1px solid #2A2A2A',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#6366F1',
                    letterSpacing: '0.05em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {/* PV ロゴアイコン（極小） */}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '14px',
                      height: '14px',
                      backgroundColor: '#6366F1',
                      borderRadius: '3px',
                      fontSize: '8px',
                      fontWeight: 800,
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    P
                  </span>
                  PromptVault
                </div>

                {/* プロンプト候補リスト（1件目がハイライト） */}
                {t.demoItems.map((item, i) => (
                  <div
                    key={item}
                    style={{
                      padding: '10px 12px',
                      fontSize: '13px',
                      color: i === 0 ? '#F0F0F0' : '#8A8A8A',
                      backgroundColor:
                        i === 0 ? 'rgba(99,102,241,0.12)' : 'transparent',
                      borderLeft:
                        i === 0 ? '2px solid #6366F1' : '2px solid transparent',
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
