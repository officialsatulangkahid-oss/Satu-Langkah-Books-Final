/**
 * Static public-content layer.
 *
 * Public pages read pre-published JSON served by the CDN (see
 * `scripts/generate-content.mjs`) instead of querying the database on every
 * page view. The database remains the source of truth; only the *delivery*
 * path changed.
 *
 * Dynamic/user-specific data (auth, orders, admin, checkout) keeps using the
 * Supabase client directly — do not route those through here.
 */

const CONTENT_BASE = "/content";

/** In-memory cache so the same JSON isn't re-fetched during a session. */
const cache = new Map<string, Promise<unknown>>();

/**
 * Published copies live in `content_files` (written by the `publish-content`
 * function each time an admin saves). If that lookup fails we fall back to the
 * static JSON shipped with the build, so pages never render empty.
 */
async function fetchPublished<T>(file: string): Promise<T | null> {
  const { supabase } = await import("@/integrations/supabase/client");
  const { data, error } = await supabase
    .from("content_files")
    .select("data")
    .eq("path", file)
    .maybeSingle();
  if (error || !data) return null;
  return data.data as T;
}

/** Drops the session cache so freshly published content is re-read. */
export function clearContentCache() {
  cache.clear();
}

async function getJson<T>(file: string): Promise<T | null> {
  if (!cache.has(file)) {
    const promise = fetchPublished<T>(file)
      .catch(() => null)
      .then((published) =>
        published ??
        fetch(`${CONTENT_BASE}/${file}`, { cache: "force-cache" })
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null)
      );
    cache.set(file, promise);
  }
  return (await cache.get(file)) as T | null;
}


/* ------------------------------- types -------------------------------- */

export interface ContentArticleListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  read_time: string | null;
  date: string | null;
  image_url: string | null;
  featured: boolean | null;
  author: string | null;
}

export interface ContentArticle extends ContentArticleListItem {
  content: unknown;
}

export interface ContentProductListItem {
  id: string;
  slug: string;
  title: string;
  short_desc: string | null;
  category: string | null;
  image_url: string | null;
  price: number | null;
  product_type: string | null;
  checkout_enabled: boolean | null;
  external_link: string | null;
}

export interface ContentProduct extends ContentProductListItem {
  long_description: unknown;
  details: unknown;
}

export interface ContentProject {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  project_type: string | null;
  status: string | null;
  sort_order: number | null;
}

export interface ContentCourse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string | null;
  level: string | null;
  duration: string | null;
  lessons: number | null;
  students: number | null;
  price: number | null;
}

type Listed<T> = { items: T[] } | null;

/* ------------------------------ articles ------------------------------ */

export async function getArticles(): Promise<ContentArticleListItem[]> {
  const data = await getJson<Listed<ContentArticleListItem>>("articles/index.json");
  return data?.items ?? [];
}

export async function getArticle(slugOrId: string): Promise<ContentArticle | null> {
  const direct = await getJson<ContentArticle>(`articles/${encodeURIComponent(slugOrId)}.json`);
  if (direct?.title) return direct;

  // Legacy links use the row id — resolve it through the lightweight index.
  const list = await getArticles();
  const match = list.find((a) => a.id === slugOrId);
  if (!match?.slug) return null;
  return await getJson<ContentArticle>(`articles/${encodeURIComponent(match.slug)}.json`);
}

/* ------------------------------ products ------------------------------ */

export async function getProducts(): Promise<ContentProductListItem[]> {
  const data = await getJson<Listed<ContentProductListItem>>("products/index.json");
  return data?.items ?? [];
}

export async function getProduct(slug: string): Promise<ContentProduct | null> {
  return await getJson<ContentProduct>(`products/${encodeURIComponent(slug)}.json`);
}

/* -------------------------- projects & courses ------------------------ */

export async function getProjects(): Promise<ContentProject[]> {
  const data = await getJson<Listed<ContentProject>>("projects.json");
  return data?.items ?? [];
}

export async function getCourses(): Promise<ContentCourse[]> {
  const data = await getJson<Listed<ContentCourse>>("courses.json");
  return data?.items ?? [];
}

/* ----------------------------- taxonomies ----------------------------- */

export async function getCategories(): Promise<{ articles: string[]; products: string[] }> {
  const data = await getJson<{ articles?: string[]; products?: string[] }>("categories.json");
  return { articles: data?.articles ?? [], products: data?.products ?? [] };
}
