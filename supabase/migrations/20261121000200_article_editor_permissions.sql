BEGIN;
-- Keep admin identity role-based; never use editable user_metadata for access.
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT COALESCE(public.has_role(auth.uid(), 'admin'), false) $$;
CREATE OR REPLACE FUNCTION public.can_edit_articles() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.is_admin() OR COALESCE(public.has_role(auth.uid(), 'article_editor'), false) $$;
REVOKE ALL ON FUNCTION public.can_edit_articles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_edit_articles() TO authenticated;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
DROP POLICY IF EXISTS "Article editors read" ON public.articles;
DROP POLICY IF EXISTS "Article editors insert" ON public.articles;
DROP POLICY IF EXISTS "Article editors update" ON public.articles;
DROP POLICY IF EXISTS "Article editors delete" ON public.articles;
CREATE POLICY "Article editors read" ON public.articles FOR SELECT TO authenticated USING (public.can_edit_articles());
CREATE POLICY "Article editors insert" ON public.articles FOR INSERT TO authenticated WITH CHECK (public.can_edit_articles());
CREATE POLICY "Article editors update" ON public.articles FOR UPDATE TO authenticated USING (public.can_edit_articles()) WITH CHECK (public.can_edit_articles());
CREATE POLICY "Article editors delete" ON public.articles FOR DELETE TO authenticated USING (public.can_edit_articles());
-- Restrictive guards also block accidental broad permissive policies for editor accounts.
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['products','projects','courses','orders','user_roles','content_files'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Article editor write boundary" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Article editor write boundary" ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (NOT public.has_role(auth.uid(), ''article_editor'') OR public.is_admin() OR %L IN (''user_roles'', ''content_files'')) WITH CHECK (NOT public.has_role(auth.uid(), ''article_editor'') OR public.is_admin())', t, t);
  END LOOP;
END $$;
-- Editors only insert new objects in their own articles/<user-id>/ folder.
-- No update/delete permission to overwrite existing site images.
DROP POLICY IF EXISTS "Article editor images insert" ON storage.objects;
CREATE POLICY "Article editor images insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'content-images' AND public.has_role(auth.uid(), 'article_editor')
  AND (storage.foldername(name))[1] = 'articles'
  AND (storage.foldername(name))[2] = auth.uid()::text);
DROP POLICY IF EXISTS "Article editor image boundary" ON storage.objects;
CREATE POLICY "Article editor image boundary" ON storage.objects AS RESTRICTIVE FOR ALL TO authenticated
USING (NOT public.has_role(auth.uid(), 'article_editor') OR public.is_admin() OR bucket_id = 'content-images')
WITH CHECK (NOT public.has_role(auth.uid(), 'article_editor') OR public.is_admin() OR
 (bucket_id = 'content-images' AND (storage.foldername(name))[1] = 'articles' AND (storage.foldername(name))[2] = auth.uid()::text));
-- Authenticated users may read their roles, but cannot assign roles themselves.
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated;
COMMIT;
