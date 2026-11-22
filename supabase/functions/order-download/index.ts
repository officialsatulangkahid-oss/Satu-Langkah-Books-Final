import { credentials, PaymentError } from "../_shared/payment-domain.ts";
import { adminClient, applyMidtransStatus, checkDb, config, endpoint, getMidtransStatus, getOwnedOrder, limit, response } from "../_shared/payment-runtime.ts";
Deno.serve(endpoint(async (req, body) => {
  const cfg = config();
  const db = adminClient();
  await limit(db, req, "download", 15, 60);
  let order = await getOwnedOrder(db, body.orderId, credentials(body));
  if (order.payment_environment && order.payment_environment !== (cfg.sandbox ? "sandbox" : "production")) throw new PaymentError(409, "Lingkungan pesanan tidak sesuai");
  // Fail closed: a stored paid state alone cannot authorize a download after a refund.
  const verified = await getMidtransStatus(order.order_id);
  if (!verified) throw new PaymentError(503, "Pembayaran belum dapat diverifikasi");
  await applyMidtransStatus(db, order, verified);
  order = await getOwnedOrder(db, body.orderId, credentials(body));
  if (order.status !== "paid") throw new PaymentError(403, "Produk belum dapat diunduh");
  const { data: asset, error } = await db.from("payment_assets").select("bucket_id,object_path,drive_url").eq("product_type", order.product_type).eq("product_id", order.product_id).eq("active", true).maybeSingle();
  checkDb(error);
  if (!asset) throw new PaymentError(404, "Produk sedang disiapkan oleh admin");
  if (asset.drive_url) {
    const url = new URL(asset.drive_url);
    if (url.protocol !== "https:" || !["drive.google.com", "docs.google.com"].includes(url.hostname)) throw new PaymentError(503, "Link produk tidak valid");
    const { error: deliveredError } = await db.from("payment_fulfillments").update({ status: "delivered", updated_at: new Date().toISOString() }).eq("order_id", order.order_id).neq("status", "revoked");
    checkDb(deliveredError);
    return response({ url: asset.drive_url, external: true }, 200, req);
  }
  const { data: bucket, error: bucketError } = await db.storage.getBucket(asset.bucket_id);
  checkDb(bucketError);
  if (!bucket || bucket.public) throw new PaymentError(503, "Penyimpanan produk belum aman");
  const { data, error: signedError } = await db.storage.from(asset.bucket_id).createSignedUrl(asset.object_path, 60, { download: true });
  checkDb(signedError);
  if (!data?.signedUrl) throw new PaymentError(503, "Tautan unduhan belum tersedia");
  const { error: fulfillmentError } = await db.from("payment_fulfillments").update({ status: "delivered", updated_at: new Date().toISOString() }).eq("order_id", order.order_id).neq("status", "revoked");
  checkDb(fulfillmentError);
  return response({ url: data.signedUrl, expiresIn: 60 }, 200, req);
}));
