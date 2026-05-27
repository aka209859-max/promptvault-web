/**
 * Stripe Checkout Session 発行エンドポイント。
 *
 * フロントエンドから POST リクエストを受け取り、Stripe の
 * Checkout Session を生成して URL を返す。
 * フロントエンドはその URL にリダイレクトすることで決済フローを開始する。
 *
 * リクエストボディ:
 *   { userId: string }  ← Supabase の auth.uid()（Webhook でプラン更新に使用）
 *
 * レスポンス（成功時）:
 *   { url: string }     ← Stripe が生成した決済ページ URL
 *
 * セキュリティ:
 *   - userId は Supabase 認証で検証済みであることを前提とする
 *   - Stripe のシークレットキーはサーバーサイドのみで使用し、クライアントに露出しない
 */

import { NextRequest, NextResponse } from 'next/server'
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
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json()

    // リクエストボディのバリデーション
    if (
      typeof body !== 'object' ||
      body === null ||
      !('userId' in body) ||
      typeof (body as Record<string, unknown>).userId !== 'string'
    ) {
      return NextResponse.json(
        { error: 'リクエストボディに userId（string）が必要です' },
        { status: 400 },
      )
    }

    const { userId } = body as { userId: string }

    // Stripe クライアントを取得し Checkout Session を生成する
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      /** 決済モード: subscription（サブスクリプション） */
      mode: 'subscription',

      /** 購入する料金プラン（環境変数 STRIPE_PRICE_ID から取得） */
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],

      /**
       * 決済完了後のリダイレクト先。
       * 成功時: /success ページ
       * キャンセル時: /upgrade ページ（決済ポップアップに戻る）
       */
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,

      /**
       * Webhook 処理で参照するためにユーザー ID を metadata に埋め込む。
       * checkout.session.completed イベントの session.metadata.userId で取得できる。
       */
      metadata: {
        userId,
      },
    })

    if (!session.url) {
      return NextResponse.json(
        { error: 'Checkout Session URL の取得に失敗しました' },
        { status: 500 },
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラー'
    console.error('[create-checkout] エラー:', message)
    return NextResponse.json(
      { error: `Checkout Session の作成に失敗しました: ${message}` },
      { status: 500 },
    )
  }
}
