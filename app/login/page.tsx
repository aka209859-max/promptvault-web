'use client'

/**
 * PromptVault Web — ログイン / 新規登録ページ（マジックリンク方式）
 *
 * Google OAuth / パスワード認証を廃止し、マジックリンク認証に一本化。
 * メールアドレスを入力して送信すると Supabase が認証リンクを発行・送信する。
 * ユーザーはリンクをクリックするだけでログインでき、アカウントがない場合は自動作成。
 * 初期設定（Google Cloud Console 等）が不要なため MVP に最適。
 *
 * 認証フロー:
 *   1. メールアドレスを入力して「ログインリンクを送信」ボタンを押す
 *   2. supabase.auth.signInWithOtp でマジックリンクを発行・メール送信
 *   3. ユーザーが受信メール内のリンクをクリック
 *   4. emailRedirectTo で指定した /dashboard へリダイレクト
 */

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// ─── エラーメッセージ変換 ──────────────────────────────────────────────────────

/**
 * Supabase OTP 認証のエラーメッセージを日本語に変換する。
 * 未知のメッセージはそのまま表示するフォールバック付き。
 *
 * @param message - Supabase AuthError.message
 * @returns 日本語のエラーメッセージ
 */
function translateOtpError(message: string): string {
  const errorMap: Record<string, string> = {
    'Unable to validate email address: invalid format':
      '有効なメールアドレスを入力してください。',
    'Email rate limit exceeded':
      'メール送信の上限に達しました。しばらく時間をおいてから再試行してください。',
    'signup disabled': '現在、新規登録を受け付けていません。',
    'For security purposes, you can only request this after':
      'セキュリティのため、再送信には少し時間をおいてください。',
  }

  // 部分一致で検索（Supabase のエラーメッセージは長文になる場合がある）
  for (const [key, value] of Object.entries(errorMap)) {
    if (message.includes(key)) return value
  }

  return `エラーが発生しました: ${message}`
}

// ─── メインコンポーネント ─────────────────────────────────────────────────────

/**
 * マジックリンク認証ページ。
 * メールアドレスを入力して送信 → メール内のリンクでログインする。
 */
export default function LoginPage() {
  const supabase = createClient()

  // ── 状態管理 ────────────────────────────────────────────────────────────────

  /** メールアドレス入力値 */
  const [email, setEmail] = useState('')

  /** API 呼び出し中のローディング状態 */
  const [loading, setLoading] = useState(false)

  /** エラーメッセージ（null = エラーなし） */
  const [error, setError] = useState<string | null>(null)

  /** マジックリンク送信完了フラグ（true = 送信済み画面に切り替える） */
  const [sent, setSent] = useState(false)

  // ── 送信ハンドラ ─────────────────────────────────────────────────────────────

  /**
   * フォーム送信ハンドラ。
   * Supabase の signInWithOtp でマジックリンクをメール送信する。
   * emailRedirectTo で認証後の遷移先（/dashboard）を指定する。
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // 認証リンクのクリック後に遷移する URL
          // location.origin はクライアント側で 'http://localhost:3000' や本番ドメインを自動取得
          emailRedirectTo: `${location.origin}/dashboard`,
        },
      })

      if (authError) {
        setError(translateOtpError(authError.message))
        return
      }

      // 送信成功 → 完了メッセージ画面に切り替える
      setSent(true)
    } catch (err: unknown) {
      // unknown 型でキャッチし、Error インスタンスか確認してからメッセージを取得する
      if (err instanceof Error) {
        setError(`予期しないエラーが発生しました: ${err.message}`)
      } else {
        setError(
          '予期しないエラーが発生しました。しばらく時間をおいて再試行してください。',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  // ── レンダリング ─────────────────────────────────────────────────────────────

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
      {/* ─── カード ────────────────────────────────────────────────────────── */}
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
        {/* ─── ロゴエリア ──────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-2">
          {/* PV インディゴ正方形アイコン */}
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

        {/* ─── 送信前: 入力フォーム ────────────────────────────────────────── */}
        {!sent ? (
          <>
            {/* 説明テキスト */}
            <div style={{ textAlign: 'center' }}>
              <h1
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#F0F0F0',
                  margin: '0 0 8px',
                }}
              >
                メールアドレスでログイン / 登録
              </h1>
              <p
                style={{
                  fontSize: '13px',
                  color: '#8A8A8A',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                メールアドレスを入力するとログインリンクをお送りします。
                <br />
                アカウントがない場合は自動で作成されます。
              </p>
            </div>

            {/* メールアドレス入力フォーム */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              noValidate
            >
              {/* メールアドレス入力欄 */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#8A8A8A',
                  }}
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

              {/* 送信ボタン */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="w-full mt-1"
              >
                {loading ? '送信中...' : 'ログインリンクを送信 →'}
              </Button>
            </form>

            {/* セキュリティ注記 */}
            <p
              style={{
                fontSize: '12px',
                color: '#4A4A4A',
                textAlign: 'center',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              🔒 パスワード不要。ワンクリックでログインできます。
            </p>
          </>
        ) : (
          /* ─── 送信後: 完了メッセージ ──────────────────────────────────── */
          <div className="flex flex-col items-center gap-5 text-center">
            {/* メールアイコン（送信完了の視覚的フィードバック） */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              ✉️
            </div>

            {/* 完了メッセージ本文 */}
            <div>
              <p
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#F0F0F0',
                  margin: '0 0 8px',
                }}
              >
                メールを送信しました
              </p>
              <p
                style={{
                  fontSize: '13px',
                  color: '#8A8A8A',
                  margin: 0,
                  lineHeight: 1.7,
                }}
              >
                <strong style={{ color: '#F0F0F0' }}>{email}</strong>{' '}
                にログインリンクを送信しました。
                <br />
                メールボックスをご確認のうえ、リンクをクリックしてください。
              </p>
            </div>

            {/* 迷惑メールフォルダ案内 */}
            <p
              style={{
                fontSize: '12px',
                color: '#4A4A4A',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              メールが届かない場合は迷惑メールフォルダもご確認ください。
            </p>

            {/* 別アドレスで再送するためのリセットボタン */}
            <button
              type="button"
              onClick={() => {
                setSent(false)
                setEmail('')
                setError(null)
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#6366F1',
                fontSize: '13px',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              別のアドレスで再送する
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
