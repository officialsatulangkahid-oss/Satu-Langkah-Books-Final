import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadSnap, openSnap, paymentCall } from "@/lib/midtrans";
import { allowNewPurchase, accessFor, downloadJson, money, orderBody, saveAccess, type AccessReceipt, type PaymentStatus as Status } from "@/lib/payments";
import { toast } from "sonner";

const labels: Record<Status["status"], string> = { pending: "Menunggu pembayaran", paid: "Pembayaran berhasil", expired: "Pembayaran kedaluwarsa", cancelled: "Pembayaran dibatalkan", failed: "Pembayaran gagal", refunded: "Pembayaran dikembalikan", partially_refunded: "Pengembalian sebagian pembayaran" };

export default function PaymentStatus() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const orderId = params.get("order_id") ?? "";
  const [order, setOrder] = useState<Status | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [working, setWorking] = useState(false);
  const sequence = useRef(0);
  const check = useCallback(async () => {
    const current = ++sequence.current;
    setBusy(true); setError("");
    try {
      if (!orderId) throw new Error("Pilih file akses untuk membuka pesanan.");
      const result = await paymentCall<Status>("order-status", orderBody(orderId));
      if (sequence.current === current) setOrder(result);
    } catch (err) { if (sequence.current === current) { setOrder(null); setError((err as Error).message); } }
    finally { if (sequence.current === current) setBusy(false); }
  }, [orderId]);
  useEffect(() => { const requestSequence = sequence; setOrder(null); void check(); return () => { requestSequence.current++; }; }, [check]);

  const restore = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > 4096) throw new Error("File akses tidak valid");
      const receipt = JSON.parse(await file.text()) as AccessReceipt;
      saveAccess(receipt);
      if (receipt.orderId === orderId) await check();
      else navigate(`/payment/pending?order_id=${encodeURIComponent(receipt.orderId)}`, { replace: true });
    } catch (err) { toast.error((err as Error).message); }
  };
  const resume = async () => {
    if (working) return;
    setWorking(true);
    try {
      await loadSnap();
      const { token } = await paymentCall<{ token: string }>("order-resume", orderBody(orderId));
      openSnap(token, () => { void check(); });
    } catch (err) { toast.error((err as Error).message); }
    finally { setWorking(false); }
  };
  const download = async () => {
    if (working) return;
    setWorking(true);
    try {
      const result = await paymentCall<{ url: string }>("order-download", orderBody(orderId));
      const url = new URL(result.url);
      if (url.protocol !== "https:") throw new Error("Link unduhan tidak valid");
      window.location.assign(url.toString());
    } catch (err) { toast.error((err as Error).message); }
    finally { setWorking(false); }
  };

  return <section className="pt-32 pb-20 min-h-[70vh] bg-cream"><div className="container-page max-w-xl"><div className="bg-card border rounded-2xl p-7 space-y-5 text-center">
    {order?.status === "paid" ? <CheckCircle2 className="mx-auto text-emerald-600" size={56} /> : <Clock className="mx-auto text-gold" size={56} />}
    <h1 className="text-2xl font-bold">{busy && !order ? "Memeriksa pembayaran…" : order ? order.creationState === "failed" && order.status === "pending" ? "Pembayaran belum dapat dibuat" : labels[order.status] : "Buka pesanan"}</h1>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {order && <>
      <div className="rounded-xl bg-muted/50 p-4 space-y-2"><p className="font-medium">{order.productName}</p><p>{money(order.amount)}</p><p className="font-mono text-xs break-all">{order.orderId}</p></div>
      {order.status === "paid" && <p className="text-sm text-muted-foreground">{order.downloadAvailable ? "Produk sudah dapat dibuka. Simpan file akses pesanan agar dapat kembali menggunakan perangkat lain." : "Pembayaran terverifikasi. Produk sedang disiapkan oleh admin; simpan akses pesanan dan periksa kembali nanti."}</p>}
      {order.status === "pending" && <p className="text-sm text-muted-foreground">{order.creationState === "ready" ? "Jika sudah membayar, tunggu sebentar lalu periksa status. Menutup jendela pembayaran tidak otomatis membatalkan pesanan." : order.creationState === "failed" ? "Permintaan pembayaran ditolak. Hubungi admin dengan Order ID ini sebelum mencoba kembali." : "Permintaan pembayaran sedang diperiksa. Hubungi admin dengan Order ID ini jika tidak berubah."}</p>}
      {["refunded", "partially_refunded"].includes(order.status) && <p className="text-sm">Akses produk dihentikan setelah pengembalian pembayaran. Hubungi admin untuk bantuan.</p>}
      {order.reconciliationPending && <p className="text-sm text-amber-700">Pengecekan terbaru belum tersedia. Status terakhir ditampilkan; coba lagi nanti.</p>}
      <div className="flex flex-wrap gap-3 justify-center">
        {order.downloadAvailable && <Button onClick={download} disabled={working}><Download size={16} /> Buka produk</Button>}
        {order.canResume && <Button onClick={resume} disabled={working}>Lanjutkan pembayaran</Button>}
        <Button variant="outline" onClick={() => { const receipt = accessFor(orderId); if (receipt) downloadJson(`akses-${orderId}.json`, receipt); }}>Simpan akses pesanan</Button>
      </div>
      {(["paid", "expired", "cancelled", "failed", "refunded", "partially_refunded"].includes(order.status) || order.creationState === "failed") && <Button variant="ghost" onClick={() => { allowNewPurchase(orderId); navigate(order.productType === "ebook" ? `/checkout/${order.productId}` : "/e-course"); }}>Buat pesanan baru</Button>}
      <p className="text-xs text-muted-foreground">File akses adalah kunci pesananmu. Simpan secara pribadi dan jangan bagikan.</p>
    </>}
    {orderId && <Button variant="outline" onClick={check} disabled={busy || working}>{busy && <Loader2 className="animate-spin" size={16} />} Periksa status</Button>}
    <div className="border-t pt-4 text-left space-y-2"><label htmlFor="restore-access" className="text-sm font-medium">Pulihkan dari file akses pesanan</label><Input id="restore-access" type="file" accept="application/json,.json" onChange={(e) => { void restore(e.target.files?.[0]); e.target.value = ""; }} /><p className="text-xs text-muted-foreground">Jika file akses hilang, hubungi admin untuk verifikasi pembelian dan penerbitan akses baru.</p></div>
    <Button asChild variant="ghost"><Link to="/product">Kembali ke katalog</Link></Button>
  </div></div></section>;
}
