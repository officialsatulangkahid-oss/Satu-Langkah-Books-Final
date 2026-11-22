import { paymentCall } from "./midtrans";

export interface PaymentQuote {
  environment: string;
  product: { id: string; slug: string; name: string; type: "ebook" | "ecourse"; image: string | null; shortDesc: string };
  subtotal: number; discount: number; amount: number; voucherCode: string | null;
}
export interface PaymentStatus {
  orderId: string; productName: string; productId: string; productType: "ebook" | "ecourse"; amount: number;
  status: "pending" | "paid" | "expired" | "cancelled" | "failed" | "refunded" | "partially_refunded";
  creationState: string; paidAt: string | null; canResume: boolean; downloadAvailable: boolean; reconciliationPending: boolean;
}
export interface AccessReceipt { version: 1; orderId: string; accessToken: string }
interface Attempt { requestId: string; accessToken: string; orderId?: string }
const prefix = "satu-payment:";

export const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

function write(key: string, value: unknown) {
  try { localStorage.setItem(prefix + key, JSON.stringify(value)); }
  catch { throw new Error("Izinkan penyimpanan browser agar akses pesanan dapat disimpan sebelum membayar."); }
}
function read<T>(key: string): T | null {
  try { const stored = localStorage.getItem(prefix + key); return stored ? JSON.parse(stored) : null; } catch { return null; }
}
export function accessFor(orderId: string) { return read<AccessReceipt>(`order:${orderId}`); }
export function saveAccess(receipt: AccessReceipt) {
  if (receipt.version !== 1 || !/^SL-[A-Za-z0-9-]{8,96}$/.test(receipt.orderId) || !/^[a-f0-9]{64}$/.test(receipt.accessToken)) throw new Error("File akses pesanan tidak valid");
  write(`order:${receipt.orderId}`, receipt);
}
export function downloadJson(name: string, data: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function createPayment(quote: PaymentQuote, customer: { name: string; email: string; phone: string }) {
  const body = { environment: quote.environment, productType: quote.product.type, productId: quote.product.slug, voucherCode: quote.voucherCode,
    customerName: customer.name.trim(), customerEmail: customer.email.trim().toLowerCase(), customerPhone: customer.phone.trim() };
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(body)));
  const fingerprint = Array.from(new Uint8Array(digest)).map((n) => n.toString(16).padStart(2, "0")).join("");
  let attempt = read<Attempt>(`attempt:${fingerprint}`);
  if (!attempt) {
    attempt = { requestId: crypto.randomUUID(), accessToken: Array.from(crypto.getRandomValues(new Uint8Array(32))).map((n) => n.toString(16).padStart(2, "0")).join("") };
  }
  // Persist before the network request, including retries after a lost response.
  write(`attempt:${fingerprint}`, attempt);
  const result = await paymentCall<{ orderId: string; token: string | null; amount: number; status: string; creationState: string }>("create-transaction", { ...body, ...attempt, expectedAmount: quote.amount });
  saveAccess({ version: 1, orderId: result.orderId, accessToken: attempt.accessToken });
  write(`attempt:${fingerprint}`, { ...attempt, orderId: result.orderId });
  return result;
}
export function orderBody(orderId: string) {
  const receipt = accessFor(orderId);
  if (!receipt) throw new Error("Akses pesanan tidak tersedia di browser ini. Pulihkan file akses pesanan atau hubungi admin.");
  return { orderId, accessToken: receipt.accessToken };
}

export function allowNewPurchase(orderId: string) {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix + "attempt:")) keys.push(key);
  }
  for (const key of keys) {
    try { if (JSON.parse(localStorage.getItem(key) ?? "{}").orderId === orderId) localStorage.removeItem(key); } catch { /* Keep unrelated data. */ }
  }
}
