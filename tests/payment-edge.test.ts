import assert from "node:assert/strict";
import { setClient } from "./mock-supabase.ts";
import { digest, sha256 } from "../supabase/functions/_shared/payment-domain.ts";

// Capture the real handlers without opening a server. No network or real keys.
type Handler = (req: Request) => Promise<Response>;
let captured: Handler;
Object.defineProperty(Deno, "serve", { value: (handler: Handler) => { captured = handler; return {}; }, configurable: true });
const handlers: Record<string, Handler> = {};
for (const name of ["create-transaction", "midtrans-webhook", "order-status", "order-resume", "order-download", "admin-payment-assets"]) {
  await import(`../supabase/functions/${name}/index.ts`);
  handlers[name] = captured!;
}
for (const [key, value] of Object.entries({ MIDTRANS_ENVIRONMENT: "sandbox", MIDTRANS_SERVER_KEY: "SB-server-test", MIDTRANS_CLIENT_KEY: "SB-client-test", FRONTEND_URL: "https://shop.example.test", SUPABASE_URL: "https://project.example.test", SUPABASE_SERVICE_ROLE_KEY: "test-only" })) Deno.env.set(key, value);

// deno-lint-ignore no-explicit-any
type Row = Record<string, any>;
let tables: Record<string, Row[]>;
let apiState: Row;
let tokenPosts = 0;
let statusGets = 0;
let applied = 0;
let downloads = 0;
let failCreate = false;
let failSave = false;
let isAdmin = false;
const productId = "22222222-2222-4222-8222-222222222222";
const token = "a".repeat(64);
const requestId = "11111111-1111-4111-8111-111111111111";

class Query {
  filters: ((row: Row) => boolean)[] = [];
  changes: Row | null = null;
  constructor(public table: string) {}
  select(_fields?: string) { return this; }
  eq(key: string, value: unknown) { this.filters.push((row) => row[key] === value); return this; }
  neq(key: string, value: unknown) { this.filters.push((row) => row[key] !== value); return this; }
  update(changes: Row) { this.changes = changes; return this; }
  order() { return this; }
  result() {
    if (failSave && this.changes?.creation_state === "ready") return { data: null, error: new Error("db unavailable") };
    const rows = (tables[this.table] ?? []).filter((row) => this.filters.every((fn) => fn(row)));
    if (this.changes) rows.forEach((row) => Object.assign(row, this.changes));
    return { data: rows, error: null };
  }
  async maybeSingle() { const result = this.result(); return { ...result, data: result.data?.[0] ?? null }; }
  then(resolve: (value: unknown) => unknown) { return Promise.resolve(this.result()).then(resolve); }
}
const db = {
  from: (table: string) => new Query(table),
  auth: { getUser: async (bearer: string) => ({ data: { user: bearer === "admin-session" ? { id: "admin-user" } : null }, error: null }) },
  storage: {
    getBucket: async () => ({ data: { public: false }, error: null }),
    from: () => ({ createSignedUrl: async () => { downloads++; return { data: { signedUrl: "https://project.example.test/private-signed-file" }, error: null }; } }),
  },
  rpc: async (name: string, args: Row) => {
    if (name === "payment_take_rate_limit") return { data: true, error: null };
    if (name === "payment_reserve_order") {
      const existing = tables.orders.find((order) => order.checkout_request_id === args.p_request_id);
      if (existing) return { data: { fresh: false, order: existing }, error: null };
      const order = { order_id: args.p_order_id, checkout_request_id: args.p_request_id, access_token_hash: args.p_access_hash, request_hash: args.p_request_hash, amount: args.p_amount, product_type: args.p_type, product_id: args.p_product_id, product_name: args.p_product_name, status: "pending", creation_state: "creating", payment_environment: args.p_environment };
      tables.orders.push(order);
      return { data: { fresh: true, order }, error: null };
    }
    if (name === "payment_apply_verified_status") {
      applied++;
      const order = tables.orders.find((order) => order.order_id === args.p_order_id)!;
      if (args.p_amount !== order.amount) return { error: new Error("amount mismatch") };
      order.status = args.p_status; order.payment_verified_at = new Date().toISOString(); order.last_reconciled_at = new Date().toISOString();
      return { error: null };
    }
    throw new Error("Unexpected RPC " + name);
  },
};
function reset() {
  tables = { products: [{ id: productId, slug: "journal", title: "Journal", price: 75000, active: true, checkout_enabled: true, product_type: "ebook" }], orders: [], payment_assets: [], user_roles: [] };
  tokenPosts = 0; statusGets = 0; applied = 0; downloads = 0; failCreate = false; failSave = false; isAdmin = false;
  apiState = { currency: "IDR", status_code: "201", transaction_status: "pending", gross_amount: "75000.00", transaction_id: "tx-one", payment_type: "bank_transfer" };
  setClient(db);
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes("/snap/v1/transactions")) {
      tokenPosts++;
      if (failCreate) throw new TypeError("network timeout");
      return Response.json({ token: "snap-token", redirect_url: "https://app.sandbox.midtrans.com/snap/v2/token" });
    }
    if (url.includes("/status")) { statusGets++; return Response.json({ ...apiState, order_id: tables.orders[0]?.order_id }); }
    throw new Error("Unexpected network access: " + url);
  };
}
const body = () => ({ productType: "ebook", productId: "journal", customerName: "Buyer", customerEmail: "buyer@example.test", customerPhone: "08123456789", expectedAmount: 75000, amount: 1, requestId, accessToken: token });
async function call(name: string, data: Row, headers: Record<string, string> = {}) {
  const response = await handlers[name](new Request("https://project.example.test/functions/v1/" + name, { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://shop.example.test", ...headers }, body: JSON.stringify(data) }));
  return { status: response.status, body: await response.json() };
}
async function seed() {
  const result = await call("create-transaction", body());
  assert.equal(result.status, 200);
  return { orderId: result.body.orderId, accessToken: token };
}

Deno.test("create uses database price, reuses request and rejects altered request/price", async () => {
  reset(); const order = await seed();
  assert.equal(tables.orders[0].amount, 75000);
  const retry = await call("create-transaction", body());
  assert.equal(retry.body.orderId, order.orderId); assert.equal(retry.body.token, "snap-token"); assert.equal(tokenPosts, 1);
  assert.equal((await call("create-transaction", { ...body(), accessToken: "b".repeat(64) })).status, 409);
  reset(); assert.equal((await call("create-transaction", { ...body(), expectedAmount: 1 })).status, 409); assert.equal(tokenPosts, 0);
});
Deno.test("ambiguous network and token-save failures never issue a second Snap POST", async () => {
  reset(); failCreate = true; const result = await call("create-transaction", body());
  assert.equal(result.body.creationState, "uncertain");
  await call("create-transaction", body()); assert.equal(tokenPosts, 1);
  reset(); failSave = true; const failedSave = await call("create-transaction", body());
  assert.equal(failedSave.body.token, null); await call("create-transaction", body()); assert.equal(tokenPosts, 1);
});
Deno.test("forged signature rejected; valid signature never trusts forged success status", async () => {
  reset(); await seed();
  const notification = { order_id: tables.orders[0].order_id, gross_amount: "75000.00", status_code: "200", transaction_status: "settlement", fraud_status: "accept" };
  assert.equal((await call("midtrans-webhook", { ...notification, signature_key: "b".repeat(128) })).status, 403); assert.equal(statusGets, 0);
  const signature_key = await digest("SHA-512", `${notification.order_id}20075000.00SB-server-test`);
  assert.equal((await call("midtrans-webhook", { ...notification, signature_key })).status, 200);
  assert.equal(tables.orders[0].status, "pending"); assert.equal(statusGets, 1);
  apiState = { ...apiState, status_code: "200", transaction_status: "settlement", fraud_status: "accept" };
  await call("midtrans-webhook", { ...notification, signature_key }); assert.equal(tables.orders[0].status, "paid");
});
Deno.test("status requires private token and exposes no PII/token/hash", async () => {
  reset(); const access = await seed();
  assert.equal((await call("order-status", { ...access, accessToken: "b".repeat(64) })).status, 404);
  const result = await call("order-status", access);
  assert.equal(result.status, 200); assert.equal(result.body.status, "pending");
  for (const key of ["customer_email", "access_token_hash", "midtrans_token", "token"]) assert.equal(key in result.body, false);
});
Deno.test("refund prevents signed download; paid order gets Drive link only with token", async () => {
  reset(); const access = await seed();
  tables.payment_assets.push({ product_id: productId, product_type: "ebook", active: true, drive_url: "https://drive.google.com/file/d/test/view" });
  apiState = { ...apiState, status_code: "200", transaction_status: "refund" };
  assert.equal((await call("order-download", access)).status, 403); assert.equal(downloads, 0);
  reset(); const paidAccess = await seed();
  tables.payment_assets.push({ product_id: productId, product_type: "ebook", active: true, drive_url: "https://drive.google.com/file/d/test/view" });
  apiState = { ...apiState, status_code: "200", transaction_status: "settlement", fraud_status: "accept" };
  assert.equal((await call("order-download", { ...paidAccess, accessToken: "b".repeat(64) })).status, 404);
  const result = await call("order-download", paidAccess); assert.equal(result.status, 200); assert.equal(result.body.external, true);
});
Deno.test("admin endpoint checks actual session AND admin role", async () => {
  reset();
  assert.equal((await call("admin-payment-assets", { action: "list" })).status, 401);
  assert.equal((await call("admin-payment-assets", { action: "list" }, { Authorization: "Bearer admin-session" })).status, 403);
  tables.user_roles.push({ user_id: "admin-user", role: "admin" });
  assert.equal((await call("admin-payment-assets", { action: "list" }, { Authorization: "Bearer admin-session" })).status, 200);
});
Deno.test("endpoint rejects unapproved origins and oversized/malformed input", async () => {
  reset();
  assert.equal((await call("create-transaction", body(), { Origin: "https://attacker.example.test" })).status, 403);
  assert.equal((await call("create-transaction", { ...body(), extra: "a".repeat(17000) })).status, 413);
  assert.equal((await call("create-transaction", { ...body(), customerEmail: "not-email" })).status, 400);
});
Deno.test("private storage download is issued only after verified payment; paid order cannot resume", async () => {
  reset(); const access = await seed();
  tables.payment_assets.push({ product_id: productId, product_type: "ebook", active: true, bucket_id: "paid-products", object_path: "private/book.pdf" });
  assert.equal((await call("order-download", access)).status, 403); assert.equal(downloads, 0);
  apiState = { ...apiState, status_code: "200", transaction_status: "settlement", fraud_status: "accept" };
  const result = await call("order-download", access); assert.equal(result.status, 200); assert.equal(downloads, 1);
  assert.equal((await call("order-resume", access)).status, 409);
});
Deno.test("webhook amount mismatch and API currency mismatch cannot mark paid", async () => {
  reset(); await seed();
  const order_id = tables.orders[0].order_id;
  const signature_key = await digest("SHA-512", `${order_id}2001.00SB-server-test`);
  assert.equal((await call("midtrans-webhook", { order_id, status_code: "200", gross_amount: "1.00", signature_key })).status, 409);
  apiState = { ...apiState, status_code: "200", transaction_status: "settlement", currency: "USD" };
  const validSignature = await digest("SHA-512", `${order_id}20075000.00SB-server-test`);
  assert.equal((await call("midtrans-webhook", { order_id, status_code: "200", gross_amount: "75000.00", signature_key: validSignature })).status, 409);
  assert.equal(tables.orders[0].status, "pending");
});
