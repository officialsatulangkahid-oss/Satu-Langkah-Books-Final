#!/usr/bin/env node
/**
 * Content publishing pipeline.
 *
 * Supabase (source of truth) -> static JSON in public/content -> CDN (Hostinger).
 *
 * Run:  npm run generate:content
 * Build: npm run build  (generate:content && vite build)
 *
 * Env (build-time only, never exposed to the browser):
 *   SUPABASE_URL            (falls back to VITE_SUPABASE_URL)
 *   SUPABASE_SECRET_KEY     (optional service key; falls back to VITE_SUPABASE_PUBLISHABLE_KEY)
 *
 * The generator only reads PUBLIC content (published/active rows) and only
 * writes fields that are safe to expose publicly.
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

// --- load .env (no dotenv dependency) -------------------------------------
async function loadEnvFile() {
  try {
    const raw = await fs.readFile(path.resolve(process.cwd(), ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!m) continue;
      const key = m[1];
      let value = m[2].trim().replace(/^["']|["']$/g, "");
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    /* no .env — rely on process env */
  }
}

const OUT_DIR = path.resolve(process.cwd(), "public", "content");

async function writeJson(relPath, data) {
  const file = path.join(OUT_DIR, relPath);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data), "utf8");
  const bytes = Buffer.byteLength(JSON.stringify(data));
  console.log(`  ✓ content/${relPath.replace(/\\/g, "/")} (${(bytes / 1024).toFixed(1)} KB)`);
}

const pick = (row, keys) => Object.fromEntries(keys.map((k) => [k, row[k] ?? null]));

async function main() {
  await loadEnvFile();

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.warn(
      "[generate-content] Missing SUPABASE_URL / key — keeping existing public/content as-is."
    );
    return;
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const generatedAt = new Date().toISOString();
  console.log("[generate-content] Publishing static content…");

  /* ------------------------------ ARTICLES ------------------------------ */
  const LIST_FIELDS = [
    "id",
    "slug",
    "title",
    "excerpt",
    "category",
    "read_time",
    "date",
    "image_url",
    "featured",
    "author",
  ];

  const { data: articles, error: articlesErr } = await supabase
    .from("articles")
    .select(
      "id, slug, title, excerpt, category, read_time, date, image_url, featured, author, content, created_at"
    )
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (articlesErr) throw articlesErr;

  const articleRows = articles ?? [];
  await writeJson("articles/index.json", {
    generatedAt,
    count: articleRows.length,
    items: articleRows.map((a) => pick(a, LIST_FIELDS)),
  });
  for (const a of articleRows) {
    if (!a.slug) continue;
    await writeJson(`articles/${a.slug}.json`, {
      generatedAt,
      ...pick(a, [...LIST_FIELDS, "content"]),
    });
  }

  /* ------------------------------ PRODUCTS ------------------------------ */
  const { data: products, error: productsErr } = await supabase
    .from("products")
    .select(
      "id, slug, title, short_desc, long_description, category, image_url, price, product_type, external_link, checkout_enabled, details, created_at"
    )
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (productsErr) throw productsErr;

  const productRows = products ?? [];
  const productListFields = [
    "id",
    "slug",
    "title",
    "short_desc",
    "category",
    "image_url",
    "price",
    "product_type",
    "checkout_enabled",
    "external_link",
  ];
  await writeJson("products/index.json", {
    generatedAt,
    count: productRows.length,
    items: productRows.map((p) => pick(p, productListFields)),
  });
  for (const p of productRows) {
    if (!p.slug) continue;
    await writeJson(`products/${p.slug}.json`, {
      generatedAt,
      ...pick(p, [...productListFields, "long_description", "details"]),
    });
  }
  // Convenience flat file for small catalogs / legacy consumers.
  await writeJson("products.json", {
    generatedAt,
    items: productRows.map((p) => pick(p, productListFields)),
  });

  /* ------------------------------ PROJECTS ------------------------------ */
  const { data: projects, error: projectsErr } = await supabase
    .from("projects")
    .select("id, slug, title, description, icon, project_type, status, sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (projectsErr) throw projectsErr;
  await writeJson("projects.json", { generatedAt, items: projects ?? [] });

  /* ------------------------------ COURSES ------------------------------- */
  const { data: courses, error: coursesErr } = await supabase
    .from("courses")
    .select("id, slug, title, description, image_url, level, duration, lessons, students, price")
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (coursesErr) throw coursesErr;
  await writeJson("courses.json", { generatedAt, items: courses ?? [] });

  /* ----------------------- CATEGORIES / AUTHORS ------------------------- */
  const uniq = (values) => [...new Set(values.filter(Boolean))].sort();
  await writeJson("categories.json", {
    generatedAt,
    articles: uniq(articleRows.map((a) => a.category)),
    products: uniq(productRows.map((p) => p.category)),
  });
  await writeJson("authors.json", {
    generatedAt,
    items: uniq(articleRows.map((a) => a.author)).map((name) => ({ name })),
  });

  /* ------------------------------ MANIFEST ------------------------------ */
  await writeJson("manifest.json", {
    generatedAt,
    counts: {
      articles: articleRows.length,
      products: productRows.length,
      projects: (projects ?? []).length,
      courses: (courses ?? []).length,
    },
  });

  console.log("[generate-content] Done.");
}

main().catch((err) => {
  console.error("[generate-content] Failed:", err.message || err);
  // Never break a production build because the content API hiccuped:
  // the previously published JSON in public/content stays valid.
  process.exit(0);
});
