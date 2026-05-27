/**
 * PromptVault — プロンプト CRUD ユーティリティ
 *
 * Supabase の `prompts` テーブルに対する操作関数群。
 * サーバー/ブラウザどちらの SupabaseClient でも動作するよう、
 * クライアントを引数で受け取る設計にしている。
 *
 * エラーハンドリング:
 *   各関数は try/catch でラップし、Supabase エラーを
 *   日本語メッセージ付きの Error としてスローする。
 *   呼び出し元は try/catch で捕捉すること。
 *
 * any 型について:
 *   SupabaseClient はデフォルトジェネリック（内部的に anyを使用）だが、
 *   本ファイルでは明示的な any 型の記述は一切行わない。
 */

import type { SupabaseClient } from '@supabase/supabase-js'

// ─── 型定義 ──────────────────────────────────────────────────────────────────

/**
 * prompts テーブルの行を表す型。
 * スキーマ（docs/schema.sql）の定義と 1:1 対応する。
 */
export type Prompt = {
  id: string
  user_id: string
  command: string
  title: string
  body: string
  created_at: string
}

/**
 * 新規プロンプト作成時に必要なフィールド型。
 * id / user_id / created_at はサーバーが自動付与するため除外する。
 */
export type NewPrompt = Omit<Prompt, 'id' | 'user_id' | 'created_at'>

// ─── 定数 ────────────────────────────────────────────────────────────────────

/** Free プランで保存できるプロンプトの上限件数 */
const FREE_PLAN_LIMIT = 30

// ─── CRUD 関数 ───────────────────────────────────────────────────────────────

/**
 * ログインユーザーのプロンプト一覧を取得する。
 * RLS によりログインユーザーのデータのみ返される。
 * created_at 降順（新しいものが先頭）でソートする。
 *
 * @param supabase - サーバー / ブラウザどちらの Supabase クライアントも可
 * @returns プロンプト配列（0件の場合は空配列）
 * @throws Supabaseクエリエラーまたはネットワークエラーをスロー
 */
export async function getPrompts(supabase: SupabaseClient): Promise<Prompt[]> {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`プロンプト一覧の取得に失敗しました: ${error.message}`)
    }

    // data が null の場合は空配列を返す（型アサーションで Prompt[] に変換）
    return (data ?? []) as Prompt[]
  } catch (err: unknown) {
    if (err instanceof Error) throw err
    throw new Error('プロンプト一覧の取得中に予期しないエラーが発生しました')
  }
}

/**
 * 新規プロンプトを追加する。
 * user_id は Supabase の RLS + auth.uid() により自動設定される。
 *
 * @param supabase - Supabase クライアント
 * @param data - 追加するプロンプトデータ（command / title / body）
 * @returns 作成されたプロンプト（id / user_id / created_at 付き）
 * @throws 追加失敗時にスロー
 */
export async function addPrompt(
  supabase: SupabaseClient,
  data: NewPrompt
): Promise<Prompt> {
  try {
    // RLS ポリシーが user_id の一致を要求するため、INSERT 前にログインユーザーを取得する
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error('認証されていません。再度ログインしてください。')
    }

    const { data: created, error } = await supabase
      .from('prompts')
      .insert({ ...data, user_id: user.id })
      .select()
      .single()

    if (error) {
      throw new Error(`プロンプトの追加に失敗しました: ${error.message}`)
    }
    if (!created) {
      throw new Error('プロンプトの追加後にデータの取得に失敗しました')
    }

    return created as Prompt
  } catch (err: unknown) {
    if (err instanceof Error) throw err
    throw new Error('プロンプトの追加中に予期しないエラーが発生しました')
  }
}

/**
 * 既存プロンプトを更新する。
 * RLS により自分のプロンプトのみ更新可能。
 *
 * @param supabase - Supabase クライアント
 * @param id - 更新対象のプロンプト ID
 * @param data - 更新するフィールド（部分更新可能）
 * @returns 更新後のプロンプト
 * @throws 更新失敗時にスロー
 */
export async function updatePrompt(
  supabase: SupabaseClient,
  id: string,
  data: Partial<NewPrompt>
): Promise<Prompt> {
  try {
    const { data: updated, error } = await supabase
      .from('prompts')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`プロンプトの更新に失敗しました: ${error.message}`)
    }
    if (!updated) {
      throw new Error('プロンプトの更新後にデータの取得に失敗しました')
    }

    return updated as Prompt
  } catch (err: unknown) {
    if (err instanceof Error) throw err
    throw new Error('プロンプトの更新中に予期しないエラーが発生しました')
  }
}

/**
 * プロンプトを削除する。
 * RLS により自分のプロンプトのみ削除可能。
 *
 * @param supabase - Supabase クライアント
 * @param id - 削除対象のプロンプト ID
 * @throws 削除失敗時にスロー
 */
export async function deletePrompt(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`プロンプトの削除に失敗しました: ${error.message}`)
    }
  } catch (err: unknown) {
    if (err instanceof Error) throw err
    throw new Error('プロンプトの削除中に予期しないエラーが発生しました')
  }
}

/**
 * プロンプトをあと1件追加できるか判定する。
 *
 * - pro プランの場合は常に true を返す（無制限）。
 * - free プランの場合は現在の保存数が FREE_PLAN_LIMIT（30件）未満であれば true。
 *
 * @param supabase - Supabase クライアント
 * @param plan - ユーザーの現在のプラン
 * @returns 追加可能であれば true
 * @throws カウントクエリ失敗時にスロー
 */
export async function canAddPrompt(
  supabase: SupabaseClient,
  plan: 'free' | 'pro'
): Promise<boolean> {
  // Pro プランは上限なし
  if (plan === 'pro') return true

  try {
    // count: 'exact' + head: true で件数のみを取得する（本文取得なしで軽量）
    const { count, error } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })

    if (error) {
      throw new Error(`上限チェックに失敗しました: ${error.message}`)
    }

    return (count ?? 0) < FREE_PLAN_LIMIT
  } catch (err: unknown) {
    if (err instanceof Error) throw err
    throw new Error('上限チェック中に予期しないエラーが発生しました')
  }
}
