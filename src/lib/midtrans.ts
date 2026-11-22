import type { SnapPaymentPreferences } from "./paymentMethods";
import { supabase } from "@/integrations/supabase/client";

export async function paymentCall<T>(name: string, body: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    let message = "Layanan pembayaran belum dapat dihubungi. Silakan coba lagi.";
    try {
      if (error.context instanceof Response) {
        const result = await error.context.json();
        if (typeof result.error === "string") message = result.error;
      }
    } catch { /* Keep the safe fallback. */ }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data as T;
}

interface SnapOptions extends SnapPaymentPreferences {
  language?: "id" | "en";
  onSuccess?: () => void;
  onPending?: () => void;
  onError?: () => void;
  onClose?: () => void;
}
declare global { interface Window { snap?: { pay: (token: string, options: SnapOptions) => void } } }
let scriptPromise: Promise<void> | null = null;
let activeConfig: string | null = null;

export async function loadSnap(): Promise<void> {
  const cfg = await paymentCall<{ clientKey: string; snapUrl: string; isSandbox: boolean }>("get-midtrans-config");
  const expected = cfg.isSandbox ? "https://app.sandbox.midtrans.com/snap/snap.js" : "https://app.midtrans.com/snap/snap.js";
  if (!cfg.clientKey || cfg.snapUrl !== expected) throw new Error("Konfigurasi pembayaran tidak valid");
  const identity = `${cfg.snapUrl}:${cfg.clientKey}`;
  if (window.snap || scriptPromise) {
    if (activeConfig !== identity) throw new Error("Konfigurasi pembayaran berubah. Muat ulang halaman sebelum membayar.");
    return scriptPromise ?? Promise.resolve();
  }
  activeConfig = identity;
  scriptPromise = (async () => {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      const fail = () => { clearTimeout(timeout); script.remove(); reject(new Error("Gagal memuat pembayaran. Silakan coba lagi.")); };
      const timeout = window.setTimeout(fail, 15_000);
      script.src = cfg.snapUrl;
      script.dataset.clientKey = cfg.clientKey;
      script.async = true;
      script.onload = () => { clearTimeout(timeout); if (window.snap) resolve(); else fail(); };
      script.onerror = fail;
      document.head.appendChild(script);
    });
  })().catch((error) => { scriptPromise = null; activeConfig = null; throw error; });
  return scriptPromise;
}

export function openSnap(token: string, onFinish: () => void, preferences: SnapPaymentPreferences = {}) {
  if (!window.snap) throw new Error("Jendela pembayaran belum siap");
  let finished = false;
  const finish = () => { if (!finished) { finished = true; onFinish(); } };
  // Browser callbacks only navigate; they never mark an order paid.
  window.snap.pay(token, { ...preferences, language: "id", onSuccess: finish, onPending: finish, onError: finish, onClose: finish });
}
