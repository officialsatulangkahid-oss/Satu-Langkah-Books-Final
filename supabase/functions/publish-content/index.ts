import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

/**
 * Publishes public content (articles, products, projects, courses) from the
 * database into `public.content_files` so the website can read pre-rendered
 * JSON instead of querying tables on every page view.
 *
 * Can be triggered by:
 * 1. Admin via Dashboard (Bearer JWT Token)
 * 2. Supabase Database Webhook (x-webhook-secret Header)
 */

const ADMIN_EMAIL = "officialsatulangkahid@gmail.com";

const pick = (row: Record<string, unknown>, keys: string[]) =>
  Object.fromEntries(keys.map((k) => [k, row[k] ?? null]));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // --- AUTHENTICATION CHECK ---------------------------------------------
    const authHeader = req.headers.get("Authorization") ?? "";
    const webhookSecretHeader = req.headers.get("x-webhook-secret");
    const expectedSecret = Deno.env.get("WEBHOOK_SECRET");

    // 1. Cek otentikasi via Webhook Secret Key
    const isWebhookAuthorized = Boolean(
      webhookSecretHeader && expectedSecret && webhookSecretHeader === expectedSecret
    );

    // 2. Cek otentikasi via Admin Login JWT
    let isAdminAuthorized = false;
    if (authHeader.startsWith("Bearer ")) {
      const userClient = createClient(url, anonKey, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      });
      const { data: userData } = await userClient.auth.getUser();
      if (userData?.user && userData.user.email === ADMIN_EMAIL) {
        isAdminAuthorized = true;
      }
    }

    // Tolak jika kedua jalur di atas tidak valid
    if (!isWebhookAuthorized && !isAdminAuthorized) {
      return json({ error: "Unauthorized: Invalid Secret or Admin Token" }, 401);
    }

    // --- PUBLISH PROCESS ---------------------------------------------------
    const db = createClient(url, serviceKey, { auth: { persistSession: false } });
    const generatedAt = new Date().toISOString();
    const files: { path: string; data: unknown }[] = [];
    const add = (path: string, data: unknown) => files.push({ path, data });

    /* ------------------------------ ARTICLES --------------------------- */
    const LIST_FIELDS = [
      "id", "slug", "title", "excerpt", "category", "read_time",
      "date", "image_url", "featured", "author",
    ];
    const { data: articles, error: aErr } = await db
      .from("articles")
      .select(
        "id, slug, title, excerpt, category, read_time, date, image_url, featured, author, content, created_at"
      )
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (aErr) throw aErr;
    const articleRows = articles ?? [];
    add("articles/index.json", {
      generatedAt,
      count: articleRows.length,
      items: articleRows.map((a) => pick(a, LIST_FIELDS)),
    });
    for (const a of articleRows) {
      if (!a.slug) continue;
      add(`articles/${a.slug}.json`, { generatedAt, ...pick(a, [...LIST_FIELDS, "content"]) });
    }

    /* ------------------------------ PRODUCTS --------------------------- */
    const productListFields = [
      "id", "slug", "title", "short_desc", "category", "image_url",
      "price", "product_type", "checkout_enabled", "external_link",
    ];
    const { data: products, error: pErr } = await db
      .from("products")
      .select(
        "id, slug, title, short_desc, long_description, category, image_url, price, product_type, external_link, checkout_enabled, details, created_at"
      )
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (pErr) throw pErr;
    const productRows = products ?? [];
    add("products/index.json", {
      generatedAt,
      count: productRows.length,
      items: productRows.map((p) => pick(p, productListFields)),
    });
    for (const p of productRows) {
      if (!p.slug) continue;
      add(`products/${p.slug}.json`, {
        generatedAt,
        ...pick(p, [...productListFields, "long_description", "details"]),
      });
    }
    add("products.json", { generatedAt, items: productRows.map((p) => pick(p, productListFields)) });

    /* ------------------------------ PROJECTS --------------------------- */
    const { data: projects, error: prErr } = await db
      .from("projects")
      .select("id, slug, title, description, icon, project_type, status, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (prErr) throw prErr;
    add("projects.json", { generatedAt, items: projects ?? [] });

    /* ------------------------------- COURSES --------------------------- */
    const { data: courses, error: cErr } = await db
      .from("courses")
      .select("id, slug, title, description, image_url, level, duration, lessons, students, price")
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (cErr) throw cErr;
    add("courses.json", { generatedAt, items: courses ?? [] });

    /* -------------------------- TAXONOMIES / MANIFEST ------------------- */
    const uniq = (values: (string | null)[]) =>
      [...new Set(values.filter(Boolean) as string[])].sort();
    add("categories.json", {
      generatedAt,
      articles: uniq(articleRows.map((a) => a.category)),
      products: uniq(productRows.map((p) => p.category)),
    });
    add("authors.json", {
      generatedAt,
      items: uniq(articleRows.map((name) => a.author)).map((name) => ({ name })),
    });
    add("manifest.json", {
      generatedAt,
      counts: {
        articles: articleRows.length,
        products: productRows.length,
        projects: (projects ?? []).length,
        courses: (courses ?? []).length,
      },
    });

    /* ------------------------------- PERSIST ---------------------------- */
    const rows = files.map((f) => ({ path: f.path, data: f.data, updated_at: generatedAt }));
    const { error: upErr } = await db.from("content_files").upsert(rows, { onConflict: "path" });
    if (upErr) throw upErr;

    // Remove stale entries (e.g. deleted or unpublished items).
    const keep = rows.map((r) => r.path);
    const { error: delErr } = await db
      .from("content_files")
      .delete()
      .not("path", "in", `(${keep.map((p) => `"${p}"`).join(",")})`);
    if (delErr) throw delErr;

    return json({ ok: true, generatedAt, published: rows.length });
  } catch (e) {
    console.error("[publish-content]", e);
    return json({ error: (e as Error).message ?? "Unknown error" }, 500);
  }
});