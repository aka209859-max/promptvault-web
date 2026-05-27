/**
 * PromptVault デザインシステム — Button コンポーネント
 *
 * @base-ui/react の Button プリミティブをベースにすることで、
 * キーボード操作・スクリーンリーダー対応などのアクセシビリティを保証する。
 * CVA（class-variance-authority）でバリアントとサイズを型安全に管理する。
 *
 * バリアント:
 *   primary   — インディゴ背景・白テキスト。ホバー時に -1px 上昇 + グローシャドウ。
 *               メインの CTA・保存・送信ボタンに使用する。
 *   secondary — 透明背景・ボーダーあり。ホバー時にアクセントカラーのボーダーへ変化。
 *               キャンセル・戻る・補助的なアクションに使用する。
 *   ghost     — 背景なし・ボーダーなし。ホバー時にテキストが明るくなる。
 *               ナビゲーション・テキストリンク的なアクションに使用する。
 *
 * サイズ:
 *   sm — 高さ 36px: コンパクトなレイアウト・テーブル内ボタン向け
 *   md — 高さ 44px: デフォルト。フォーム・カード内の主要アクション向け
 *   lg — 高さ 52px: ランディングページの CTA・ヘッダーのメインアクション向け
 *
 * 無効状態:
 *   opacity 40% + cursor-not-allowed。
 *   primary のホバーエフェクト（transform・shadow）は無効時には適用されない。
 */

import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * ボタンのバリアントとサイズを定義する CVA 設定。
 * @base-ui/react の Button プリミティブに className として適用される。
 */
const buttonVariants = cva(
  // ─── ベーススタイル（全バリアント共通）────────────────────────────────────
  [
    // レイアウト
    'inline-flex items-center justify-center shrink-0',
    // タイポグラフィ
    'font-semibold text-sm whitespace-nowrap select-none',
    // 形状
    'rounded-[8px] border border-transparent',
    // インタラクション
    'cursor-pointer',
    // フォーカスリング: アクセシビリティのため視認しやすいインディゴリングを使用
    'focus-visible:outline-none',
    'focus-visible:ring-2 focus-visible:ring-[#6366F1]',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]',
    // 無効状態: opacity を落とし、クリック不可を示す
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),
  {
    variants: {
      variant: {
        /**
         * primary バリアント
         * インディゴ背景のメインアクションボタン。
         * [&:not(:disabled)]:hover: により無効状態ではホバーエフェクトを適用しない。
         */
        primary: [
          // 通常状態: インディゴ背景・白テキスト
          'bg-[#6366F1] text-white',
          // ホバー状態（有効時のみ）: 暗いインディゴ + 浮き上がり + グローシャドウ
          '[&:not(:disabled)]:hover:bg-[#4F46E5]',
          '[&:not(:disabled)]:hover:-translate-y-px',
          '[&:not(:disabled)]:hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)]',
        ].join(' '),
        /**
         * secondary バリアント
         * 透明背景・ボーダーありのセカンダリアクションボタン。
         * ホバー時にボーダーをアクセントカラーに変化させて関連性を示す。
         */
        secondary: [
          // 通常状態: 透明背景・グレーボーダー・明るいテキスト
          'bg-transparent border-[#333333] text-[#F0F0F0]',
          // ホバー状態: ボーダーをアクセントカラーに変化
          'hover:border-[#6366F1]',
        ].join(' '),
        /**
         * ghost バリアント
         * 背景・ボーダーなしのゴーストボタン。
         * ナビゲーションや補助的なテキストアクションに使用する。
         */
        ghost: [
          // 通常状態: 透明背景・グレーテキスト
          'bg-transparent text-[#8A8A8A]',
          // ホバー状態: テキストを明るくしてアクティブ感を示す
          'hover:text-[#F0F0F0]',
        ].join(' '),
      },
      size: {
        /** sm: 補助的なアクション・コンパクトなレイアウト向け（高さ 36px） */
        sm: 'h-[36px] px-4 text-sm',
        /** md: デフォルトサイズ・主要なアクション向け（高さ 44px） */
        md: 'h-[44px] px-5 text-sm',
        /** lg: CTA（Call To Action）・目立たせたいアクション向け（高さ 52px） */
        lg: 'h-[52px] px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

/** Button コンポーネントの Props 型 */
type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>

/**
 * デザインシステム準拠の Button コンポーネント。
 *
 * @base-ui/react の Button プリミティブをラップし、アクセシビリティを保証しながら
 * デザインシステムのバリアントとサイズを適用する。
 *
 * @example
 * // プライマリボタン（デフォルト）
 * <Button>保存する</Button>
 *
 * @example
 * // セカンダリ・スモールサイズ
 * <Button variant="secondary" size="sm">キャンセル</Button>
 *
 * @example
 * // ゴーストボタン・ラージサイズ
 * <Button variant="ghost" size="lg">詳細を見る</Button>
 */
function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
