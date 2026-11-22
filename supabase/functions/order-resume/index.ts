import { credentials, PaymentError } from "../_shared/payment-domain.ts";
import { adminClient, applyMidtransStatus, config, endpoint, getMidtransStatus, getOwnedOrder, limit, response } from "../_shared/payment-runtime.ts";
Deno.serve(endpoint(async (req, body) => {
  const cfg = config();
  const db = adminClient();
  await limit(db, req, "resume", 20, 60);
  let order = await getOwnedOrder(db, body.orderId, credentials(body));
  if (order.payment_environment && order.payment_environment !== (cfg.sandbox ? "sandbox" : "production")) throw new PaymentError(409, "Lingkungan pesanan tidak sesuai");
  const verified = await getMidtransStatus(order.order_id);
  if (verified) await applyMidtransStatus(db, order, verified);
  order = await getOwnedOrder(db, body.orderId, credentials(body));
  if (order.status !== "pending" || order.creation_state !== "ready" || !order.midtrans_token) throw new PaymentError(409, "Pesanan tidak dapat dilanjutkan. Periksa status pembayaran.");
  return response({ token: order.midtrans_token }, 200, req);
}));
