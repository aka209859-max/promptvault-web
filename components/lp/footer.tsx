/**
 * PromptVault LP — フッターコンポーネント
 *
 * コピーライト表示 + プライバシーポリシー・利用規約リンクを提供する。
 * イベントハンドラなし → Server Component として動作可能。
 */

// ─── 型定義 ──────────────────────────────────────────────────────────────────

/** Lang 型（各ファイルでローカル宣言） */
type Lang = 'jp' | 'en'

/** コンポーネントの Props 型 */
type FooterProps = {
  lang: Lang
}

// ─── テキストコンテンツ ───────────────────────────────────────────────────────

/** JP/EN テキストコンテンツ */
const CONTENT = {
  jp: {
    privacy: 'プライバシーポリシー',
    terms: '利用規約',
    copyright: '© 2025 PromptVault. All rights reserved.',
  },
  en: {
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    copyright: '© 2025 PromptVault. All rights reserved.',
  },
} as const

// ─── メインコンポーネント ─────────────────────────────────────────────────────

/**
 * LP フッターコンポーネント。
 * ページ最下部にコピーライトとリンクを表示する。
 */
export default function Footer({ lang }: FooterProps) {
  const t = CONTENT[lang]

  return (
    <footer
      style={{
        borderTop: '1px solid #1A1A1A',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      {/* ── リンク一覧 ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          marginBottom: '20px',
        }}
      >
        <a
          href="/privacy"
          style={{
            fontSize: '13px',
            color: '#4A4A4A',
            textDecoration: 'none',
          }}
        >
          {t.privacy}
        </a>
        <a
          href="/terms"
          style={{
            fontSize: '13px',
            color: '#4A4A4A',
            textDecoration: 'none',
          }}
        >
          {t.terms}
        </a>
      </div>

      {/* ── コピーライト ────────────────────────────────────────────────── */}
      <p
        style={{
          fontSize: '12px',
          color: '#333333',
          margin: 0,
        }}
      >
        {t.copyright}
      </p>
    </footer>
  )
}
