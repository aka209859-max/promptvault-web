'use client'

/**
 * PromptVault Web — ログイン / 新規登録ページ
 *
 * デザインシステムのブランドカラー（#080808, #111111, #6366F1 等）に準拠した
 * 認証画面。ログインと新規登録をタブで切り替える SPA ライクな実装。
 *
 * 使用コンポーネント:
 *   - Button: @/components/ui/button（セッション1で作成）
 *   - Input:  @/components/ui/input（セッション1で作成）
 *   - Eye / EyeOff: lucide-react（パスワード表示切り替え用）
 *
 * 認証フロー:
 *   ログイン    → supabase.auth.signInWithPassword → /dashboard へ遷移
 *   新規登録    → supabase.auth.signUp → 確認メール送信メッセージ表示
 *   Google ログイン → supabase.auth.signInWithOAuth → OAuth リダイレクト
 *
 * 型安全性:
 *   - any 型は一切使用しない。
 *   - catch ブロックでは unknown 型 + instanceof Error ガードを使用する。
 *   - Supabase の AuthError は .message プロパティで日本語表示に変換する。
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// ─── 型定義 ──────────────────────────────────────────────────────────────────

/** タブの種類 */
type Tab = 'login' | 'register'

// ─── Supabase エラーメッセージの日本語変換 ───────────────────────────────────

/**
 * Supabase が返す英語エラーメッセージを日本語に変換する。
 * 未知のメッセージはそのまま表示するフォールバック付き。
 *
 * @param message - Supabase AuthError.message
 * @returns 日本語のエラーメッセージ
 */
function translateAuthError(message: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials':
      'メールアドレスまたはパスワードが正しくありません。',
    'Email not confirmed':
      'メールアドレスが確認されていません。受信トレイをご確認ください。',
    'User already registered':
      'このメールアドレスはすでに登録されています。ログインをお試しください。',
    'Password should be at least 6 characters':
      'パスワードは6文字以上で入力してください。',
    'Unable to validate email address: invalid format':
      '有効なメールアドレスを入力してください。',
    'signup disabled': '現在、新規登録を受け付けていません。',
    'Email rate limit exceeded':
      'メール送信の上限に達しました。しばらく時間をおいてから再試行してください。',
  }
  return errorMap[message] ?? `エラーが発生しました: ${message}`
}

// ─── Googleロゴ SVG コンポーネント ───────────────────────────────────────────

/**
 * Google ブランドガイドライン準拠のカラー SVG ロゴ。
 * 外部依存なし、インライン SVG で実装。
 */
function GoogleLogo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M17.64 9.20453C17.64 8.56637 17.5827 7.95274 17.4764 7.36365H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8196H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20453Z"
        fill="#4285F4"
      />
      <path
        d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.96409 10.71C3.78409 10.17 3.68182 9.59319 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95819H0.957275C0.347727 6.17319 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z"
        fill="#EA4335"
      />
    </svg>
  )
}

// ─── メインコンポーネント ─────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  // ── 状態管理 ────────────────────────────────────────────────────────────────

  /** アクティブなタブ: 'login'（ログイン）| 'register'（新規登録） */
  const [tab, setTab] = useState<Tab>('login')

  /** フォームの入力値 */
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  /** パスワードの表示/非表示状態 */
  const [showPassword, setShowPassword] = useState(false)

  /** API 呼び出し中のローディング状態 */
  const [loading, setLoading] = useState(false)

  /** エラーメッセージ（null = エラーなし） */
  const [error, setError] = useState<string | null>(null)

  /** 成功メッセージ（新規登録の確認メール送信時等） */
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // ── 認証ハンドラ ─────────────────────────────────────────────────────────────

  /**
   * フォーム送信ハンドラ。
   * タブの状態に応じてログインまたは新規登録を実行する。
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      if (tab === 'login') {
        // ─── ログイン処理 ─────────────────────────────────────────────────────
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (authError) {
          setError(translateAuthError(authError.message))
          return
        }

        // 成功: ダッシュボードへ遷移
        router.push('/dashboard')
      } else {
        // ─── 新規登録処理 ─────────────────────────────────────────────────────
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (authError) {
          setError(translateAuthError(authError.message))
          return
        }

        // 成功: 確認メール送信の案内を表示
        setSuccessMessage(
          '確認メールを送信しました。メールボックスを確認してアカウントを有効化してください。'
        )
      }
    } catch (err: unknown) {
      // unknown 型でキャッチし、Error インスタンスか確認してからメッセージを取得する
      if (err instanceof Error) {
        setError(`予期しないエラーが発生しました: ${err.message}`)
      } else {
        setError('予期しないエラーが発生しました。しばらく時間をおいて再試行してください。')
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Google OAuth ログインハンドラ。
   * 認証完了後は /dashboard にリダイレクトさせる。
   */
  async function handleGoogleLogin() {
    setError(null)
    setLoading(true)

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // 認証完了後の戻り先を指定する（window はクライアントコンポーネント内でのみ使用可）
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (authError) {
        setError(translateAuthError(authError.message))
      }
      // 成功時は Supabase が OAuth プロバイダーへリダイレクトするため、
      // ここでの router.push は不要
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Googleログインに失敗しました: ${err.message}`)
      } else {
        setError('Googleログインに失敗しました。しばらく時間をおいて再試行してください。')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── レンダリング ─────────────────────────────────────────────────────────────

  /** 送信ボタンのラベルをタブとローディング状態で切り替える */
  const submitLabel = loading
    ? '処理中...'
    : tab === 'login'
    ? 'ログイン'
    : '無料で始める'

  return (
    /*
     * 全画面レイアウト:
     * - background: #080808（ブランドの漆黒背景）
     * - 中央揃えで 400px のカードを配置
     */
    <div
      style={{ backgroundColor: '#080808', minHeight: '100vh' }}
      className="flex items-center justify-center p-4"
    >
      {/* ─── カード ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          width: '400px',
          backgroundColor: '#111111',
          border: '1px solid #222222',
          borderRadius: '16px',
          padding: '40px',
        }}
        className="flex flex-col gap-6"
      >
        {/* ─── ① ロゴエリア ──────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-2">
          {/* "PV" インディゴ正方形アイコン */}
          <div
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#6366F1',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '0.05em',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            PV
          </div>
          {/* アプリ名 */}
          <span
            style={{ fontSize: '18px', fontWeight: 700, color: '#F0F0F0' }}
          >
            PromptVault
          </span>
          {/* サブタイトル */}
          <span style={{ fontSize: '13px', color: '#8A8A8A' }}>
            AIプロンプトを管理・改善する
          </span>
        </div>

        {/* ─── ② タブ切り替え ────────────────────────────────────────────────── */}
        {/* タブ状態は useState で管理し、ページ遷移は発生させない */}
        <div
          style={{ borderBottom: '1px solid #222222' }}
          className="flex"
          role="tablist"
          aria-label="認証方法の切り替え"
        >
          {(['login', 'register'] as const).map((t) => {
            const isActive = tab === t
            return (
              <button
                key={t}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => {
                  setTab(t)
                  setError(null)
                  setSuccessMessage(null)
                }}
                style={{
                  flex: 1,
                  padding: '8px 0 12px',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#F0F0F0' : '#8A8A8A',
                  marginBottom: '-1px', // 親のボーダーと重ねてアクティブインジケーターを表示
                  background: 'none',
                  // border を none にした後に borderBottom で上書きする（順序が重要）
                  border: 'none',
                  borderBottom: isActive
                    ? '2px solid #6366F1'
                    : '2px solid transparent',
                  cursor: 'pointer',
                }}
              >
                {t === 'login' ? 'ログイン' : '新規登録'}
              </button>
            )
          })}
        </div>

        {/* ─── ③ フォームエリア ──────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {/* メールアドレス */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              style={{ fontSize: '13px', fontWeight: 500, color: '#8A8A8A' }}
            >
              メールアドレス
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          {/* パスワード（表示切り替えボタン付き） */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              style={{ fontSize: '13px', fontWeight: 500, color: '#8A8A8A' }}
            >
              パスワード
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={tab === 'register' ? '6文字以上' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={
                  tab === 'login' ? 'current-password' : 'new-password'
                }
                disabled={loading}
                // 右端のアイコンボタンとの重なりを避けるため右パディングを追加
                className="pr-10"
              />
              {/* パスワード表示/非表示トグルボタン */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? 'パスワードを隠す' : 'パスワードを表示する'
                }
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#4A4A4A',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0',
                }}
              >
                {showPassword ? (
                  <EyeOff size={16} aria-hidden="true" />
                ) : (
                  <Eye size={16} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* エラーメッセージ（エラー発生時のみ表示） */}
          {error !== null && (
            <div
              role="alert"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#EF4444',
                fontSize: '13px',
                lineHeight: '1.5',
              }}
            >
              {error}
            </div>
          )}

          {/* 成功メッセージ（新規登録後のメール送信案内等） */}
          {successMessage !== null && (
            <div
              role="status"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#10B981',
                fontSize: '13px',
                lineHeight: '1.5',
              }}
            >
              {successMessage}
            </div>
          )}

          {/* 送信ボタン */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full mt-1"
          >
            {submitLabel}
          </Button>
        </form>

        {/* ─── ④ セパレーター「または」────────────────────────────────────────── */}
        <div
          className="flex items-center gap-3"
          aria-hidden="true"
        >
          <div
            style={{ flex: 1, height: '1px', backgroundColor: '#222222' }}
          />
          <span style={{ fontSize: '13px', color: '#4A4A4A', whiteSpace: 'nowrap' }}>
            または
          </span>
          <div
            style={{ flex: 1, height: '1px', backgroundColor: '#222222' }}
          />
        </div>

        {/* ─── ⑤ Googleログインボタン ─────────────────────────────────────────── */}
        {/*
         * shadcn の Button ではなくネイティブ <button> を使用する。
         * Google ブランドガイドラインに沿ったカスタムスタイルが必要なため。
         */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            height: '44px',
            backgroundColor: '#1A1A1A',
            border: '1px solid #333333',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.4 : 1,
            color: '#F0F0F0',
            fontSize: '14px',
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.borderColor = '#555555'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#333333'
          }}
        >
          <GoogleLogo />
          Googleでログイン
        </button>
      </div>
    </div>
  )
}
