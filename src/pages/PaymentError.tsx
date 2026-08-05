import { useSearchParams, Link } from "react-router-dom";
import { XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentError = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <section className="section-padding min-h-[60vh] flex items-center">
      <div className="container-page">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-heading mb-4">
            Pembayaran Gagal
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Maaf, pembayaran Anda tidak dapat diproses. Silakan coba lagi 
            atau hubungi tim support kami.
          </p>

          {orderId && (
            <div className="p-4 rounded-lg bg-cream border border-border mb-6">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono text-sm">{orderId}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline">
              <Link to="/e-course">
                Coba Lagi
              </Link>
            </Button>
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

export default PaymentError;
