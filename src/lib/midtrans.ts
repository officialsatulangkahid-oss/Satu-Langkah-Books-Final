import { supabase } from "@/integrations/supabase/client";

let cachedConfig: { clientKey: string; snapUrl: string; isSandbox: boolean } | null = null;
let scriptPromise: Promise<void> | null = null;

declare global {
  interface Window {
    snap?: {
      pay: (token: string, opts: {
        onSuccess?: (r: any) => void;
        onPending?: (r: any) => void;
        onError?: (r: any) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

export async function getMidtransConfig() {
  if (cachedConfig) return cachedConfig;
  const { data, error } = await supabase.functions.invoke("get-midtrans-config");
  if (error) throw error;
  cachedConfig = data;
  return data as { clientKey: string; snapUrl: string; isSandbox: boolean };
}

export async function loadSnap() {
  if (typeof window === "undefined") return;
  if (window.snap) return;
  if (scriptPromise) return scriptPromise;

  const cfg = await getMidtransConfig();
  scriptPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = cfg.snapUrl;
    s.setAttribute("data-client-key", cfg.clientKey);
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Gagal memuat Midtrans Snap"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}