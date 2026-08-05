import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientKey = Deno.env.get("MIDTRANS_CLIENT_KEY") ?? "";
  const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY") ?? "";
  const isSandbox = serverKey.startsWith("SB-") || clientKey.startsWith("SB-");
  const snapUrl = isSandbox
    ? "https://app.sandbox.midtrans.com/snap/snap.js"
    : "https://app.midtrans.com/snap/snap.js";

  return new Response(
    JSON.stringify({ clientKey, snapUrl, isSandbox }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});