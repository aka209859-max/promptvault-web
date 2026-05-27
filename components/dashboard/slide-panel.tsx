'use client'

/**
 * PromptVault Web — スライドオーバーパネルコンポーネント
 *
 * 画面右側からスライドインするプロンプト追加/編集パネル。
 * Tailwind の transform + transition クラスを使い、
 * translateX(100%) → translateX(0) のアニメーションを実現する。
 *
 * アニメーション仕様:
 *   - 開く: translate-x-full → translate-x-0（duration-200, ease-out）
 *   - 閉じる: translate-x-0 → translate-x-full（duration-200, ease-out）
 *   - オーバーレイ: opacity-0 ↔ opacity-100（duration-200）
 *
 * フォームバリデーション:
 *   - コマンド名: 必須 + 半角英数字・ハイフンのみ（/^[a-z0-9-]+$/）
 *   - タイトル: 必須（空欄不可）
 *   - 本文: 必須（空欄不可）
 *   - バリデーションエラーは hasError prop 経由で Input/Textarea に連携
 *
 * 保存フロー:
 *   editingPrompt が null → addPrompt 実行
 *   editingPrompt が存在 → updatePrompt 実行
 *   成功後 → onSave コールバックを呼び出しパネルを閉じる
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { addPrompt, updatePrompt } from '@/lib/prompts'
import type { Prompt, NewPrompt } from '@/lib/prompts'
import { cn } from '@/lib/utils'

// ─── 型定義 ──────────────────────────────────────────────────────────────────

/** SlidePanel の Props 型 */
type SlidePanelProps = {
  /** パネルの開閉状態 */
  isOpen: boolean
  /** パネルを閉じる時に呼ばれるコールバック */
  onClose: () => void
  /** 編集対象のプロンプト（null の場合は新規追加モード） */
  editingPrompt: Prompt | null
  /** 保存成功時に呼ばれるコールバック（保存されたプロンプトを渡す） */
  onSave: (prompt: Prompt) => void
}

// ─── 定数 ────────────────────────────────────────────────────────────────────

/**
 * コマンド名の許可パターン。
 * 半角小文字英数字とハイフンのみを許可する。
 * 例: "meeting-prep", "code-review", "daily-summary"
 */
const COMMAND_PATTERN = /^[a-z0-9-]+$/

// ─── コンポーネント ────────────────────────────────────────────────────────────

/**
 * スライドオーバーパネル。
 * プロンプトの追加・編集フォームを内包する。
 */
export default function SlidePanel({
  isOpen,
  onClose,
  editingPrompt,
  onSave,
}: SlidePanelProps) {
  // ブラウザ用 Supabase クライアント（クライアントコンポーネントのため）
  const supabase = createClient()

  // ─── フォームの入力値 ────────────────────────────────────────────────────────
  const [command, setCommand] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  // ─── バリデーションエラー ────────────────────────────────────────────────────
  /** null = エラーなし、string = エラーメッセージ */
  const [commandError, setCommandError] = useState<string | null>(null)
  const [titleError, setTitleError] = useState<string | null>(null)
  const [bodyError, setBodyError] = useState<string | null>(null)

  // ─── 送信状態 ────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  /**
   * パネルが開かれるたび、または editingPrompt が切り替わるたびにフォームをリセット。
   * 編集モードの場合は既存の値をフォームに反映する。
   */
  useEffect(() => {
    if (editingPrompt) {
      // 編集モード: 既存の値をセット
      setCommand(editingPrompt.command)
      setTitle(editingPrompt.title)
      setBody(editingPrompt.body)
    } else {
      // 追加モード: フォームをクリア
      setCommand('')
      setTitle('')
      setBody('')
    }
    // エラーもクリアする
    setCommandError(null)
    setTitleError(null)
    setBodyError(null)
    setSubmitError(null)
  }, [editingPrompt, isOpen])

  // ─── バリデーション ──────────────────────────────────────────────────────────

  /**
   * フォームの全フィールドをバリデートする。
   * エラーがある場合は対応する error state を更新する。
   *
   * @returns すべて有効な場合 true、いずれかにエラーがある場合 false
   */
  function validate(): boolean {
    let valid = true

    // コマンド名チェック
    if (!command.trim()) {
      setCommandError('コマンド名を入力してください')
      valid = false
    } else if (!COMMAND_PATTERN.test(command.trim())) {
      setCommandError('半角英数字（小文字）とハイフン（-）のみ使用できます')
      valid = false
    } else {
      setCommandError(null)
    }

    // タイトルチェック
    if (!title.trim()) {
      setTitleError('タイトルを入力してください')
      valid = false
    } else {
      setTitleError(null)
    }

    // 本文チェック
    if (!body.trim()) {
      setBodyError('プロンプト本文を入力してください')
      valid = false
    } else {
      setBodyError(null)
    }

    return valid
  }

  // ─── 保存ハンドラ ────────────────────────────────────────────────────────────

  /**
   * フォーム送信ハンドラ。
   * バリデーション → Supabase CRUD → onSave コールバックの順に実行する。
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // バリデーション失敗時は早期リターン
    if (!validate()) return

    setLoading(true)
    setSubmitError(null)

    try {
      const data: NewPrompt = {
        command: command.trim(),
        title: title.trim(),
        body: body.trim(),
      }

      let saved: Prompt

      if (editingPrompt) {
        // 編集モード: 既存レコードを更新
        saved = await updatePrompt(supabase, editingPrompt.id, data)
      } else {
        // 追加モード: 新規レコードを作成
        saved = await addPrompt(supabase, data)
      }

      // 保存成功: 親コンポーネントに通知（パネルは親側で閉じる）
      onSave(saved)
    } catch (err: unknown) {
      // unknown 型でキャッチし、Error インスタンスか確認してからメッセージを表示
      if (err instanceof Error) {
        setSubmitError(err.message)
      } else {
        setSubmitError('保存に失敗しました。しばらく時間をおいて再試行してください。')
      }
    } finally {
      setLoading(false)
    }
  }

  // ─── 表示用の計算値 ──────────────────────────────────────────────────────────

  /** 編集モードか新規追加モードかを判定 */
  const isEditing = editingPrompt !== null

  /** 保存ボタンのラベルを状態に応じて動的に変更 */
  const submitLabel = loading
    ? '保存中...'
    : isEditing
    ? '更新する'
    : '保存する'

  // ─── レンダリング ────────────────────────────────────────────────────────────

  return (
    <>
      {/*
       * オーバーレイ
       * パネルが開いている間は rgba(0,0,0,0.7) の暗幕を表示する。
       * クリックでパネルを閉じる。
       * isOpen でない場合は pointer-events-none にして操作を無効化する。
       */}
      <div
        className={cn(
          'fixed inset-0 z-40',
          'transition-opacity duration-200',
          isOpen
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none'
        )}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/*
       * スライドパネル本体
       * transform + transition で translateX(100%) ↔ translateX(0) をアニメーション。
       * duration-200 / ease-out で滑らかに出現する。
       */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50',
          'w-[480px] max-w-[100vw]',
          'flex flex-col',
          'transform transition-transform duration-200 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        style={{
          backgroundColor: '#111111',
          borderLeft: '1px solid #222222',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? 'プロンプトを編集' : 'プロンプトを追加'}
      >
        {/* ─── パネルヘッダー ──────────────────────────────────────────────── */}
        <div
          style={{
            height: '56px',
            backgroundColor: '#1A1A1A',
            borderBottom: '1px solid #222222',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            flexShrink: 0,
          }}
        >
          {/* 動的タイトル: 追加/編集モードで切り替え */}
          <span
            style={{ fontSize: '15px', fontWeight: 600, color: '#F0F0F0' }}
          >
            {isEditing ? 'プロンプトを編集' : 'プロンプトを追加'}
          </span>

          {/* 閉じるボタン */}
          <button
            type="button"
            onClick={onClose}
            aria-label="パネルを閉じる"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#8A8A8A',
              fontSize: '20px',
              lineHeight: 1,
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* ─── フォーム ──────────────────────────────────────────────────────── */}
        {/*
         * overflow-y: auto でフォームが長い場合にスクロール可能にする。
         * flex: 1 でヘッダーの残りの高さを埋める。
         */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
          noValidate
        >
          {/* コマンド名フィールド */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="panel-command"
              style={{ fontSize: '13px', fontWeight: 500, color: '#8A8A8A' }}
            >
              コマンド名
            </label>
            {/* 入力ヒント */}
            <span style={{ fontSize: '12px', color: '#4A4A4A' }}>
              半角英数字とハイフンのみ（例: meeting-prep）
            </span>
            <Input
              id="panel-command"
              type="text"
              placeholder="meeting-prep"
              value={command}
              onChange={(e) => {
                setCommand(e.target.value)
                // 入力中にエラーをクリアして即時フィードバック
                if (commandError) setCommandError(null)
              }}
              hasError={commandError !== null}
              disabled={loading}
            />
            {/* バリデーションエラー表示 */}
            {commandError !== null && (
              <span style={{ fontSize: '12px', color: '#EF4444' }}>
                {commandError}
              </span>
            )}
          </div>

          {/* タイトルフィールド */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="panel-title"
              style={{ fontSize: '13px', fontWeight: 500, color: '#8A8A8A' }}
            >
              タイトル（表示名）
            </label>
            <Input
              id="panel-title"
              type="text"
              placeholder="議事録作成プロンプト"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (titleError) setTitleError(null)
              }}
              hasError={titleError !== null}
              disabled={loading}
            />
            {titleError !== null && (
              <span style={{ fontSize: '12px', color: '#EF4444' }}>
                {titleError}
              </span>
            )}
          </div>

          {/* 本文フィールド */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              flex: 1,
            }}
          >
            <label
              htmlFor="panel-body"
              style={{ fontSize: '13px', fontWeight: 500, color: '#8A8A8A' }}
            >
              プロンプト本文
            </label>
            <Textarea
              id="panel-body"
              placeholder="以下の会議の内容をまとめてください..."
              value={body}
              onChange={(e) => {
                setBody(e.target.value)
                if (bodyError) setBodyError(null)
              }}
              hasError={bodyError !== null}
              disabled={loading}
              // min-h-[100px]（デフォルト）を 160px に上書き
              className="min-h-[160px]"
            />
            {bodyError !== null && (
              <span style={{ fontSize: '12px', color: '#EF4444' }}>
                {bodyError}
              </span>
            )}
          </div>

          {/* 送信エラー表示（バリデーション以外のエラー: ネットワーク等） */}
          {submitError !== null && (
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
              {submitError}
            </div>
          )}

          {/* 保存ボタン: 状態に応じてラベルを動的変更 */}
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            style={{ width: '100%', height: '48px' }}
          >
            {submitLabel}
          </Button>
        </form>
      </div>
    </>
  )
}
