
-- ============= ADMIN FUNCTION =============
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(auth.email() = 'officialsatulangkahid@gmail.com', false)
$$;

-- ============= ARTICLES =============
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  category text,
  read_time text,
  date text,
  image_url text,
  author text DEFAULT 'Tim Satu Langkah',
  featured boolean DEFAULT false,
  published boolean DEFAULT true,
  content jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Articles public read published" ON public.articles
  FOR SELECT USING (published = true OR public.is_admin());
CREATE POLICY "Articles admin insert" ON public.articles
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Articles admin update" ON public.articles
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Articles admin delete" ON public.articles
  FOR DELETE USING (public.is_admin());
CREATE TRIGGER trg_articles_updated_at BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= PRODUCTS =============
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  category text,
  image_url text,
  price integer DEFAULT 0,
  short_desc text,
  long_description jsonb DEFAULT '[]'::jsonb,
  details jsonb DEFAULT '[]'::jsonb,
  external_link text,
  checkout_enabled boolean DEFAULT false,
  product_type text DEFAULT 'ebook',
  active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products public read active" ON public.products
  FOR SELECT USING (active = true OR public.is_admin());
CREATE POLICY "Products admin insert" ON public.products
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Products admin update" ON public.products
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Products admin delete" ON public.products
  FOR DELETE USING (public.is_admin());
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= PROJECTS =============
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  icon text DEFAULT 'Book',
  status text DEFAULT 'active',
  project_type text,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects public read active" ON public.projects
  FOR SELECT USING (active = true OR public.is_admin());
CREATE POLICY "Projects admin insert" ON public.projects
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Projects admin update" ON public.projects
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Projects admin delete" ON public.projects
  FOR DELETE USING (public.is_admin());
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= COURSES =============
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  level text DEFAULT 'Pemula',
  duration text,
  lessons integer DEFAULT 0,
  students integer DEFAULT 0,
  price integer DEFAULT 0,
  image_url text,
  active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses public read active" ON public.courses
  FOR SELECT USING (active = true OR public.is_admin());
CREATE POLICY "Courses admin insert" ON public.courses
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Courses admin update" ON public.courses
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Courses admin delete" ON public.courses
  FOR DELETE USING (public.is_admin());
CREATE TRIGGER trg_courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= STORAGE BUCKET =============
INSERT INTO storage.buckets (id, name, public) VALUES ('content-images', 'content-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Content images public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'content-images');
CREATE POLICY "Content images admin upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'content-images' AND public.is_admin());
CREATE POLICY "Content images admin update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'content-images' AND public.is_admin());
CREATE POLICY "Content images admin delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'content-images' AND public.is_admin());

-- ============= ADMIN ACCESS TO ORDERS =============
CREATE POLICY "Orders admin can update" ON public.orders
  FOR DELETE USING (public.is_admin());

-- ============= SEED DATA =============
INSERT INTO public.articles (slug, title, excerpt, category, read_time, date, image_url, featured, content) VALUES
('budaya-membaca-tradisi-islam', 'Budaya Membaca dalam Tradisi Islam',
 'Islam sangat menghargai ilmu dan membaca. Ayat pertama yang turun adalah ''Iqra'' - bacalah. Bagaimana kita bisa menghidupkan kembali budaya membaca di tengah masyarakat?',
 'Literasi Islam', '6 menit', '18 Desember 2024', '/seed/article-budaya-membaca.jpg', true,
 '["Islam adalah agama yang menempatkan ilmu pada posisi yang sangat mulia. Wahyu pertama yang diturunkan kepada Rasulullah ﷺ adalah perintah untuk membaca — \"Iqra'' bismi Rabbika alladzi khalaq\" (Bacalah dengan menyebut nama Tuhanmu yang menciptakan). Perintah ini bukan sekadar instruksi teknis, melainkan sebuah deklarasi bahwa membaca adalah pintu gerbang menuju pencerahan dan kebenaran.","Dalam tradisi keilmuan Islam, membaca bukan hanya aktivitas intelektual. Ia adalah ibadah.","Perpustakaan-perpustakaan besar dalam sejarah Islam menjadi bukti nyata betapa Islam sangat menghargai budaya literasi.","Namun, di era modern ini, budaya membaca di kalangan umat Islam mengalami penurunan yang signifikan.","Mari mulai dari satu langkah kecil setiap hari."]'::jsonb),
('mengenal-tauhid', 'Mengenal Tauhid: Fondasi Kehidupan Seorang Muslim',
 'Tauhid adalah inti dari ajaran Islam yang menjadi landasan seluruh aspek kehidupan seorang muslim.',
 'Tauhid', '8 menit', '20 Desember 2024', '/seed/how-to-read-a-book.png', false,
 '["Tauhid adalah inti dari ajaran Islam yang menjadi landasan seluruh aspek kehidupan seorang muslim.","Secara bahasa, tauhid berarti mengesakan.","Pemahaman yang benar tentang tauhid akan menghasilkan ketenangan hati."]'::jsonb),
('mendidik-generasi-qurani', 'Mendidik Generasi dengan Pendekatan Qur''ani',
 'Al-Qur''an memberikan panduan lengkap dalam mendidik generasi muda dengan prinsip-prinsip pendidikan yang luhur.',
 'Pendidikan', '10 menit', '15 Desember 2024', '/seed/reading-journal-2026.png', false,
 '["Al-Qur''an adalah pedoman utama dalam mendidik generasi.","Pendidikan Qur''ani menekankan adab sebelum ilmu."]'::jsonb),
('refleksi-satu-langkah', 'Refleksi: Makna Satu Langkah dalam Perjalanan Ilmu',
 'Setiap perjalanan panjang dimulai dengan satu langkah. Bagaimana kita memahami makna langkah kecil yang konsisten?',
 'Refleksi', '5 menit', '12 Desember 2024', '/seed/the-art-of-reading.png', false,
 '["Setiap perjalanan panjang dimulai dengan satu langkah.","Konsistensi adalah kunci."]'::jsonb),
('adab-menuntut-ilmu', 'Adab Menuntut Ilmu dalam Islam',
 'Ilmu tanpa adab bagaikan pohon tanpa buah. Mengenal adab-adab menuntut ilmu yang diajarkan oleh para ulama salaf.',
 'Pendidikan', '7 menit', '10 Desember 2024', '/seed/how-to-read-a-book.png', false,
 '["Ilmu tanpa adab bagaikan pohon tanpa buah.","Para ulama salaf sangat menekankan adab."]'::jsonb),
('peran-ulama', 'Ulama dan Peranannya dalam Menjaga Umat',
 'Para ulama adalah pewaris para nabi. Memahami peran penting ulama dalam menjaga kemurnian ajaran Islam.',
 'Literasi Islam', '9 menit', '8 Desember 2024', '/seed/article-budaya-membaca.jpg', false,
 '["Para ulama adalah pewaris para nabi."]'::jsonb);

INSERT INTO public.products (slug, title, category, image_url, price, short_desc, long_description, details, external_link, checkout_enabled, product_type) VALUES
('reading-journal-special', 'Reading Journal 2026 Special Edition for Sister', 'E-Book', '/seed/reading-journal-special.png', 89000,
 'Edisi spesial Reading Journal yang dirancang khusus untuk para sister. Dilengkapi dengan layout estetik, tracker membaca, dan space refleksi.',
 '["Di tengah hiruk pikuk kehidupan, Muslimah membutuhkan ruang yang menenangkan—untuk membaca, merenung, dan menata diri.","Journal ini dirancang khusus dengan sentuhan Islami yang lembut, dilengkapi panduan adab menuntut ilmu, refleksi ruhani, dan motivasi bulanan."]'::jsonb,
 '[{"label":"Judul","value":"Reading Journal Special Edition for Sister"},{"label":"Penerbit","value":"Satu Langkah"},{"label":"Halaman","value":"±470"},{"label":"Isi Utama","value":"Adab membaca, keutamaan istiqamah, reading goal, habit formation, refleksi Islami bulanan."}]'::jsonb,
 'https://lynk.id/satulangkahofficial/dyze791vzeew/checkout', true, 'ebook'),
('reading-journal-2026', 'Reading Journal 2026', 'E-Book', '/seed/reading-journal-2026.png', 75000,
 'Reading Journal 2026 dengan desain minimalis dan elegan.',
 '["Di tengah hiruk pikuk kehidupan, setiap pencari ilmu membutuhkan ruang yang menenangkan—untuk membaca, merenung, dan menata diri dengan niat yang lurus.","Journal ini dirancang dengan pendekatan Islami yang reflektif."]'::jsonb,
 '[{"label":"Judul","value":"Reading Journal"},{"label":"Penerbit","value":"Satu Langkah"},{"label":"Halaman","value":"±470"},{"label":"Isi Utama","value":"Adab membaca, istiqamah, reading goal, habit formation."}]'::jsonb,
 'https://lynk.id/satulangkahofficial/x58o13ynkk59/checkout', true, 'ebook');

INSERT INTO public.projects (slug, title, description, icon, status, project_type, sort_order) VALUES
('ebook-tauhid', 'E-Book Seri Tauhid', 'Koleksi e-book tentang tauhid yang disusun secara sistematis dan mudah dipahami.', 'Book', 'active', 'E-Book', 1),
('learning-tools', 'Learning Tools', 'Berbagai alat bantu belajar digital seperti flashcard, mind map, dan worksheet.', 'Wrench', 'active', 'Digital Tools', 2),
('program-literasi', 'Program Literasi Komunitas', 'Program membaca bersama dan diskusi buku untuk membangun komunitas pembelajar.', 'Users', 'ongoing', 'Program', 3),
('kelas-online', 'Kelas Belajar Online', 'Kelas online terstruktur dengan materi yang disusun oleh para pengajar berpengalaman.', 'GraduationCap', 'active', 'E-Course', 4);

INSERT INTO public.courses (slug, title, description, level, duration, lessons, students, price) VALUES
('pengantar-tauhid', 'Pengantar Ilmu Tauhid', 'Memahami dasar-dasar tauhid sebagai fondasi kehidupan seorang muslim dengan pendekatan yang sistematis.', 'Pemula', '4 Jam', 12, 250, 99000),
('adab-penuntut-ilmu', 'Adab Penuntut Ilmu', 'Mempelajari adab-adab yang harus dimiliki seorang penuntut ilmu berdasarkan tuntunan ulama salaf.', 'Pemula', '3 Jam', 8, 180, 79000),
('manhaj-belajar', 'Manhaj Belajar Islam', 'Panduan praktis dalam menyusun kurikulum belajar Islam mandiri yang terstruktur dan berkelanjutan.', 'Menengah', '6 Jam', 15, 120, 149000),
('pendidikan-anak', 'Pendidikan Anak Islami', 'Prinsip dan metode mendidik anak sesuai tuntunan Islam untuk membentuk generasi yang berakhlak mulia.', 'Menengah', '5 Jam', 10, 200, 129000);
