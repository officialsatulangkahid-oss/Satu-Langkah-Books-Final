import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Tag, CheckCircle2, Loader2, Wallet, QrCode, Building, CreditCard, Smartphone, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import { CHECKOUT_PRODUCTS, VOUCHERS } from "@/data/checkoutProducts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { loadSnap } from "@/lib/midtrans";
import { cn } from "@/lib/utils";

const formatPrice = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const customerSchema = z.object({
  name: z.string().trim().min(2, "Nama wajib diisi").max(100),
  email: z.string().trim().email("Email tidak valid").max(255),
  phone: z.string().trim().min(8, "No. WhatsApp tidak valid").max(20).regex(/^[0-9+\-\s]+$/, "Hanya angka"),
});

const PAYMENT_METHODS = [
  { id: "qris", label: "QRIS", desc: "Scan & bayar instan", icon: QrCode },
  { id: "bank_transfer", label: "Bank Transfer (VA)", desc: "BCA, BNI, BRI, Mandiri, Permata", icon: Building },
  { id: "gopay", label: "GoPay / e-Wallet", desc: "GoPay, ShopeePay, OVO, DANA", icon: Wallet },
  { id: "credit_card", label: "Kartu Kredit/Debit", desc: "Visa, Mastercard, JCB", icon: CreditCard },
  { id: "akulaku", label: "Akulaku / Kredivo", desc: "Cicilan tanpa kartu", icon: Smartphone },
  { id: "cstore", label: "Convenience Store", desc: "Alfamart, Indomaret", icon: Store },
];

const Checkout = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const product = productId ? CHECKOUT_PRODUCTS[productId] : null;

  const [step, setStep] = useState(1);
  const [voucherInput, setVoucherInput] = useState("");
  const [voucher, setVoucher] = useState<{ code: string; type: "percent" | "fixed"; value: number } | null>(null);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [selectedMethod, setSelectedMethod] = useState<string>("qris");
  const [paying, setPaying] = useState(false);
  const [completed, setCompleted] = useState<{ orderId: string; status: "success" | "pending" } | null>(null);

  // Prefill from user profile
  useEffect(() => {
    if (!user) return;
    setCustomer((c) => ({
      ...c,
      name: c.name || (user.user_metadata?.full_name as string) || "",
      email: c.email || user.email || "",
    }));
  }, [user]);

  const subtotal = product?.price ?? 0;
  const discount = useMemo(() => {
    if (!voucher) return 0;
    if (voucher.type === "percent") return Math.round((subtotal * voucher.value) / 100);
    return Math.min(voucher.value, subtotal);
  }, [voucher, subtotal]);
  const total = Math.max(0, subtotal - discount);

  if (!product) {
    return (
      <section className="pt-32 pb-16 bg-cream min-h-screen">
        <div className="container-page text-center">
          <h1 className="text-3xl font-bold text-heading mb-4">Produk tidak ditemukan</h1>
          <Button asChild variant="outline">
            <Link to="/product"><ArrowLeft className="h-4 w-4 mr-2" />Kembali ke Produk</Link>
          </Button>
        </div>
      </section>
    );
  }

  const applyVoucher = () => {
    const code = voucherInput.trim().toUpperCase();
    if (!code) return;
    const v = VOUCHERS[code];
    if (!v) {
      toast.error("Kode voucher tidak valid");
      setVoucher(null);
      return;
    }
    setVoucher({ code, type: v.type, value: v.value });
    toast.success(`Voucher diterapkan: ${v.label}`);
  };

  const goToCustomer = () => setStep(2);

  const goToPayment = () => {
    const parsed = customerSchema.safeParse(customer);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setStep(3);
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      await loadSnap();
      const { data, error } = await supabase.functions.invoke("create-transaction", {
        body: {
          productType: product.type,
          productId: product.id,
          productName: product.name,
          amount: total,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
        },
      });
      if (error) throw error;
      const token = data?.token;
      const orderId = data?.orderId;
      if (!token) throw new Error("Token pembayaran tidak diterima");

      window.snap?.pay(token, {
        onSuccess: () => {
          setCompleted({ orderId, status: "success" });
          setStep(4);
          setPaying(false);
        },
        onPending: () => {
          setCompleted({ orderId, status: "pending" });
          setStep(4);
          setPaying(false);
        },
        onError: () => {
          toast.error("Pembayaran gagal. Silakan coba lagi.");
          setPaying(false);
        },
        onClose: () => {
          if (!completed) {
            toast.info("Pembayaran dibatalkan");
            setPaying(false);
          }
        },
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal memproses pembayaran");
      setPaying(false);
    }
  };

  return (
    <section className="pt-28 pb-20 lg:pt-32 bg-cream min-h-screen">
      <div className="container-page max-w-5xl">
        <Link to={`/product/${product.id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Kembali ke produk
        </Link>

        <div className="bg-card border border-border rounded-2xl p-6 lg:p-10 mb-8 shadow-card">
          <CheckoutStepper current={step} />
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          {/* Left: step content */}
          <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-card">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-2">Langkah 1</p>
                  <h2 className="text-2xl font-bold text-heading">Punya kode voucher?</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Masukkan kode untuk mendapatkan potongan harga, atau lewati jika tidak ada.
                  </p>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value)}
                      placeholder="Masukkan kode voucher"
                      className="pl-10 h-12 uppercase"
                    />
                  </div>
                  <Button onClick={applyVoucher} variant="outline" className="h-12">Terapkan</Button>
                </div>

                {voucher && (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Voucher <strong>{voucher.code}</strong> aktif</span>
                    </div>
                    <button onClick={() => { setVoucher(null); setVoucherInput(""); }}
                      className="text-xs text-muted-foreground hover:text-destructive">Hapus</button>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Coba kode: <code className="px-1.5 py-0.5 bg-muted rounded">READ10</code> ·{" "}
                  <code className="px-1.5 py-0.5 bg-muted rounded">WELCOME</code>
                </p>

                <div className="flex justify-end pt-2">
                  <Button onClick={goToCustomer} variant="navy" className="h-12 px-6">
                    Lanjut <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-2">Langkah 2</p>
                  <h2 className="text-2xl font-bold text-heading">Data Diri Pembeli</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Kami akan mengirimkan produk dan invoice ke email ini.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Nama Lengkap</Label>
                    <Input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Nama lengkap" className="h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="email@contoh.com" className="h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>No. WhatsApp</Label>
                    <Input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="08xxxxxxxxxx" className="h-11" />
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button onClick={() => setStep(1)} variant="outline" className="h-12 px-6">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
                  </Button>
                  <Button onClick={goToPayment} variant="navy" className="h-12 px-6">
                    Lanjut <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-2">Langkah 3</p>
                  <h2 className="text-2xl font-bold text-heading">Pilih Metode Pembayaran</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pembayaran diproses aman melalui Midtrans Payment Gateway.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((m) => {
                    const Icon = m.icon;
                    const active = selectedMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id)}
                        className={cn(
                          "text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3",
                          active ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                        )}
                      >
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-heading">{m.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[11px] text-muted-foreground text-center">
                  Anda akan diarahkan ke jendela pembayaran aman Midtrans untuk menyelesaikan transaksi.
                </p>

                <div className="flex justify-between pt-2">
                  <Button onClick={() => setStep(2)} variant="outline" className="h-12 px-6" disabled={paying}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
                  </Button>
                  <Button onClick={handlePay} variant="navy" className="h-12 px-6 min-w-[180px]" disabled={paying}>
                    {paying ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memproses...</>
                    ) : (
                      <>Bayar {formatPrice(total)}</>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && completed && (
              <div className="text-center py-8 space-y-5">
                <div className={cn("w-20 h-20 mx-auto rounded-full flex items-center justify-center",
                  completed.status === "success" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600")}>
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-heading">
                    {completed.status === "success" ? "Pembayaran Berhasil" : "Menunggu Pembayaran"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    {completed.status === "success"
                      ? "Terima kasih! Produk akan dikirim ke email Anda dalam beberapa menit."
                      : "Silakan selesaikan pembayaran sesuai instruksi yang dikirim ke email Anda."}
                  </p>
                </div>
                <div className="inline-block bg-muted/50 border border-border rounded-lg px-4 py-2 text-xs">
                  <span className="text-muted-foreground">Order ID:</span>{" "}
                  <span className="font-mono font-semibold">{completed.orderId}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button onClick={() => navigate("/product")} variant="outline">Lihat Produk Lain</Button>
                  <Button onClick={() => navigate("/")} variant="navy">Kembali ke Beranda</Button>
                </div>
              </div>
            )}
          </div>

          {/* Right: order summary */}
          <aside className="bg-card border border-border rounded-2xl p-6 shadow-card h-fit lg:sticky lg:top-24">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Ringkasan Pesanan</h3>
            <div className="flex gap-3 mb-5 pb-5 border-b border-border">
              <img src={product.image} alt={product.name} className="w-16 h-20 object-contain rounded-lg bg-muted/40 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-sm text-heading leading-snug line-clamp-2">{product.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{product.shortDesc}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {voucher && (
                <div className="flex justify-between text-emerald-600">
                  <span>Voucher ({voucher.code})</span>
                  <span>− {formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 mt-3 border-t border-border text-base font-bold text-heading">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Checkout;