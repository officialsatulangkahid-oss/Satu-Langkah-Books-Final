-- =====================================================================
-- Satu Langkah Books — Full database setup for a NEW Supabase project
-- Run this ONCE in the SQL Editor of the new project.
-- Safe to re-run: everything is guarded with IF NOT EXISTS / OR REPLACE.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Helper: updated_at trigger function
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------
-- 1. Role-based admin (no hardcoded emails — manage via user_roles table)
-- ---------------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
CREATE POLICY "Admins can read all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.has_role(auth.uid(), 'admin'), false)
$$;

-- Grant admin to an account (run once per email after the user signs up):
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin' FROM auth.users WHERE email = 'email@anda.com'
-- ON CONFLICT (user_id, role) DO NOTHING;
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users
WHERE email IN ('officialsatulangkahid@gmail.com', 'reza.ar711@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- ---------------------------------------------------------------------
-- 2. PROFILES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  text,
  avatar_url    text,
  bio           text,
  username      text,
  full_name     text,
  date_of_birth date,
  gender        text,
  country       text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create a profile row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, display_name, avatar_url, username, full_name,
    date_of_birth, gender, country
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NULLIF(NEW.raw_user_meta_data->>'date_of_birth','')::date,
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'country'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------
-- 3. ARTICLES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.articles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text NOT NULL UNIQUE,
  title      text NOT NULL,
  excerpt    text,
  category   text,
  read_time  text,
  date       text,
  image_url  text,
  author     text DEFAULT 'Tim Satu Langkah',
  featured   boolean DEFAULT false,
  published  boolean DEFAULT true,
  content    jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Articles public read published" ON public.articles;
CREATE POLICY "Articles public read published"
  ON public.articles FOR SELECT USING (published = true OR public.is_admin());

DROP POLICY IF EXISTS "Articles admin insert" ON public.articles;
CREATE POLICY "Articles admin insert"
  ON public.articles FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Articles admin update" ON public.articles;
CREATE POLICY "Articles admin update"
  ON public.articles FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Articles admin delete" ON public.articles;
CREATE POLICY "Articles admin delete"
  ON public.articles FOR DELETE USING (public.is_admin());

DROP TRIGGER IF EXISTS trg_articles_updated_at ON public.articles;
CREATE TRIGGER trg_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------
-- 4. PRODUCTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text NOT NULL UNIQUE,
  title            text NOT NULL,
  category         text,
  image_url        text,
  price            integer DEFAULT 0,
  short_desc       text,
  long_description jsonb DEFAULT '[]'::jsonb,
  details          jsonb DEFAULT '[]'::jsonb,
  external_link    text,
  checkout_enabled boolean DEFAULT false,
  product_type     text DEFAULT 'ebook',
  active           boolean DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products public read active" ON public.products;
CREATE POLICY "Products public read active"
  ON public.products FOR SELECT USING (active = true OR public.is_admin());

DROP POLICY IF EXISTS "Products admin insert" ON public.products;
CREATE POLICY "Products admin insert"
  ON public.products FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Products admin update" ON public.products;
CREATE POLICY "Products admin update"
  ON public.products FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Products admin delete" ON public.products;
CREATE POLICY "Products admin delete"
  ON public.products FOR DELETE USING (public.is_admin());

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------
-- 5. PROJECTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text NOT NULL UNIQUE,
  title        text NOT NULL,
  description  text,
  icon         text DEFAULT 'Book',
  status       text DEFAULT 'active',
  project_type text,
  sort_order   integer DEFAULT 0,
  active       boolean DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Projects public read active" ON public.projects;
CREATE POLICY "Projects public read active"
  ON public.projects FOR SELECT USING (active = true OR public.is_admin());

DROP POLICY IF EXISTS "Projects admin insert" ON public.projects;
CREATE POLICY "Projects admin insert"
  ON public.projects FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Projects admin update" ON public.projects;
CREATE POLICY "Projects admin update"
  ON public.projects FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Projects admin delete" ON public.projects;
CREATE POLICY "Projects admin delete"
  ON public.projects FOR DELETE USING (public.is_admin());

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------
-- 6. COURSES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  title       text NOT NULL,
  description text,
  level       text DEFAULT 'Pemula',
  duration    text,
  lessons     integer DEFAULT 0,
  students    integer DEFAULT 0,
  price       integer DEFAULT 0,
  image_url   text,
  active      boolean DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Courses public read active" ON public.courses;
CREATE POLICY "Courses public read active"
  ON public.courses FOR SELECT USING (active = true OR public.is_admin());

DROP POLICY IF EXISTS "Courses admin insert" ON public.courses;
CREATE POLICY "Courses admin insert"
  ON public.courses FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Courses admin update" ON public.courses;
CREATE POLICY "Courses admin update"
  ON public.courses FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Courses admin delete" ON public.courses;
CREATE POLICY "Courses admin delete"
  ON public.courses FOR DELETE USING (public.is_admin());

DROP TRIGGER IF EXISTS trg_courses_updated_at ON public.courses;
CREATE TRIGGER trg_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------
-- 7. ORDERS (checkout / Midtrans)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              text NOT NULL UNIQUE,
  customer_name         text NOT NULL,
  customer_email        text NOT NULL,
  customer_phone        text,
  product_type          text NOT NULL,
  product_id            text NOT NULL,
  product_name          text NOT NULL,
  amount                integer NOT NULL,
  status                text NOT NULL DEFAULT 'pending',
  payment_method        text,
  midtrans_token        text,
  midtrans_redirect_url text,
  paid_at               timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view orders by order_id" ON public.orders;
CREATE POLICY "Anyone can view orders by order_id"
  ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can update orders" ON public.orders;
CREATE POLICY "Service role can update orders"
  ON public.orders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Orders admin can delete" ON public.orders;
CREATE POLICY "Orders admin can delete"
  ON public.orders FOR DELETE USING (public.is_admin());

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------
-- 8. CONTENT_FILES (published JSON read by the public website)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_files (
  path       text PRIMARY KEY,
  data       jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.content_files TO anon;
GRANT SELECT ON public.content_files TO authenticated;
GRANT ALL ON public.content_files TO service_role;

ALTER TABLE public.content_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Content files are public" ON public.content_files;
CREATE POLICY "Content files are public"
  ON public.content_files FOR SELECT USING (true);

-- ---------------------------------------------------------------------
-- 9. STORAGE bucket for images uploaded from the admin panel
-- ---------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-images', 'content-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Content images are public" ON storage.objects;
CREATE POLICY "Content images are public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'content-images');

DROP POLICY IF EXISTS "Admin can upload content images" ON storage.objects;
CREATE POLICY "Admin can upload content images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'content-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admin can update content images" ON storage.objects;
CREATE POLICY "Admin can update content images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'content-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admin can delete content images" ON storage.objects;
CREATE POLICY "Admin can delete content images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'content-images' AND public.is_admin());

-- =====================================================================
-- DONE.
-- Next steps in the new project:
--  1. Auth > Providers: enable Email and Google, set Site URL + redirect URLs.
--  2. Deploy the edge functions in supabase/functions
--     (publish-content, create-transaction, midtrans-webhook,
--      get-midtrans-config) and set their secrets:
--     MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY.
--  3. Sign in to /admin with officialsatulangkahid@gmail.com and press
--     Save once on any item — that fills content_files and the public
--     pages start showing content.
-- =====================================================================
