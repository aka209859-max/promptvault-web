'use client'

/**
 * PromptVault Web — ダッシュボードクライアントコンポーネント
 *
 * サーバーコンポーネント（page.tsx）から initialPrompts / plan を受け取り、
 * ローカル state でプロンプト一覧を管理するクライアントコンポーネント。
 *
 * 状態更新戦略（楽観的更新）:
 *   CRUD 成功時にローカル state を即時更新 → UIの即時反映
 *   + router.refresh() でサーバーからの再取得をトリガー → 整合性確保
 *   initialPrompts が更新されたら useEffect で state を同期する。
 *
 * Free プラン上限制御:
 *   30件に達している場合、追加ボタンを視覚的に無効化（opacity-40）し、
 *   ホバー時にカスタムツールチップを表示する。
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { deletePrompt } from '@/lib/prompts'
import type { Prompt } from '@/lib/prompts'
import SlidePanel from '@/components/dashboard/slide-panel'

// ─── 型定義 ──────────────────────────────────────────────────────────────────

/** DashboardClient の Props 型 */
type Props = {
  /** サーバーサイドで取得した初期プロンプト一覧 */
  initialPrompts: Prompt[]
  /** ユーザーの現在のプラン */
  plan: 'free' | 'pro'
  /** ユーザーのメールアドレス（将来的な表示用途に対応） */
  userEmail: string
}

// ─── 定数 ────────────────────────────────────────────────────────────────────

/** Free プランの保存上限件数 */
const FREE_PLAN_LIMIT = 30

// ─── コンポーネント ────────────────────────────────────────────────────────────

export default function DashboardClient({
  initialPrompts,
  plan,
  userEmail: _userEmail, // 将来の表示用途のため受け取るが現時点では未使用
}: Props) {
  const router = useRouter()
  // ブラウザ用 Supabase クライアント（CRUD 操作に使用）
  const supabase = createClient()

  // ─── ローカル state ──────────────────────────────────────────────────────────

  /**
   * プロンプト一覧。initialPrompts で初期化。
   * router.refresh() 後に initialPrompts が変わったら useEffect で同期する。
   */
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts)

  /** スライドパネルの開閉状態 */
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  /** 編集中のプロンプト（null = 新規追加モード） */
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)

  /** インライン削除確認を表示中の行の ID */
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  /** 削除処理中の行の ID */
  const [deletingId, setDeletingId] = useState<string | null>(null)

  /** 削除操作のエラーメッセージ */
  const [deleteError, setDeleteError] = useState<string | null>(null)

  /**
   * サーバーから router.refresh() 経由で新しい initialPrompts が渡されたとき、
   * ローカル state を同期する。
   */
  useEffect(() => {
    setPrompts(initialPrompts)
  }, [initialPrompts])

  // ─── 計算値 ──────────────────────────────────────────────────────────────────

  /** Free プランで保存上限に達しているか */
  const isAtLimit = plan === 'free' && prompts.length >= FREE_PLAN_LIMIT

  // ─── ハンドラ ────────────────────────────────────────────────────────────────

  /**
   * ログアウト処理。
   * signOut 後に /login にリダイレクトする。
   */
  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  /**
   * 新規追加パネルを開く。
   * 上限に達している場合は何もしない。
   */
  function handleOpenAdd() {
    if (isAtLimit) return
    setEditingPrompt(null)
    setIsPanelOpen(true)
  }

  /**
   * 編集パネルを開く。
   * 対象のプロンプトを editingPrompt にセットしてパネルを開く。
   */
  function handleOpenEdit(prompt: Prompt) {
    setEditingPrompt(prompt)
    setIsPanelOpen(true)
  }

  /**
   * SlidePanel の保存完了コールバック。
   * 楽観的更新: ローカル state を即時更新し、
   * router.refresh() でサーバーとの整合性も確保する。
   */
  function handleSave(saved: Prompt) {
    if (editingPrompt) {
      // 編集: 対象の行を更新済みデータで置換
      setPrompts((prev) =>
        prev.map((p) => (p.id === saved.id ? saved : p))
      )
    } else {
      // 追加: 先頭に新しいプロンプトを追加（created_at 降順と一致）
      setPrompts((prev) => [saved, ...prev])
    }
    setIsPanelOpen(false)
    // サーバーから最新データを再取得してキャッシュを更新する
    router.refresh()
  }

  /**
   * 削除実行。
   * 確認ダイアログ（インライン）で「はい」が押された後に呼ばれる。
   */
  async function handleDelete(id: string) {
    setDeletingId(id)
    setDeleteError(null)

    try {
      await deletePrompt(supabase, id)
      // 楽観的更新: ローカル state から即座に削除
      setPrompts((prev) => prev.filter((p) => p.id !== id))
      setConfirmDeleteId(null)
      router.refresh()
    } catch (err: unknown) {
      // 削除失敗時はエラーメッセージを表示（state は変更しない）
      if (err instanceof Error) {
        setDeleteError(err.message)
      } else {
        setDeleteError('削除に失敗しました。再試行してください。')
      }
    } finally {
      setDeletingId(null)
    }
  }

  /**
   * プロンプト本文のプレビュー文字列を生成する。
   * 60文字を超える場合は先頭60文字 + "..." を返す。
   */
  function truncateBody(body: string): string {
    return body.length > 60 ? `${body.slice(0, 60)}...` : body
  }

  // ─── レンダリング ────────────────────────────────────────────────────────────

  return (
    <div style={{ backgroundColor: '#080808', minHeight: '100vh' }}>
      {/* ─── ナビゲーションバー ─────────────────────────────────────────────── */}
      <nav
        style={{
          height: '56px',
          padding: '0 24px',
          backgroundColor: '#080808',
          borderBottom: '1px solid #1A1A1A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        {/* 左: PV ロゴ + アプリ名 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#6366F1',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: '#FFFFFF',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            PV
          </div>
          <span
            style={{ fontSize: '15px', fontWeight: 600, color: '#F0F0F0' }}
          >
            PromptVault
          </span>
        </div>

        {/* 中央: プランバッジ */}
        <div>
          {plan === 'pro' ? (
            /* Pro バッジ: グリーン系 */
            <span
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10B981',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              ✦ Pro
            </span>
          ) : (
            /* Free バッジ: グレー系（現在の使用件数を表示） */
            <span
              style={{
                backgroundColor: '#1A1A1A',
                border: '1px solid #222222',
                color: '#8A8A8A',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
              }}
            >
              Free · {FREE_PLAN_LIMIT}件中{prompts.length}件
            </span>
          )}
        </div>

        {/* 右: アクションボタン群 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/*
           * 追加ボタン + ツールチップ
           * 上限時は視覚的に無効化（opacity-40）し、ホバー時にツールチップを表示する。
           * group クラスで親要素を監視し、group-hover:block でツールチップを制御する。
           */}
          <div style={{ position: 'relative' }} className="group">
            {isAtLimit ? (
              /*
               * 上限到達時: 実際のボタンの代わりに disabled 見た目の div を表示。
               * pointer-events を保持しつつ、クリックを無効化する。
               */
              <div
                style={{
                  height: '36px',
                  padding: '0 12px',
                  backgroundColor: '#6366F1',
                  borderRadius: '8px',
                  opacity: 0.4,
                  cursor: 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                + 新しいプロンプト
              </div>
            ) : (
              <Button variant="primary" size="sm" onClick={handleOpenAdd}>
                + 新しいプロンプト
              </Button>
            )}

            {/* 上限時のみ表示するツールチップ */}
            {isAtLimit && (
              <div
                className="absolute right-0 top-full hidden group-hover:block"
                style={{
                  marginTop: '8px',
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #222222',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#8A8A8A',
                  whiteSpace: 'nowrap',
                  zIndex: 20,
                }}
              >
                Proプランで無制限に保存できます
              </div>
            )}
          </div>

          {/* ログアウトボタン */}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            ログアウト
          </Button>
        </div>
      </nav>

      {/* ─── Free プランアップグレードバナー ──────────────────────────────────── */}
      {/* plan が 'free' の場合のみ表示する */}
      {plan === 'free' && (
        <div
          style={{
            backgroundColor: '#0D0D1A',
            borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '13px', color: '#8A8A8A' }}>
            ✦ AIによる自動改善・無制限保存はProプランで
          </span>
          {/* アップグレードボタン: secondary バリアントにインディゴカラーを適用 */}
          <Button
            variant="secondary"
            size="sm"
            style={{ borderColor: '#6366F1', color: '#6366F1' }}
            onClick={() => router.push('/upgrade')}
          >
            Proにアップグレード ¥980/月 →
          </Button>
        </div>
      )}

      {/* 削除エラーバナー（エラーがある場合のみ表示） */}
      {deleteError !== null && (
        <div
          role="alert"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '10px 24px',
            fontSize: '13px',
            color: '#EF4444',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{deleteError}</span>
          <button
            onClick={() => setDeleteError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#EF4444',
              cursor: 'pointer',
              fontSize: '16px',
            }}
            aria-label="エラーを閉じる"
          >
            ×
          </button>
        </div>
      )}

      {/* ─── メインコンテンツ ──────────────────────────────────────────────────── */}
      <main style={{ padding: '32px 24px' }}>
        {/*
         * テーブルコンテナ
         * background: #111111 / border: #222222 / radius: 12px / overflow: hidden
         */}
        <div
          style={{
            backgroundColor: '#111111',
            border: '1px solid #222222',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {prompts.length === 0 ? (
            /* ─── 空の状態（0件時） ─────────────────────────────────────────── */
            <div
              style={{
                padding: '80px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                textAlign: 'center',
              }}
            >
              {/* コマンドプロンプト風のアイコン意匠 */}
              <div
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '28px',
                  color: '#555555',
                  letterSpacing: '0.08em',
                  userSelect: 'none',
                }}
                aria-hidden="true"
              >
                {'> _'}
              </div>
              <p style={{ fontSize: '14px', color: '#C0C0C0', margin: 0 }}>
                まだプロンプトがありません
              </p>
              <p style={{ fontSize: '13px', color: '#8A8A8A', margin: 0 }}>
                スラッシュコマンドで素早く呼び出せるプロンプトを登録しましょう
              </p>
              {/* 初動用の追加ボタン */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenAdd}
                style={{ marginTop: '8px', color: '#6366F1' }}
              >
                最初のプロンプトを追加 →
              </Button>
            </div>
          ) : (
            /* ─── プロンプトテーブル ───────────────────────────────────────── */
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              {/* テーブルヘッダー */}
              <thead>
                <tr style={{ backgroundColor: '#1A1A1A' }}>
                  {[
                    { label: 'コマンド', width: '160px' },
                    { label: 'タイトル', width: undefined },
                    { label: 'プロンプト本文', width: undefined },
                    { label: '操作', width: '120px' },
                  ].map(({ label, width }) => (
                    <th
                      key={label}
                      style={{
                        padding: '10px 16px',
                        textAlign: 'left',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#8A8A8A',
                        letterSpacing: '0.05em',
                        width: width,
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* テーブル本体 */}
              <tbody>
                {prompts.map((prompt) => (
                  <tr
                    key={prompt.id}
                    style={{ borderBottom: '1px solid #1A1A1A' }}
                    className="hover:bg-[#161616]"
                  >
                    {/* コマンド列 */}
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          fontFamily: "'Courier New', monospace",
                          color: '#6366F1',
                          fontSize: '13px',
                        }}
                      >
                        /{prompt.command}
                      </span>
                    </td>

                    {/* タイトル列 */}
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          color: '#F0F0F0',
                          fontWeight: 500,
                          fontSize: '14px',
                        }}
                      >
                        {prompt.title}
                      </span>
                    </td>

                    {/* 本文プレビュー列（60文字 + ...）*/}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ color: '#8A8A8A', fontSize: '13px' }}>
                        {truncateBody(prompt.body)}
                      </span>
                    </td>

                    {/* 操作列 */}
                    <td style={{ padding: '14px 16px' }}>
                      {confirmDeleteId === prompt.id ? (
                        /* インライン削除確認UI */
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span
                            style={{ fontSize: '12px', color: '#8A8A8A' }}
                          >
                            削除しますか？
                          </span>
                          {/* 削除確定ボタン */}
                          <button
                            onClick={() => handleDelete(prompt.id)}
                            disabled={deletingId === prompt.id}
                            style={{
                              fontSize: '12px',
                              color: '#EF4444',
                              background: 'none',
                              border: 'none',
                              cursor:
                                deletingId === prompt.id
                                  ? 'not-allowed'
                                  : 'pointer',
                              opacity: deletingId === prompt.id ? 0.5 : 1,
                              padding: '2px 6px',
                            }}
                          >
                            {deletingId === prompt.id ? '削除中...' : 'はい'}
                          </button>
                          {/* キャンセルボタン */}
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            style={{
                              fontSize: '12px',
                              color: '#8A8A8A',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '2px 6px',
                            }}
                          >
                            キャンセル
                          </button>
                        </div>
                      ) : (
                        /* 通常の操作アイコン（鉛筆・ゴミ箱）*/
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {/* 編集ボタン: ホバー時にインディゴへ変化 */}
                          <button
                            onClick={() => handleOpenEdit(prompt)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '6px',
                              borderRadius: '4px',
                            }}
                            className="text-[#8A8A8A] hover:text-[#6366F1]"
                            aria-label={`${prompt.title}を編集`}
                          >
                            <Pencil size={14} aria-hidden="true" />
                          </button>
                          {/* 削除ボタン: ホバー時にレッドへ変化 */}
                          <button
                            onClick={() => setConfirmDeleteId(prompt.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '6px',
                              borderRadius: '4px',
                            }}
                            className="text-[#8A8A8A] hover:text-[#EF4444]"
                            aria-label={`${prompt.title}を削除`}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ─── スライドオーバーパネル ──────────────────────────────────────────── */}
      <SlidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        editingPrompt={editingPrompt}
        onSave={handleSave}
      />
    </div>
  )
}
