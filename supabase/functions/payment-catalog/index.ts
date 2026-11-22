import { productInput } from "../_shared/payment-domain.ts";
import { adminClient, endpoint, limit, quote, response } from "../_shared/payment-runtime.ts";
Deno.serve(endpoint(async (req, body) => {
  const db = adminClient();
  await limit(db, req, "quote", 90, 60);
  return response({ ...await quote(db, productInput(body)), environment: Deno.env.get("MIDTRANS_ENVIRONMENT") ?? "unconfigured" }, 200, req);
}));
