/**
 * Stripe Webhook 受信エンドポイント。
 *
 * Stripe から送られてくるイベントを受信し、署名を検証した後に
 * 対象のイベントを処理する。
 *
 * 対応イベント:
 *   - checkout.session.completed: 決済完了時に profiles.plan を 'pro' に更新する
 *
 * セキュリティ:
 *   - stripe.webhooks.constructEvent でシグネチャを検証し、
 *     不正なリクエストを 400 で弾く。
 *   - Supabase の更新には管理者権限（service role）クライアントを使用し、
 *     RLS をバイパスして確実に更新する。
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceRoleClient } from '@/lib/supabase/server'

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
 * POST /api/webhook
 * Stripe からの Webhook イベントを受信・処理する。
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // リクエストボディを Raw バイト列として取得（署名検証に必要）
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'stripe-signature ヘッダーが存在しません' },
      { status: 400 },
    )
  }

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    // シグネチャを検証してイベントを復元する
    // 検証に失敗した場合は SignatureVerificationError がスローされる
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラー'
    console.error('[Webhook] シグネチャ検証エラー:', message)
    return NextResponse.json(
      { error: `Webhook シグネチャ検証失敗: ${message}` },
      { status: 400 },
    )
  }

  try {
    // イベントの種別に応じて処理を分岐する
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // create-checkout/route.ts で metadata に埋め込んだユーザー ID を取得する
        const userId = session.metadata?.userId

        if (!userId) {
          console.error('[Webhook] metadata.userId が存在しません', session.id)
          // ユーザー ID がない場合は処理不可だが Stripe に 200 を返してリトライを防ぐ
          return NextResponse.json({ received: true })
        }

        // サービスロールクライアントで RLS をバイパスして plan を更新する
        const supabase = createServiceRoleClient()
        const { error } = await supabase
          .from('profiles')
          .update({ plan: 'pro' })
          .eq('id', userId)

        if (error) {
          console.error('[Webhook] profiles 更新エラー:', error.message)
          return NextResponse.json(
            { error: 'データベース更新に失敗しました' },
            { status: 500 },
          )
        }

        console.log(`[Webhook] ユーザー ${userId} を pro プランに更新しました`)
        break
      }

      default:
        // 未対応のイベントは無視して 200 を返す（Stripe のリトライ防止）
        console.log(`[Webhook] 未対応イベントを受信: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラー'
    console.error('[Webhook] 処理中エラー:', message)
    return NextResponse.json(
      { error: '内部サーバーエラー' },
      { status: 500 },
    )
  }
}
