/**
 * Stripe Checkout Session 発行エンドポイント。
 *
 * フロントエンドから POST リクエストを受け取り、Stripe の
 * Checkout Session を生成して URL を返す。
 * フロントエンドはその URL にリダイレクトすることで決済フローを開始する。
 *
 * ユーザー取得:
 *   createServerClient + cookies() を使ってサーバーサイドで認証済みユーザーを
 *   取得し、メールアドレスを Stripe の customer_email に渡す。
 *   クライアントから userId を受け取らないため、なりすましリスクを排除できる。
 *
 * レスポンス（成功時）:
 *   { url: string }  ← Stripe が生成した決済ページ URL
 *
 * レスポンス（失敗時）:
 *   { error: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

/**
 * Stripe クライアントのレイジー初期化。
 * モジュールロード時ではなく、最初のリクエスト時に初期化する。
 * ビルド時に環境変数が未設定でもエラーにならない。
 */
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY が設定されていません')
  return new Stripe(key, { apiVersion: '2026-04-22.dahlia' })
}

/**
 * POST /api/create-checkout
 * Stripe Checkout Session を発行し、決済ページの URL を返す。
 */
export async function POST(_request: NextRequest): Promise<NextResponse> {
  try {
    // ─── サーバーサイドでログインユーザーのメールアドレスを取得する ───────

    // cookies() で Cookie ストアを取得し、Supabase クライアントを生成する。
    // クライアントから userId を受け取る代わりにサーバーサイドで認証情報を参照することで、
    // なりすましリスクを排除する。
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          // Route Handler では Cookie の書き込みは不要なため空実装にする
          setAll() {},
        },
      },
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user || !user.email) {
      return NextResponse.json(
        { error: '認証されていません。再度ログインしてください。' },
        { status: 401 },
      )
    }

    // ─── Stripe Checkout Session を生成する ──────────────────────────────

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      /** 決済モード: subscription（サブスクリプション） */
      mode: 'subscription',

      /**
       * 顧客のメールアドレス。
       * Supabase の認証情報から取得したメールアドレスを Stripe に渡す。
       * Webhook の checkout.session.completed で customer_email として参照される。
       */
      customer_email: user.email,

      /** 購入する料金プラン（環境変数 STRIPE_PRICE_ID から取得） */
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],

      /**
       * 決済完了後のリダイレクト先。
       * NEXT_PUBLIC_APP_URL に本番 URL を設定すること（例: https://your-app.vercel.app）。
       */
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
    })

    if (!session.url) {
      return NextResponse.json(
        { error: 'Checkout Session URL の取得に失敗しました' },
        { status: 500 },
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '不明なエラー'
    return NextResponse.json(
      { error: `Checkout Session の作成に失敗しました: ${message}` },
      { status: 500 },
    )
  }
}
