-- Run manually in Supabase SQL Editor. No Auth users, passwords or roles are modified.
BEGIN;
CREATE TABLE IF NOT EXISTS public.learn_progress (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 state jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(state) = 'object' AND octet_length(state::text) <= 200000),
 updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.learn_progress ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.learn_progress FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.learn_progress TO authenticated;
DROP POLICY IF EXISTS "Learner reads own progress" ON public.learn_progress;
DROP POLICY IF EXISTS "Learner creates own progress" ON public.learn_progress;
DROP POLICY IF EXISTS "Learner updates own progress" ON public.learn_progress;
CREATE POLICY "Learner reads own progress" ON public.learn_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Learner creates own progress" ON public.learn_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Learner updates own progress" ON public.learn_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.learn_progress_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
DROP TRIGGER IF EXISTS learn_progress_updated_at ON public.learn_progress;
CREATE TRIGGER learn_progress_updated_at BEFORE UPDATE ON public.learn_progress FOR EACH ROW EXECUTE FUNCTION public.learn_progress_updated_at();
COMMIT;
-- Self-reported free learning progress. Never use this JSON as a payment entitlement or verified certificate.
