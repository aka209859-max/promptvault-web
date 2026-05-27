-- PromptVault データベーススキーマ
-- Supabase ダッシュボード > SQL Editor で実行すること
--
-- テーブル構成:
--   profiles: auth.users と 1:1 で紐付くユーザープロファイル（プラン管理）
--   prompts:  各ユーザーが登録したプロンプトデータ
--
-- セキュリティ:
--   Row Level Security (RLS) を有効化し、
--   各ユーザーが自分のデータのみ参照・操作できるよう制限する

-- ユーザープロファイルテーブル
-- auth.users と 1:1 で連動し、プランと Stripe 顧客 ID を管理する
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  plan TEXT DEFAULT 'free',               -- 'free' または 'pro'
  stripe_customer_id TEXT,                -- Stripe の顧客 ID（課金管理用）
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- プロンプトテーブル
-- ユーザーが登録したスラッシュコマンドとプロンプト本文を管理する
CREATE TABLE public.prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  command TEXT NOT NULL,   -- スラッシュコマンド名（例: "meeting"）
  title TEXT NOT NULL,     -- プロンプトのタイトル
  body TEXT NOT NULL,      -- プロンプト本文
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security を有効化する
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- profiles ポリシー: 自分のプロファイルのみ参照・更新可
CREATE POLICY "自分のプロファイルのみ参照可" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- prompts ポリシー: 自分のプロンプトのみ操作可
CREATE POLICY "自分のプロンプトのみ操作可" ON public.prompts
  FOR ALL USING (auth.uid() = user_id);

-- 新規ユーザー登録時に profiles レコードを自動生成するトリガー関数
-- auth.users に INSERT されたタイミングで呼ばれる
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users の INSERT をフックするトリガー
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
