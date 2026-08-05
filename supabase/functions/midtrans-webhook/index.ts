import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serverKey = Deno.env.get("MIDTRANS_SERVER_KEY");
    if (!serverKey) {
      throw new Error("MIDTRANS_SERVER_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const notification = await req.json();
    console.log("Received Midtrans notification:", notification);

    const { order_id, transaction_status, fraud_status, payment_type } = notification;

    // Determine order status based on Midtrans notification
    let status: "pending" | "paid" | "expired" | "cancelled" = "pending";
    let paidAt: string | null = null;

    if (transaction_status === "capture" || transaction_status === "settlement") {
      if (fraud_status === "accept" || !fraud_status) {
        status = "paid";
        paidAt = new Date().toISOString();
        console.log(`Order ${order_id} marked as paid`);
      }
    } else if (transaction_status === "expire") {
      status = "expired";
      console.log(`Order ${order_id} expired`);
    } else if (transaction_status === "cancel" || transaction_status === "deny") {
      status = "cancelled";
      console.log(`Order ${order_id} cancelled`);
    }

    // Update order in database
    const updateData: any = {
      status,
      payment_method: payment_type,
    };

    if (paidAt) {
      updateData.paid_at = paidAt;
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("order_id", order_id);

    if (updateError) {
      console.error("Error updating order:", updateError);
      throw new Error("Failed to update order");
    }

    console.log(`Order ${order_id} updated to status: ${status}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in midtrans-webhook:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
