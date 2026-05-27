/**
 * PromptVault Web — トップページ（最小構成）
 *
 * デザインシステム基盤（globals.css）の背景色・フォント設定を
 * 妨げないよう、初期の Next.js デフォルトデザインをクリーンアップした最小構成。
 * 実際の UI ページは別セッションで実装する。
 */

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="flex flex-col gap-4 items-center">
        <h1 className="text-2xl font-bold tracking-tight">PromptVault Web Backend</h1>
        <p className="text-sm opacity-60">Design system base initialized successfully.</p>
      </main>
    </div>
  );
}
