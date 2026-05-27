/**
 * PromptVault デザインシステム — Input / Textarea コンポーネント
 *
 * デザインシステムのカラートークンに準拠したテキスト入力コンポーネント群。
 * React の forwardRef を使用し、ref を通じた DOM への直接アクセスを可能にする。
 * TypeScript の any 型は使用せず、ネイティブ HTML 要素の属性型を厳密に継承する。
 *
 * 共通スタイル仕様:
 *   背景         : #1A1A1A（--color-surface-2）
 *   ボーダー      : #222222（--color-border）
 *   テキスト      : #F0F0F0（--color-text-1）
 *   プレースホルダー: #4A4A4A（--color-text-3）
 *   角丸          : 8px
 *   パディング     : 10px 14px
 *
 * 状態別スタイル:
 *   フォーカス — ボーダー #6366F1、インディゴグロー（3px / 15% 不透明）
 *   エラー     — aria-invalid="true" を使用。ボーダー #EF4444、レッドグロー（3px / 15% 不透明）
 *   無効       — opacity 40%、cursor-not-allowed
 */

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Input と Textarea に共通するベーススタイルクラス文字列。
 * 重複を避けるため定数として定義し、両コンポーネントで共有する。
 */
const inputBaseStyles = [
  // レイアウト
  'w-full rounded-[8px] text-sm',
  // カラー: デザインシステムのサーフェスカラーとテキストカラーを使用
  'bg-[#1A1A1A] border border-[#222222] text-[#F0F0F0]',
  // プレースホルダー: ターシャリテキストカラーで控えめに表示
  'placeholder:text-[#4A4A4A]',
  // フォーカス状態: アクセントカラーのボーダー + 淡いグロー
  'focus:outline-none focus:border-[#6366F1]',
  'focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]',
  // エラー状態: aria-invalid 属性を介してエラーを宣言的に制御する
  // フォーカス状態より優先度が低いため、エラー + フォーカス時はエラーカラーで上書きする
  'aria-[invalid=true]:border-[#EF4444]',
  'aria-[invalid=true]:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]',
  // 無効状態
  'disabled:opacity-40 disabled:cursor-not-allowed',
].join(' ')

// ─────────────────────────────────────────────────────────────────────────────
// Input コンポーネント
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input コンポーネントの Props 型。
 * ネイティブ <input> の全属性を継承し、エラー状態フラグを追加する。
 */
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /**
   * エラー状態フラグ。
   * true を渡すと aria-invalid="true" が設定され、
   * ボーダーとシャドウがエラーカラー（#EF4444）に変化する。
   */
  hasError?: boolean
}

/**
 * 単行テキスト入力コンポーネント。
 *
 * ネイティブ <input> を forwardRef でラップし、
 * デザインシステムのスタイルを適用する。
 * ref を使って親コンポーネントから DOM ノードに直接アクセスできる。
 *
 * @example
 * // 通常の入力欄
 * <Input placeholder="メールアドレスを入力" type="email" />
 *
 * @example
 * // エラー状態
 * <Input hasError placeholder="必須項目です" />
 *
 * @example
 * // ref でフォーカス制御
 * const inputRef = useRef<HTMLInputElement>(null)
 * <Input ref={inputRef} />
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        // hasError フラグを aria-invalid 属性に変換する。
        // undefined を渡すと属性自体が DOM に出力されないため、条件分岐で制御する。
        aria-invalid={hasError === true ? true : undefined}
        className={cn(
          inputBaseStyles,
          // Input 固有のパディング（上下 10px、左右 14px）と高さを設定
          'h-[44px] px-[14px] py-[10px]',
          className,
        )}
        {...props}
      />
    )
  }
)
// React DevTools での表示名を設定する（forwardRef 使用時に必要）
Input.displayName = 'Input'

// ─────────────────────────────────────────────────────────────────────────────
// Textarea コンポーネント
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Textarea コンポーネントの Props 型。
 * ネイティブ <textarea> の全属性を継承し、エラー状態フラグを追加する。
 */
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /**
   * エラー状態フラグ。
   * true を渡すと aria-invalid="true" が設定され、
   * ボーダーとシャドウがエラーカラー（#EF4444）に変化する。
   */
  hasError?: boolean
}

/**
 * 複数行テキスト入力コンポーネント。
 *
 * ネイティブ <textarea> を forwardRef でラップし、
 * デザインシステムのスタイルを適用する。
 * ユーザーが縦方向にリサイズできるよう resize-y を設定している。
 *
 * @example
 * // 通常のテキストエリア
 * <Textarea placeholder="説明を入力してください" rows={4} />
 *
 * @example
 * // エラー状態
 * <Textarea hasError placeholder="必須項目です" />
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        // hasError フラグを aria-invalid 属性に変換する（Input と同一ロジック）
        aria-invalid={hasError === true ? true : undefined}
        className={cn(
          inputBaseStyles,
          // Textarea 固有のスタイル:
          // - min-h-[100px]: 最小高さを確保して入力エリアを視認しやすくする
          // - resize-y: 縦方向のリサイズのみ許可（横は無効）
          'px-[14px] py-[10px] min-h-[100px] resize-y',
          className,
        )}
        {...props}
      />
    )
  }
)
// React DevTools での表示名を設定する（forwardRef 使用時に必要）
Textarea.displayName = 'Textarea'

export { Input, Textarea }
export type { InputProps, TextareaProps }
