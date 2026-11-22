import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { PaymentError, constantEqual, midtransEnvironment, priceAfterDiscount, sha256, verifiedStatus, type ProductType } from "./payment-domain.ts";

export function adminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new PaymentError(503, "Layanan pesanan belum tersedia");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
export type Admin = ReturnType<typeof adminClient>;

export function config() {
  const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY") ?? "";
  const clientKey = Deno.env.get("MIDTRANS_CLIENT_KEY") ?? "";
  const environment = midtransEnvironment(Deno.env.get("MIDTRANS_ENVIRONMENT") ?? "", serverKey, clientKey);
  const rawUrl = Deno.env.get("FRONTEND_URL") ?? "";
  let url: URL;
  try { url = new URL(rawUrl); } catch { throw new PaymentError(503, "Domain pembayaran belum dikonfigurasi"); }
  if ((url.protocol !== "https:" && !(environment.sandbox && url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new PaymentError(503, "Domain pembayaran tidak valid");
  }
  return { ...environment, serverKey, clientKey, frontendUrl: url.origin };
}

function allowedOrigins() {
  return (Deno.env.get("ALLOWED_ORIGINS") ?? Deno.env.get("FRONTEND_URL") ?? "").split(",").map((origin) => origin.trim().replace(/\/$/, "")).filter(Boolean);
}

export function response(data: unknown, status = 200, req?: Request) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json", "Cache-Control": "no-store", "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  const origin = req?.headers.get("origin");
  if (origin && allowedOrigins().includes(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return new Response(JSON.stringify(data), { status, headers });
}

// CORS limits browser origins. It is not used as authentication.
export function endpoint(handler: (req: Request, body: Record<string, unknown>) => Promise<Response>, webhook = false) {
  return async (req: Request) => {
    try {
      if (req.method === "OPTIONS") return response({}, 200, req);
      if (req.method !== "POST") throw new PaymentError(405, "Metode tidak didukung");
      const origin = req.headers.get("origin");
      if (!webhook && origin && !allowedOrigins().includes(origin)) throw new PaymentError(403, "Domain tidak diizinkan");
      if (!req.headers.get("content-type")?.includes("application/json")) throw new PaymentError(415, "Gunakan JSON");
      const reader = req.body?.getReader();
      if (!reader) throw new PaymentError(400, "Request kosong");
      const chunks: Uint8Array[] = [];
      let length = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > 16_384) { await reader.cancel(); throw new PaymentError(413, "Request terlalu besar"); }
        chunks.push(value);
      }
      const bytes = new Uint8Array(length);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      let body;
      try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new PaymentError(400, "JSON tidak valid"); }
      if (!body || Array.isArray(body) || typeof body !== "object") throw new PaymentError(400, "Request tidak valid");
      return await handler(req, body);
    } catch (error) {
      const known = error instanceof PaymentError;
      if (!known) console.error("Payment operation failed", error instanceof Error ? error.name : "UnknownError");
      return response({ error: known ? error.message : "Layanan pembayaran sedang bermasalah. Silakan coba lagi." }, known ? error.status : 500, req);
    }
  };
}

export function checkDb(error: unknown) { if (error) throw new PaymentError(503, "Penyimpanan pesanan sedang bermasalah"); }

export async function limit(db: Admin, req: Request, scope: string, count: number, seconds: number, identity?: string) {
  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = await sha256(`${Deno.env.get("MIDTRANS_SERVER_KEY")}:${scope}:${identity ?? ip}`);
  const { data, error } = await db.rpc("payment_take_rate_limit", { p_key: key, p_limit: count, p_seconds: seconds });
  checkDb(error);
  if (!data) throw new PaymentError(429, "Terlalu banyak percobaan. Tunggu beberapa menit.");
}

export async function quote(db: Admin, input: { productType: ProductType; productId: string; voucherCode: string | null }) {
  const isCourse = input.productType === "ecourse";
  let query = db.from(isCourse ? "courses" : "products").select(isCourse ? "id,slug,title,price,image_url,description" : "id,slug,title,price,image_url,short_desc,product_type,checkout_enabled").eq("active", true);
  query = /^[a-f0-9]{8}-[a-f0-9-]{27}$/i.test(input.productId) ? query.eq("id", input.productId) : query.eq("slug", input.productId);
  const { data, error } = await query.maybeSingle();
  checkDb(error);
  if (!data) throw new PaymentError(404, "Produk belum tersedia untuk pembayaran");
  const product = data as unknown as { id: string; slug: string; title: string; price: number; image_url: string | null; description?: string; short_desc?: string; product_type?: string; checkout_enabled?: boolean };
  if (!isCourse && (!product.checkout_enabled || product.product_type !== "ebook")) throw new PaymentError(409, "Checkout produk belum diaktifkan");
  let voucher: { kind: string; value: number } | null = null;
  if (input.voucherCode) {
    const { data: row, error: voucherError } = await db.from("payment_vouchers").select("kind,value,starts_at,expires_at,product_type,product_slug").eq("code", input.voucherCode).eq("active", true).maybeSingle();
    checkDb(voucherError);
    const now = Date.now();
    if (!row || (row.starts_at && Date.parse(row.starts_at) > now) || (row.expires_at && Date.parse(row.expires_at) <= now) || (row.product_type && row.product_type !== input.productType) || (row.product_slug && row.product_slug !== product.slug)) throw new PaymentError(400, "Voucher tidak berlaku untuk produk ini");
    voucher = row;
  }
  return { product: { id: product.id, slug: product.slug, name: product.title, type: input.productType, image: product.image_url, shortDesc: product.short_desc ?? product.description ?? "" }, voucherCode: input.voucherCode, ...priceAfterDiscount(product.price, voucher) };
}

export async function getOwnedOrder(db: Admin, orderId: unknown, token: string) {
  if (typeof orderId !== "string" || !/^SL-[A-Za-z0-9-]{8,96}$/.test(orderId)) throw new PaymentError(404, "Pesanan tidak ditemukan atau akses tidak valid");
  const { data: order, error } = await db.from("orders").select("*").eq("order_id", orderId).maybeSingle();
  checkDb(error);
  if (!order || !order.access_token_hash || !constantEqual(await sha256(token), order.access_token_hash)) throw new PaymentError(404, "Pesanan tidak ditemukan atau akses tidak valid");
  return order;
}

export async function getMidtransStatus(orderId: string) {
  const cfg = config();
  const res = await fetch(`${cfg.statusApi}/${encodeURIComponent(orderId)}/status`, { headers: { Authorization: `Basic ${btoa(cfg.serverKey + ":")}`, Accept: "application/json" }, signal: AbortSignal.timeout(12_000) });
  if (res.status === 404) return null; // A Snap token may have no selected payment method yet.
  if (!res.ok) throw new PaymentError(502, "Status Midtrans belum dapat diperiksa");
  const data = await res.json();
  if (data.status_code === "404") return null;
  if (data.order_id !== orderId || !Number.isFinite(Number(data.gross_amount))) throw new PaymentError(502, "Respons Midtrans tidak sesuai");
  return data as Record<string, unknown>;
}

export async function applyMidtransStatus(db: Admin, order: Record<string, unknown>, verified: Record<string, unknown>) {
  if (verified.order_id !== order.order_id || Number(verified.gross_amount) !== order.amount) throw new PaymentError(409, "Nominal pembayaran tidak sesuai");
  const status = verifiedStatus(verified);
  if (!status) return;
  const { error } = await db.rpc("payment_apply_verified_status", {
    p_order_id: order.order_id, p_status: status, p_amount: Number(verified.gross_amount),
    p_payment_method: typeof verified.payment_type === "string" ? verified.payment_type : null,
    p_transaction_status: verified.transaction_status,
    p_transaction_id: typeof verified.transaction_id === "string" ? verified.transaction_id : null,
  });
  checkDb(error);
}
