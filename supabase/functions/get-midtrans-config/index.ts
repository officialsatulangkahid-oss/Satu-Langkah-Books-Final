import { adminClient, config, endpoint, limit, response } from "../_shared/payment-runtime.ts";

Deno.serve(endpoint(async (req, body) => {
  const cfg = config();
  if (body.checkConnection === true) {
    if (!cfg.sandbox) return response({ error: "Diagnosis koneksi ini hanya untuk Sandbox" }, 403, req);
    await limit(adminClient(), req, "sandbox-connection-check", 3, 60);
    // Read-only lookup: no Snap token, order or payment is created.
    try {
      const result = await fetch(`${cfg.statusApi}/SL-CONNECTION-CHECK/status`, {
        headers: { Authorization: `Basic ${btoa(cfg.serverKey + ":")}`, Accept: "application/json" },
        signal: AbortSignal.timeout(12000),
      });
      const data = await result.json().catch(() => ({}));
      const code = String(data.status_code ?? result.status);
      const authenticated = result.status === 404 || (result.ok && code === "404");
      return response({ environment: "sandbox", httpStatus: result.status, providerStatus: code,
        serverAuthentication: authenticated ? "accepted" : result.status === 401 || code === "401" ? "rejected" : "inconclusive",
        explanation: authenticated ? "Server Key diterima; transaksi diagnosis memang tidak ada." : result.status === 401 || code === "401" ? "Midtrans menolak Server Key Sandbox yang tersimpan di Supabase." : "Periksa kode HTTP penyedia; tidak ada transaksi dibuat." }, 200, req);
    } catch {
      return response({ environment: "sandbox", serverAuthentication: "inconclusive", explanation: "Koneksi ke Midtrans gagal atau melewati batas waktu." }, 200, req);
    }
  }
  return response({ clientKey: cfg.clientKey, snapUrl: cfg.snapUrl, isSandbox: cfg.sandbox }, 200, req);
}));
