-- Run AFTER both migrations. Create the Auth user manually first if absent.
-- Does not create/reset passwords or change any other account.
BEGIN;
DO $$
DECLARE target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE lower(email) = 'timkepenulisan@satulangkah.com';
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Buat user timkepenulisan@satulangkah.com di Authentication > Users dahulu.';
  END IF;
  DELETE FROM public.user_roles WHERE user_id = target_user_id AND role::text IN ('admin', 'editor');
  INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'article_editor')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;
COMMIT;
SELECT u.email, r.role FROM auth.users u JOIN public.user_roles r ON r.user_id = u.id
WHERE lower(u.email) = 'timkepenulisan@satulangkah.com';
