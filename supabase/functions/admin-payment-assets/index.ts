import { PaymentError, productInput, sha256, text } from "../_shared/payment-domain.ts";
import { adminClient, checkDb, endpoint, response } from "../_shared/payment-runtime.ts";

Deno.serve(endpoint(async (req, body) => {
  const db = adminClient();
  const bearer = req.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!bearer) throw new PaymentError(401, "Silakan masuk sebagai admin");
  const { data: identity, error: identityError } = await db.auth.getUser(bearer);
  if (identityError || !identity.user) throw new PaymentError(401, "Sesi admin tidak valid");
  const { data: role, error: roleError } = await db.from("user_roles").select("role").eq("user_id", identity.user.id).eq("role", "admin").maybeSingle();
  checkDb(roleError);
  if (!role) throw new PaymentError(403, "Akses admin diperlukan");

  if (body.action === "list") {
    const results = await Promise.all([
      db.from("products").select("id,slug,title").eq("product_type", "ebook").order("title"),
      db.from("courses").select("id,slug,title").order("title"),
      db.from("payment_assets").select("product_type,product_id,object_path,drive_url,active"),
    ]);
    results.forEach((result) => checkDb(result.error));
    return response({ products: results[0].data, courses: results[1].data, assets: results[2].data }, 200, req);
  }
  if (body.action === "reissue-access") {
    const orderId = text(body.orderId, 50, "Pesanan");
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32))).map((x) => x.toString(16).padStart(2, "0")).join("");
    const { data, error } = await db.from("orders").update({ access_token_hash: await sha256(token) }).eq("order_id", orderId).select("order_id").maybeSingle();
    checkDb(error);
    if (!data) throw new PaymentError(404, "Pesanan tidak ditemukan");
    return response({ version: 1, orderId, accessToken: token }, 200, req);
  }
  const input = productInput(body);
  if (!/^[a-f0-9-]{36}$/i.test(input.productId)) throw new PaymentError(400, "Gunakan ID produk dari database");
  const { data: product, error: productError } = await db.from(input.productType === "ebook" ? "products" : "courses").select("id").eq("id", input.productId).maybeSingle();
  checkDb(productError);
  if (!product) throw new PaymentError(404, "Produk tidak ditemukan");
  const prefix = `${input.productType}/${input.productId}/`;
  if (body.action === "upload-url") {
    const extension = text(body.extension, 5, "Jenis file").toLowerCase();
    if (!["pdf", "epub", "zip"].includes(extension)) throw new PaymentError(400, "Gunakan PDF, EPUB, atau ZIP");
    const path = `${prefix}${crypto.randomUUID()}.${extension}`;
    const { data, error } = await db.storage.from("paid-products").createSignedUploadUrl(path, { upsert: false });
    checkDb(error);
    return response({ path, token: data?.token }, 200, req);
  }
  if (body.action === "disable") {
    const { error } = await db.from("payment_assets").update({ active: false }).eq("product_type", input.productType).eq("product_id", input.productId);
    checkDb(error);
    return response({ success: true }, 200, req);
  }
  if (body.action !== "save") throw new PaymentError(400, "Aksi tidak valid");
  let path: string | null = null;
  let driveUrl: string | null = null;
  if (body.driveUrl) {
    let url;
    try { url = new URL(text(body.driveUrl, 2048, "Link Google Drive")); } catch { throw new PaymentError(400, "Link Google Drive tidak valid"); }
    if (url.protocol !== "https:" || !["drive.google.com", "docs.google.com"].includes(url.hostname) || url.username || url.password || url.port) throw new PaymentError(400, "Gunakan link HTTPS Google Drive atau Google Docs");
    driveUrl = url.toString();
  } else {
    path = text(body.objectPath, 200, "File");
    if (!path.startsWith(prefix) || !/^[a-f0-9-]{36}\.(pdf|epub|zip)$/.test(path.slice(prefix.length))) throw new PaymentError(400, "Lokasi file tidak valid");
    const { data: files, error } = await db.storage.from("paid-products").list(prefix.slice(0, -1), { search: path.slice(prefix.length), limit: 10 });
    checkDb(error);
    if (!files?.some((file) => file.name === path!.slice(prefix.length) && file.id && Number(file.metadata?.size) <= 50 * 1024 * 1024)) throw new PaymentError(400, "File belum selesai diunggah atau terlalu besar");
  }
  const { error } = await db.from("payment_assets").upsert({ product_type: input.productType, product_id: input.productId, bucket_id: "paid-products", object_path: path, drive_url: driveUrl, active: true }, { onConflict: "product_type,product_id" });
  checkDb(error);
  return response({ success: true }, 200, req);
}));
