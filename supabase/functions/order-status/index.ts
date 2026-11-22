import { credentials, PaymentError } from "../_shared/payment-domain.ts";
import { adminClient, applyMidtransStatus, checkDb, config, endpoint, getMidtransStatus, getOwnedOrder, limit, response } from "../_shared/payment-runtime.ts";
Deno.serve(endpoint(async (req, body) => {
  const cfg = config();
  const db = adminClient();
  await limit(db, req, "status", 120, 60);
  let order = await getOwnedOrder(db, body.orderId, credentials(body));
  if (order.payment_environment && order.payment_environment !== (cfg.sandbox ? "sandbox" : "production")) throw new PaymentError(409, "Lingkungan pesanan tidak sesuai");
  let reconciliationPending = false;
  const last = order.last_reconciled_at ? Date.parse(order.last_reconciled_at) : 0;
  // Recheck even paid orders on visits so a missed refund webhook can revoke delivery.
  if (Date.now() - last > 15_000) {
    try {
      const verified = await getMidtransStatus(order.order_id);
      if (verified) await applyMidtransStatus(db, order, verified);
      else {
        const { error } = await db.from("orders").update({ last_reconciled_at: new Date().toISOString() }).eq("order_id", order.order_id);
        checkDb(error);
      }
      order = await getOwnedOrder(db, body.orderId, credentials(body));
    } catch { reconciliationPending = true; }
  }
  const { data: asset, error: assetError } = await db.from("payment_assets").select("product_id").eq("product_type", order.product_type).eq("product_id", order.product_id).eq("active", true).maybeSingle();
  checkDb(assetError);
  return response({ orderId: order.order_id, productName: order.product_name, productId: order.product_id, productType: order.product_type, amount: order.amount, status: order.status === "paid" && !order.payment_verified_at ? "pending" : order.status, creationState: order.creation_state, paidAt: order.paid_at, canResume: order.status === "pending" && order.creation_state === "ready", downloadAvailable: order.status === "paid" && !!order.payment_verified_at && !!asset, reconciliationPending }, 200, req);
}));
