-- Run separately and commit before running the next migration.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'article_editor';
