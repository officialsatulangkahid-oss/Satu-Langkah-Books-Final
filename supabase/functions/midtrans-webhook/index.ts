import { PaymentError, validSignature } from "../_shared/payment-domain.ts";
import { adminClient, applyMidtransStatus, checkDb, config, endpoint, getMidtransStatus, response } from "../_shared/payment-runtime.ts";
Deno.serve(endpoint(async (req, body) => {
  const cfg = config();
  if (!await validSignature(body, cfg.serverKey)) throw new PaymentError(403, "Signature tidak valid");
  const db = adminClient();
  const { data: order, error } = await db.from("orders").select("*").eq("order_id", body.order_id).maybeSingle();
  checkDb(error);
  if (!order) throw new PaymentError(404, "Pesanan tidak ditemukan");
  if (order.payment_environment && order.payment_environment !== (cfg.sandbox ? "sandbox" : "production")) throw new PaymentError(409, "Lingkungan pesanan tidak sesuai");
  if (Number(body.gross_amount) !== order.amount) throw new PaymentError(409, "Nominal tidak sesuai");
  // The signature does not sign transaction_status/fraud_status. Always read the authoritative API.
  const verified = await getMidtransStatus(order.order_id);
  if (!verified) throw new PaymentError(503, "Status transaksi belum tersedia");
  await applyMidtransStatus(db, order, verified);
  return response({ success: true }, 200, req);
}, true));
