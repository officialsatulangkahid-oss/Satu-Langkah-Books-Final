import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      supabase
        .from("orders")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setOrder(data);
        });
    }
  }, [orderId]);

  return (
    <section className="section-padding min-h-[60vh] flex items-center">
      <div className="container-page">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-heading mb-4">
            Pembayaran Berhasil!
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Terima kasih atas pembelian Anda. Konfirmasi akan dikirim ke email Anda.
          </p>

          {order && (
            <div className="p-4 rounded-lg bg-cream border border-border mb-6 text-left">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono text-sm mb-2">{order.order_id}</p>
              <p className="text-sm text-muted-foreground">Produk</p>
              <p className="font-medium">{order.product_name}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/">
                Kembali ke Beranda
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentSuccess;
