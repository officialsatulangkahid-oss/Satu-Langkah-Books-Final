import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Building2, CheckCircle2, CreditCard, Loader2, Mail, QrCode, ShieldCheck, Smartphone, Store, Tag, Wallet } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import { CHECKOUT_PRODUCTS } from "@/data/checkoutProducts";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { loadSnap, openSnap, paymentCall } from "@/lib/midtrans";
import { createPayment, money, type PaymentQuote } from "@/lib/payments";
import { CHECKOUT_PAYMENT_METHODS, paymentPreferences, type PaymentMethodId } from "@/lib/paymentMethods";
import { toast } from "sonner";

const customerSchema = z.object({
  name: z.string().trim().min(2, "Isi nama lengkap").max(100),
  email: z.string().trim().email("Email tidak valid").max(254),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{7,19}$/, "Nomor WhatsApp tidak valid"),
});
const methodIcons = { qris: QrCode, bank_transfer: Building2, ewallet: Wallet, credit_card: CreditCard, paylater: Smartphone, cstore: Store };

export default function Checkout() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quote, setQuote] = useState<PaymentQuote | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [voucher, setVoucher] = useState("");
  const [method, setMethod] = useState<PaymentMethodId | "all">("qris");
  const [busy, setBusy] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const lock = useRef(false);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    let alive = true;
    setQuote(null); setError(""); setStep(1); setVoucher(""); setImageFailed(false); setMethod("qris");
    paymentCall<PaymentQuote>("payment-catalog", { productType: "ebook", productId })
      .then((result) => { if (alive) setQuote(result); }).catch((err: Error) => { if (alive) setError(err.message); });
    return () => { alive = false; };
  }, [productId]);
  useEffect(() => {
    if (user) setCustomer((value) => ({ ...value, name: value.name || String(user.user_metadata?.full_name ?? ""), email: value.email || user.email || "" }));
  }, [user]);

  const applyVoucher = async (remove = false) => {
    if (lock.current) return;
    lock.current = true; setBusy(true);
    try {
      const result = await paymentCall<PaymentQuote>("payment-catalog", { productType: "ebook", productId, voucherCode: remove ? null : voucher.trim().toUpperCase() });
      setQuote(result);
      if (remove) setVoucher("");
      toast.success(result.voucherCode ? "Voucher diterapkan" : "Harga diperbarui");
    } catch (err) { toast.error((err as Error).message); }
    finally { lock.current = false; setBusy(false); }
  };
  const pay = async () => {
    if (!quote || lock.current) return;
    const parsed = customerSchema.safeParse(customer);
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    lock.current = true; setBusy(true);
    try {
      await loadSnap();
      const result = await createPayment(quote, customer);
      const finish = () => navigate(`/payment/pending?order_id=${encodeURIComponent(result.orderId)}`);
      if (result.token && result.amount === quote.amount) openSnap(result.token, finish, paymentPreferences(method)); else finish();
    } catch (err) { toast.error((err as Error).message); }
    finally { lock.current = false; setBusy(false); }
  };
  const next = () => {
    const parsed = customerSchema.safeParse(customer);
    if (parsed.success) setStep(3); else toast.error(parsed.error.errors[0].message);
  };

  if (!quote) return <section className="pt-32 pb-20 container-page min-h-[60vh] text-center"><h1 className="text-2xl font-bold">{error || "Memuat checkout…"}</h1><Button asChild variant="outline" className="mt-6"><Link to="/product">Kembali ke produk</Link></Button></section>;

  // Local data is used only for presentation. All amounts come from the server quote.
  const presentation = CHECKOUT_PRODUCTS[quote.product.slug];
  const productImage = quote.product.image || presentation?.image;
  const shortDesc = quote.product.shortDesc?.trim() || presentation?.shortDesc || "Produk digital Satu Langkah Books.";
  const methodLabel = CHECKOUT_PAYMENT_METHODS.find((item) => item.id === method)?.label ?? "Semua metode";

  return <section className="pt-28 pb-20 lg:pt-32 bg-cream min-h-screen"><div className="container-page max-w-6xl">
    <Link to={`/product/${quote.product.slug}`} className="inline-flex gap-2 items-center mb-6 text-sm text-muted-foreground hover:text-primary"><ArrowLeft size={16} /> Kembali ke produk</Link>
    <div className="bg-card border border-border rounded-2xl p-6 lg:p-9 mb-8 shadow-card"><CheckoutStepper current={step} /></div>
    <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-7 lg:gap-8 items-start">
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 lg:p-9 shadow-card min-w-0">
        {step === 1 && <div className="space-y-6">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-2">Langkah 1</p><h1 className="text-2xl font-bold text-heading">Punya kode voucher?</h1><p className="text-sm text-muted-foreground mt-2">Masukkan kode voucher untuk mendapatkan potongan harga, atau lanjutkan tanpa voucher.</p></div>
          <div className="flex gap-2"><div className="relative flex-1 min-w-0"><Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Kode voucher" className="pl-10 h-12 uppercase" value={voucher} onChange={(e) => setVoucher(e.target.value)} placeholder="Kode voucher" disabled={busy} /></div><Button variant="outline" className="h-12" onClick={() => applyVoucher()} disabled={busy || !voucher.trim()}>Terapkan</Button></div>
          {quote.voucherCode && <div className="flex items-center justify-between gap-3 rounded-xl bg-primary/5 border border-primary/20 p-4 text-sm"><span className="inline-flex gap-2 items-center"><CheckCircle2 size={17} className="text-primary" />Voucher <strong>{quote.voucherCode}</strong> aktif</span><button onClick={() => applyVoucher(true)} disabled={busy} className="text-muted-foreground underline">Hapus</button></div>}
          <div className="flex justify-end pt-3"><Button variant="navy" className="h-12 px-6" onClick={() => setStep(2)} disabled={busy}>Lanjut <ArrowRight size={16} /></Button></div>
        </div>}
        {step === 2 && <div className="space-y-5">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-2">Langkah 2</p><h1 className="text-2xl font-bold text-heading">Data Diri Pembeli</h1><p className="text-sm text-muted-foreground mt-2">Periksa data pembeli sebelum melanjutkan pembayaran.</p></div>
          <div className="space-y-2"><Label htmlFor="buyer-name">Nama lengkap</Label><Input id="buyer-name" className="h-11" autoComplete="name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} /></div>
          <div className="space-y-2"><Label htmlFor="buyer-email">Email</Label><Input id="buyer-email" className="h-11" type="email" autoComplete="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} /></div>
          <div className="space-y-2"><Label htmlFor="buyer-phone">Nomor WhatsApp</Label><Input id="buyer-phone" className="h-11" type="tel" autoComplete="tel" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} /></div>
          <p className="text-xs text-muted-foreground">Data pembeli digunakan untuk memproses pesanan dan pembayaran.</p>
          <div className="flex justify-between gap-3 pt-4"><Button variant="outline" className="h-12 px-5" onClick={() => setStep(1)}><ArrowLeft size={16} />Kembali</Button><Button variant="navy" className="h-12 px-6" onClick={next}>Lanjut<ArrowRight size={16} /></Button></div>
        </div>}
        {step === 3 && <div className="space-y-6">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-2">Langkah 3</p><h1 className="text-2xl font-bold text-heading">Pilih Metode Pembayaran</h1><p className="text-sm text-muted-foreground mt-2">Pembayaran diproses aman melalui Midtrans Payment Gateway.</p></div>
          <fieldset disabled={busy}>
            <legend className="sr-only">Metode pembayaran</legend>
            <div className="grid sm:grid-cols-2 gap-3">
              {CHECKOUT_PAYMENT_METHODS.map((item) => {
                const Icon = methodIcons[item.id];
                const active = method === item.id;
                return <label key={item.id} className={cn("relative flex items-start gap-3 p-4 min-h-[108px] rounded-xl border-2 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2", active ? "border-primary bg-primary/[0.04]" : "border-border bg-card hover:border-primary/40", busy && "opacity-60 cursor-wait")}>
                  <input className="sr-only" type="radio" name="payment-method" value={item.id} checked={active} onChange={() => setMethod(item.id)} />
                  <span className={cn("h-10 w-10 rounded-lg grid place-items-center shrink-0", active ? "bg-primary text-primary-foreground" : "bg-muted text-heading")}><Icon size={22} /></span>
                  <span className="min-w-0"><span className="block font-semibold text-[13px] sm:text-sm text-heading leading-5">{item.label}</span><span className="block text-xs text-muted-foreground leading-5 mt-0.5">{item.description}</span></span>
                </label>;
              })}
            </div>
          </fieldset>
          <div className="text-center space-y-2"><p className="text-xs text-muted-foreground leading-5">Metode tersedia sesuai dukungan pembayaran dan ketentuan penyedia. Anda akan menyelesaikan transaksi di jendela pembayaran Midtrans.</p><button type="button" className={cn("text-xs underline underline-offset-4", method === "all" ? "font-semibold text-primary" : "text-muted-foreground hover:text-primary")} onClick={() => setMethod("all")} disabled={busy}>{method === "all" ? "Semua metode akan ditampilkan di Midtrans" : "Lihat semua metode di Midtrans"}</button></div>
          <div className="border border-border/70 bg-muted/20 rounded-xl p-4 flex items-start justify-between gap-3"><div className="text-sm min-w-0"><p className="font-medium text-heading">{customer.name}</p><p className="text-muted-foreground text-xs mt-1 break-words">{customer.email}</p><p className="text-muted-foreground text-xs mt-1">{customer.phone}</p></div><button type="button" className="text-xs text-primary underline underline-offset-4 shrink-0" onClick={() => setStep(2)} disabled={busy}>Ubah data</button></div>
          <div className="flex justify-between gap-3 pt-2"><Button variant="outline" className="h-12 px-5" onClick={() => setStep(2)} disabled={busy}><ArrowLeft size={16} />Kembali</Button><Button variant="navy" className="h-12 px-6 min-w-[165px]" onClick={pay} disabled={busy}>{busy && <Loader2 className="animate-spin" size={16} />} {busy ? "Memproses…" : `Bayar ${money(quote.amount)}`}</Button></div>
        </div>}
      </div>
      <aside className="space-y-4 lg:sticky lg:top-24 min-w-0">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">Ringkasan Pesanan</h2>
          <div className="flex gap-3 pb-5 mb-5 border-b border-border">
            <div className="w-[72px] h-[90px] shrink-0 rounded-lg bg-muted/40 overflow-hidden flex items-center justify-center">{productImage && !imageFailed ? <img src={productImage} alt={quote.product.name} className="h-full w-full object-contain p-1" onError={() => setImageFailed(true)} /> : <BookOpen size={28} className="text-muted-foreground" />}</div>
            <div className="min-w-0"><p className="font-semibold text-sm text-heading leading-5">{quote.product.name}</p><p className="text-xs text-muted-foreground leading-5 mt-1 line-clamp-3">{shortDesc}</p></div>
          </div>
          <dl className="space-y-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Jumlah</dt><dd>1 produk digital</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Subtotal</dt><dd>{money(quote.subtotal)}</dd></div>
            {quote.discount > 0 && <div className="flex justify-between gap-3 text-emerald-700"><dt>Voucher ({quote.voucherCode})</dt><dd>−{money(quote.discount)}</dd></div>}
            <div className="flex justify-between gap-3 border-t border-border pt-4 !mt-4 text-lg font-bold text-heading"><dt>Total</dt><dd>{money(quote.amount)}</dd></div>
          </dl>
          {step === 3 && <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/60">Pilihan pembayaran: <span className="font-medium text-heading">{methodLabel}</span></p>}
        </div>
        <div className="px-1 space-y-3 text-xs text-muted-foreground"><p className="flex gap-2 items-start leading-5"><ShieldCheck size={16} className="shrink-0 mt-0.5 text-primary" /><span>Akses produk tersedia pada halaman pesanan setelah pembayaran terverifikasi. Simpan file akses pesanan untuk membukanya kembali.</span></p><details className="border-t border-border/60 pt-3"><summary className="cursor-pointer font-medium text-heading">Informasi pembelian & bantuan</summary><div className="mt-3 space-y-2 leading-5"><p>Produk ini berbentuk digital. File atau tautan produk dapat dibuka dari halaman pesanan setelah pembayaran terkonfirmasi.</p><p>Untuk kendala akses, pembatalan, atau permintaan pengembalian dana, hubungi tim Satu Langkah dengan menyertakan Order ID.</p><a className="inline-flex items-center gap-2 text-primary underline underline-offset-4 break-all" href="mailto:officialsatulangkahid@gmail.com"><Mail size={14} className="shrink-0" />Hubungi Satu Langkah</a></div></details></div>
      </aside>
    </div>
  </div></section>;
}
