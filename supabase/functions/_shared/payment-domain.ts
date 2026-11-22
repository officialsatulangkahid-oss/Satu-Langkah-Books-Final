// Pure payment rules; shared with the offline regression tests.
export class PaymentError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

export type ProductType = "ebook" | "ecourse";
export type OrderStatus = "pending" | "paid" | "expired" | "cancelled" | "failed" | "refunded" | "partially_refunded";

export function text(value: unknown, max: number, label: string): string {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) {
    throw new PaymentError(400, `${label} tidak valid`);
  }
  return value.trim();
}

export function productInput(body: Record<string, unknown>) {
  if (body.productType !== "ebook" && body.productType !== "ecourse") throw new PaymentError(400, "Jenis produk tidak valid");
  const productId = text(body.productId, 100, "Produk");
  if (!/^[a-zA-Z0-9_-]+$/.test(productId)) throw new PaymentError(400, "Produk tidak valid");
  const voucherCode = body.voucherCode ? text(body.voucherCode, 40, "Voucher").toUpperCase() : null;
  return { productType: body.productType as ProductType, productId, voucherCode };
}

export function customerInput(body: Record<string, unknown>) {
  const name = text(body.customerName, 100, "Nama");
  const email = text(body.customerEmail, 254, "Email").toLowerCase();
  const phone = body.customerPhone ? text(body.customerPhone, 20, "Nomor WhatsApp") : null;
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || (phone && !/^[+\d][\d\s-]{7,19}$/.test(phone))) {
    throw new PaymentError(400, "Data pembeli tidak valid");
  }
  return { name, email, phone };
}

export function credentials(body: Record<string, unknown>) {
  const accessToken = text(body.accessToken, 64, "Token akses");
  if (!/^[a-f0-9]{64}$/.test(accessToken)) throw new PaymentError(400, "Token akses tidak valid");
  return accessToken;
}

export function priceAfterDiscount(price: number, voucher: { kind: string; value: number } | null) {
  if (!Number.isSafeInteger(price) || price < 1 || price > 1_000_000_000) throw new PaymentError(409, "Harga produk belum tersedia");
  let discount = 0;
  if (voucher) {
    if (!Number.isSafeInteger(voucher.value) || voucher.value <= 0 || !["percent", "fixed"].includes(voucher.kind) || (voucher.kind === "percent" && voucher.value > 100)) {
      throw new PaymentError(409, "Konfigurasi voucher tidak valid");
    }
    discount = voucher.kind === "percent" ? Math.round(price * voucher.value / 100) : voucher.value;
  }
  const amount = price - discount;
  if (amount < 1) throw new PaymentError(400, "Voucher tidak dapat digunakan untuk produk ini");
  return { subtotal: price, discount, amount };
}

export function verifiedStatus(data: Record<string, unknown>): OrderStatus | null {
  if (data.currency !== "IDR") throw new PaymentError(409, "Mata uang pembayaran tidak sesuai");
  const state = data.transaction_status;
  if (state === "settlement" || state === "capture") {
    return data.status_code === "200" && (!data.fraud_status || data.fraud_status === "accept") ? "paid" : null;
  }
  if (state === "expire") return "expired";
  if (state === "cancel" || state === "deny") return "cancelled";
  if (state === "failure") return "failed";
  if (state === "refund") return "refunded";
  if (state === "partial_refund") return "partially_refunded";
  if (state === "pending") return "pending";
  return null;
}

export async function sha256(value: string) { return digest("SHA-256", value); }
export async function digest(algorithm: string, value: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest(algorithm, new TextEncoder().encode(value))))
    .map((n) => n.toString(16).padStart(2, "0")).join("");
}

export function constantEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}

export async function validSignature(data: Record<string, unknown>, serverKey: string) {
  if (!["order_id", "status_code", "gross_amount", "signature_key"].every((key) => typeof data[key] === "string")) return false;
  if (!/^[a-f0-9]{128}$/i.test(data.signature_key as string)) return false;
  const expected = await digest("SHA-512", `${data.order_id}${data.status_code}${data.gross_amount}${serverKey}`);
  return constantEqual(expected, (data.signature_key as string).toLowerCase());
}

export function midtransEnvironment(mode: string, serverKey: string, clientKey: string) {
  if (!["sandbox", "production"].includes(mode) || !serverKey || !clientKey) throw new PaymentError(503, "Pembayaran belum dikonfigurasi");
  const sandbox = mode === "sandbox";
  if (serverKey.startsWith("SB-") !== sandbox || clientKey.startsWith("SB-") !== sandbox) throw new PaymentError(503, "Konfigurasi lingkungan pembayaran tidak cocok");
  const suffix = sandbox ? ".sandbox" : "";
  return { sandbox, snapUrl: `https://app${suffix}.midtrans.com/snap/snap.js`, snapApi: `https://app${suffix}.midtrans.com/snap/v1/transactions`, statusApi: `https://api${suffix}.midtrans.com/v2` };
}
