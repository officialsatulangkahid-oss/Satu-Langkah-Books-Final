import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TransactionRequest {
  productType: "ebook" | "ecourse";
  productId: string;
  productName: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

serve(async (req) => {
  // Handle CORS preflight
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

    const body: TransactionRequest = await req.json();
    console.log("Creating transaction for:", body.productName);

    // Generate unique order ID
    const orderId = `SL-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_id: orderId,
        customer_name: body.customerName,
        customer_email: body.customerEmail,
        customer_phone: body.customerPhone || null,
        product_type: body.productType,
        product_id: body.productId,
        product_name: body.productName,
        amount: body.amount,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw new Error("Failed to create order");
    }

    // Create Midtrans transaction
    const midtransPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: body.amount,
      },
      customer_details: {
        first_name: body.customerName,
        email: body.customerEmail,
        phone: body.customerPhone || "",
      },
      item_details: [
        {
          id: body.productId,
          price: body.amount,
          quantity: 1,
          name: body.productName.substring(0, 50), // Midtrans limit
        },
      ],
      callbacks: {
        finish: `${req.headers.get("origin")}/payment/success?order_id=${orderId}`,
        error: `${req.headers.get("origin")}/payment/error?order_id=${orderId}`,
        pending: `${req.headers.get("origin")}/payment/pending?order_id=${orderId}`,
      },
    };

    // Use sandbox or production URL based on server key prefix
    const isSandbox = serverKey.startsWith("SB-");
    const midtransUrl = isSandbox
      ? "https://app.sandbox.midtrans.com/snap/v1/transactions"
      : "https://app.midtrans.com/snap/v1/transactions";

    console.log("Calling Midtrans API:", midtransUrl);

    const midtransResponse = await fetch(midtransUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(serverKey + ":")}`,
      },
      body: JSON.stringify(midtransPayload),
    });

    const midtransData = await midtransResponse.json();
    console.log("Midtrans response:", midtransData);

    if (!midtransResponse.ok) {
      throw new Error(midtransData.error_messages?.[0] || "Midtrans error");
    }

    // Update order with Midtrans token
    await supabase
      .from("orders")
      .update({
        midtrans_token: midtransData.token,
        midtrans_redirect_url: midtransData.redirect_url,
      })
      .eq("order_id", orderId);

    return new Response(
      JSON.stringify({
        success: true,
        orderId,
        token: midtransData.token,
        redirectUrl: midtransData.redirect_url,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in create-transaction:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
