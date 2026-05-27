/**
 * Stripe Webhook 受信エンドポイント。
 *
 * Stripe から送られてくるイベントを受信し、署名を検証した後に
 * 対象のイベントを処理する。
 *
 * 対応イベント:
 *   - checkout.session.completed: 決済完了時に profiles.plan を 'pro' に更新する
 *
 * ユーザー特定フロー:
 *   1. Stripe セッションの customer_email を取得
 *   2. supabaseAdmin.auth.admin.listUsers() で全ユーザーを取得
 *   3. email が一致するユーザーの ID で profiles テーブルを更新
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
  // ─── シグネチャ検証 ────────────────────────────────────────────────────────

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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '不明なエラー'
    return NextResponse.json(
      { error: `Webhook シグネチャ検証失敗: ${message}` },
      { status: 400 },
    )
  }

  // ─── イベント処理 ──────────────────────────────────────────────────────────

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Stripe セッションから顧客のメールアドレスを取得する
        const customerEmail = session.customer_email

        if (!customerEmail) {
          // customer_email がない場合はユーザーを特定できないため処理をスキップ。
          // Stripe に 200 を返してリトライを防ぐ。
          return NextResponse.json({ received: true })
        }

        // ─── listUsers() でメールアドレスからユーザーを特定する ────────────
        const supabaseAdmin = createServiceRoleClient()

        // 全ユーザーを取得してメールアドレスで絞り込む。
        // perPage: 1000 でユーザー数が少ない段階は1ページで全件取得できる。
        const { data: listData, error: listError } =
          await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })

        if (listError) {
          return NextResponse.json(
            { error: `ユーザー一覧の取得に失敗しました: ${listError.message}` },
            { status: 500 },
          )
        }

        // メールアドレスが一致するユーザーを検索する
        const targetUser = listData.users.find(
          (u) => u.email === customerEmail,
        )

        if (!targetUser) {
          // 対応するユーザーが見つからない場合は処理をスキップして 200 を返す
          return NextResponse.json({ received: true })
        }

        // ─── profiles テーブルの plan を 'pro' に更新する ─────────────────
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ plan: 'pro' })
          .eq('id', targetUser.id)

        if (updateError) {
          return NextResponse.json(
            { error: `データベース更新に失敗しました: ${updateError.message}` },
            { status: 500 },
          )
        }

        break
      }

      default:
        // 未対応のイベントは無視して 200 を返す（Stripe のリトライ防止）
        break
    }

    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '不明なエラー'
    return NextResponse.json(
      { error: `内部サーバーエラー: ${message}` },
      { status: 500 },
    )
  }
}
