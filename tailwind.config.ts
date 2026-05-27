/**
 * PromptVault デザインシステム — Tailwind 設定ファイル
 *
 * globals.css の @config ディレクティブから読み込まれ、
 * ブランドカラーパレットとフォントファミリーを Tailwind のユーティリティクラスとして登録する。
 *
 * 使用例:
 *   bg-brand-accent      → background-color: #6366F1
 *   text-brand-text1     → color: #F0F0F0
 *   font-sans            → font-family: 'Inter', 'Noto Sans JP', sans-serif
 *
 * 注意: Tailwind v4 では @config によるテーマ拡張のみサポート。
 * content のスキャン設定は @tailwindcss/postcss プラグインが自動処理する。
 */

const config = {
  theme: {
    extend: {
      colors: {
        /**
         * ブランドカラーパレット
         * PromptVault のデザインシステムで使用するすべての色を一元管理する。
         * CSS 変数（--color-*）と対応しており、Tailwind クラスで参照できる。
         */
        brand: {
          bg: '#080808',          // ページ背景（最暗）
          surface: '#111111',     // カード・モーダルの背景
          surface2: '#1A1A1A',    // 入力欄・セカンダリサーフェス
          border: '#222222',      // 通常ボーダー
          borderGlow: '#6366F1',  // アクセントカラーのボーダー
          text1: '#F0F0F0',       // プライマリテキスト
          text2: '#8A8A8A',       // セカンダリテキスト・プレースホルダー
          text3: '#4A4A4A',       // ターシャリテキスト・無効状態
          accent: '#6366F1',      // インディゴ — プライマリアクション
          accentHover: '#4F46E5', // アクセントのホバー状態
          success: '#10B981',     // 成功・グリーン
          warning: '#F59E0B',     // 警告・アンバー
          error: '#EF4444',       // エラー・レッド
        },
      },
      fontFamily: {
        /**
         * サンセリフフォントスタック
         * Inter（英語・UI 向き）を優先し、Noto Sans JP（日本語対応）をフォールバックに設定する。
         * system-ui と sans-serif は最終フォールバック。
         */
        sans: ['Inter', 'Noto Sans JP', 'system-ui', 'sans-serif'],
      },
    },
  },
}

export default config
