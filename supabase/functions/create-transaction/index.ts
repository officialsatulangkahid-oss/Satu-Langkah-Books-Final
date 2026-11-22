import { PaymentError, constantEqual, credentials, customerInput, productInput, sha256 } from "../_shared/payment-domain.ts";
import { adminClient, checkDb, config, endpoint, limit, quote, response } from "../_shared/payment-runtime.ts";

Deno.serve(endpoint(async (req, body) => {
  const cfg = config();
  const db = adminClient();
  const input = productInput(body);
  const customer = customerInput(body);
  const accessToken = credentials(body);
  if (typeof body.requestId !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(body.requestId)) throw new PaymentError(400, "Identitas checkout tidak valid");
  const accessHash = await sha256(accessToken);
  const requestHash = await sha256(JSON.stringify({ ...input, ...customer, environment: cfg.sandbox ? "sandbox" : "production" }));
  await limit(db, req, "create", 30, 600);

  const { data: existing, error: existingError } = await db.from("orders").select("*").eq("checkout_request_id", body.requestId).maybeSingle();
  checkDb(existingError);
  const existingResponse = (order: Record<string, unknown>) => {
    if (!constantEqual(String(order.access_token_hash), accessHash) || order.request_hash !== requestHash) throw new PaymentError(409, "Checkout ini tidak cocok. Mulai pesanan baru.");
    return response({ orderId: order.order_id, token: order.creation_state === "ready" && order.status === "pending" ? order.midtrans_token : null, amount: order.amount, status: order.status, creationState: order.creation_state }, 200, req);
  };
  if (existing) return existingResponse(existing);

  const priced = await quote(db, input);
  if (body.expectedAmount !== priced.amount) throw new PaymentError(409, "Harga berubah. Periksa ulang ringkasan pesanan.");
  await limit(db, req, "customer-orders", 6, 600, customer.email);
  const orderId = `SL-${crypto.randomUUID()}`;
  const { data: reserved, error: reserveError } = await db.rpc("payment_reserve_order", {
    p_request_id: body.requestId, p_access_hash: accessHash, p_request_hash: requestHash, p_order_id: orderId,
    p_name: customer.name, p_email: customer.email, p_phone: customer.phone,
    p_type: input.productType, p_product_id: priced.product.id, p_product_name: priced.product.name,
    p_amount: priced.amount, p_subtotal: priced.subtotal, p_discount: priced.discount, p_voucher: input.voucherCode,
    p_environment: cfg.sandbox ? "sandbox" : "production",
  });
  checkDb(reserveError);
  if (reserved?.conflict) throw new PaymentError(409, "Identitas checkout sudah digunakan");
  if (!reserved?.fresh) return existingResponse(reserved.order);

  // No access token in redirect URLs. The browser saved its credential BEFORE this call.
  const finish = new URL("/payment/success", cfg.frontendUrl);
  finish.searchParams.set("order_id", orderId);
  let creationState = "uncertain";
  try {
    const result = await fetch(cfg.snapApi, {
      method: "POST", signal: AbortSignal.timeout(20_000),
      headers: { Authorization: `Basic ${btoa(cfg.serverKey + ":")}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        transaction_details: { order_id: orderId, gross_amount: priced.amount },
        customer_details: { first_name: customer.name, email: customer.email, phone: customer.phone ?? "" },
        item_details: [{ id: priced.product.id, price: priced.amount, quantity: 1, name: priced.product.name.replace(/\|/g, " ").slice(0, 50) }],
        credit_card: { secure: true },
        callbacks: { finish: finish.toString() },
        // All methods enabled on the merchant account are offered by Snap.
      }),
    });
    if (!result.ok) {
      // Only safe diagnostics: never log keys, authorization, customer data or token.
      console.error("Midtrans Snap request rejected", {
        orderId, httpStatus: result.status,
        category: result.status === 401 ? "server-key-rejected" : result.status === 403 ? "merchant-access-rejected" : [400,422].includes(result.status) ? "request-validation-failed" : "provider-error",
      });
      // Only definite validation/auth failures are safe to label failed. Timeouts/5xx may have created a token.
      creationState = [400,401,403,404,422].includes(result.status) ? "failed" : "uncertain";
      throw new Error("Midtrans rejected request");
    }
    const snap = await result.json();
    if (typeof snap.token !== "string" || !snap.token || typeof snap.redirect_url !== "string" || new URL(snap.redirect_url).origin !== new URL(cfg.snapApi).origin) throw new Error("Invalid Snap response");
    const { error } = await db.from("orders").update({ midtrans_token: snap.token, midtrans_redirect_url: snap.redirect_url, creation_state: "ready" }).eq("order_id", orderId);
    checkDb(error);
    return response({ orderId, token: snap.token, amount: priced.amount, status: "pending", creationState: "ready" }, 200, req);
  } catch {
    // Never POST a second token request for this order after an ambiguous failure.
    await db.from("orders").update({ creation_state: creationState }).eq("order_id", orderId).eq("creation_state", "creating");
    return response({ orderId, token: null, amount: priced.amount, status: "pending", creationState }, 200, req);
  }
}));
