import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loadSnap, openSnap, paymentCall } from "@/lib/midtrans";
import { createPayment, money, type PaymentQuote } from "@/lib/payments";
import { toast } from "sonner";

interface Props { isOpen: boolean; onClose: () => void; product: { id: string; name: string; price: number; type: "ebook" | "ecourse" } }
export default function CheckoutModal({ isOpen, onClose, product }: Props) {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [quote, setQuote] = useState<PaymentQuote | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  useEffect(() => {
    if (!isOpen) return;
    let alive = true; setQuote(null); setError("");
    paymentCall<PaymentQuote>("payment-catalog", { productType: product.type, productId: product.id }).then((value) => { if (alive) setQuote(value); }).catch((err: Error) => { if (alive) setError(err.message); });
    return () => { alive = false; };
  }, [isOpen, product.id, product.type]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!quote || lock.current) return;
    lock.current = true; setBusy(true);
    try {
      await loadSnap();
      const order = await createPayment(quote, customer);
      onClose();
      const finish = () => navigate(`/payment/pending?order_id=${encodeURIComponent(order.orderId)}`);
      if (order.token && order.amount === quote.amount) openSnap(order.token, finish); else finish();
    } catch (err) { toast.error((err as Error).message); }
    finally { lock.current = false; setBusy(false); }
  };
  return <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !busy) onClose(); }}><DialogContent><DialogHeader><DialogTitle>Checkout</DialogTitle></DialogHeader>
    <p className="font-semibold">{quote?.product.name ?? product.name}</p>
    {error && <p role="alert" className="text-destructive text-sm">{error}</p>}
    <p>{quote ? money(quote.amount) : "Memeriksa harga…"}</p>
    <form onSubmit={submit} className="space-y-4">
      <div><Label htmlFor="course-name">Nama lengkap</Label><Input id="course-name" required minLength={2} maxLength={100} value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} disabled={busy} /></div>
      <div><Label htmlFor="course-email">Email</Label><Input id="course-email" required type="email" maxLength={254} value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} disabled={busy} /></div>
      <div><Label htmlFor="course-phone">Nomor WhatsApp</Label><Input id="course-phone" type="tel" maxLength={20} value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} disabled={busy} /></div>
      <p className="text-xs text-muted-foreground">Pilih metode pembayaran di Midtrans. Akses produk tersedia melalui halaman pesanan setelah pembayaran diverifikasi.</p>
      <Button type="submit" disabled={busy || !quote} className="w-full">{busy ? "Memproses…" : "Bayar sekarang"}</Button>
    </form>
  </DialogContent></Dialog>;
}
