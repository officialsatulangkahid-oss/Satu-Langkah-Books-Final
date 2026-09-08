# Arsitektur Konten — Satu Langkah Books

## Ringkasan

```
Supabase (source of truth)
   │  npm run generate:content   (build-time, Node)
   ▼
public/content/*.json  ──►  vite build  ──►  dist/  ──►  Hostinger/CDN  ──►  User
```

Supabase tetap menjadi source of truth dan tetap menangani Auth, order,
profil, dan seluruh operasi admin. Yang berubah hanya **jalur delivery konten
publik**: browser tidak lagi query PostgreSQL setiap page view.

## Klasifikasi query

| Data | Kategori | Sumber di runtime |
|---|---|---|
| articles (list & detail) | PUBLIC STATIC | `/content/articles/*.json` |
| products / catalog | PUBLIC STATIC | `/content/products/*.json` |
| projects, courses, categories, authors | PUBLIC STATIC | `/content/*.json` |
| login, signup, session | AUTH | Supabase Auth |
| profiles | PRIVATE | Supabase |
| orders, checkout, Midtrans | TRANSACTIONAL | Supabase + Edge Functions |
| admin panel (`/admin/*`) | ADMIN | Supabase (langsung, dengan RLS) |

Halaman `Product`, `ProductDetail`, `Project`, `ECourse` sudah memakai data
statis lokal sejak awal, jadi tidak ada query yang perlu diubah di sana.

## Content publishing pipeline

- Generator: `scripts/generate-content.mjs`
- Perintah: `npm run generate:content`
- Terpasang di build: `npm run build` = generate content → `vite build`
- Hanya baris `published = true` / `active = true` yang diekspor, dan hanya
  field yang aman untuk publik (tidak ada data user).
- Jika Supabase tidak bisa dihubungi saat build, generator keluar tanpa error
  dan JSON hasil publish sebelumnya tetap dipakai (build tidak pernah gagal).

### Struktur output

```
public/content/
  manifest.json
  articles/index.json        # listing ringan
  articles/{slug}.json       # isi artikel penuh
  products/index.json
  products/{slug}.json
  products.json              # flat file untuk katalog kecil
  projects.json
  courses.json
  categories.json
  authors.json
```

Artikel & produk dipecah per-slug supaya listing tetap ringan dan halaman
detail hanya mengunduh satu file kecil.

## Alur setelah admin mengedit konten

```
Admin edit di /admin  →  Supabase  →  jalankan build (npm run build)
                       →  content JSON ter-regenerate  →  deploy dist/ ke Hostinger
```

## Environment variables

Client (boleh masuk bundle):

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Build-time saja (jangan pernah diawali `VITE_`):

```
SUPABASE_URL
SUPABASE_SECRET_KEY      # opsional; anon key sudah cukup karena hanya baca konten publik
```

## Deploy ke Hostinger Business

```
npm install
npm run build
# upload isi dist/ ke public_html
```

`public/.htaccess` sudah menyiapkan SPA fallback, gzip, dan cache header:
aset ber-hash `immutable`, `/content/*` cache pendek + stale-while-revalidate,
`index.html` `no-cache`. Tidak ada dependency runtime Lovable di production.
