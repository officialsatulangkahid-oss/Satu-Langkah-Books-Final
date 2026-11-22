import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { paymentCall } from "@/lib/midtrans";
import { downloadJson, money, type AccessReceipt } from "@/lib/payments";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Order = { order_id: string; product_name: string; customer_name: string; customer_email: string; amount: number; status: string; created_at: string };
export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    setBusy(true);
    const { data, error } = await supabase.from("orders").select("order_id,product_name,customer_name,customer_email,amount,status,created_at").order("created_at", { ascending: false }).range(page * 20, page * 20 + 19);
    if (error) toast.error("Pesanan belum dapat dimuat. Periksa akses admin dan migrasi database."); else setOrders(data ?? []);
    setBusy(false);
  }, [page]);
  useEffect(() => { void refresh(); }, [refresh]);
  const reissue = async (order: Order) => {
    if (!window.confirm(`Sudah memverifikasi identitas pembeli untuk ${order.order_id}? Akses lama akan dicabut.`)) return;
    setBusy(true);
    try {
      const receipt = await paymentCall<AccessReceipt>("admin-payment-assets", { action: "reissue-access", orderId: order.order_id });
      downloadJson(`akses-${order.order_id}.json`, receipt);
      toast.success("File akses baru diunduh. Berikan hanya kepada pembeli yang terverifikasi.");
    } catch (err) { toast.error((err as Error).message); }
    finally { setBusy(false); }
  };
  return <div className="space-y-6"><h1 className="text-3xl font-bold">Pesanan</h1><p className="text-sm text-muted-foreground">Status pembayaran ditetapkan backend. Untuk mengembalikan dana, gunakan dashboard Midtrans.</p><Button onClick={refresh} disabled={busy} variant="outline">Muat ulang</Button>
    <div className="space-y-4">{orders.map((order) => <article key={order.order_id} className="bg-card border rounded-xl p-5 space-y-2"><p className="font-semibold">{order.product_name} · {money(order.amount)}</p><p className="text-sm">{order.customer_name} · {order.customer_email}</p><p className="text-xs font-mono break-all">{order.order_id}</p><p className="text-sm">Status: {order.status}</p><Button variant="outline" size="sm" onClick={() => reissue(order)} disabled={busy}>Terbitkan ulang akses pembeli</Button></article>)}</div>
    {!busy && !orders.length && <p>Belum ada pesanan pada halaman ini.</p>}
    <div className="flex gap-3"><Button variant="outline" disabled={busy || page === 0} onClick={() => setPage(page - 1)}>Sebelumnya</Button><Button variant="outline" disabled={busy || orders.length < 20} onClick={() => setPage(page + 1)}>Berikutnya</Button></div>
  </div>;
}
