import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { publishContent } from "@/lib/publishContent";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

const AdminProducts = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string, title: string) => {
    if (!confirm(`Hapus produk "${title}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await publishContent();
    toast.success("Produk dihapus");
    load();
  };

  const fmt = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-2">Konten</p>
          <h1 className="text-3xl font-bold text-heading">Produk</h1>
          <p className="text-muted-foreground text-sm mt-1">Kelola katalog produk & e-book.</p>
        </div>
        <Button asChild variant="navy"><Link to="/admin/products/new"><Plus className="h-4 w-4" /> Produk Baru</Link></Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? <div className="p-10 text-center text-muted-foreground text-sm">Memuat…</div> :
         items.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground mb-4">Belum ada produk.</p>
          </div>
         ) : (
          <ul className="divide-y divide-border">
            {items.map((p) => (
              <li key={p.id} className="p-4 sm:p-5 flex items-center gap-4 hover:bg-muted/30">
                <div className="h-14 w-14 rounded-lg bg-muted overflow-hidden shrink-0">
                  {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{p.category || "—"}</span>
                    {p.checkout_enabled && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">Midtrans</span>}
                    {!p.active && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Nonaktif</span>}
                  </div>
                  <h3 className="font-semibold text-heading truncate">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{fmt(p.price)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="sm" variant="ghost" asChild><Link to={`/admin/products/${p.id}`}><Pencil className="h-4 w-4" /></Link></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(p.id, p.title)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
         )}
      </div>
    </div>
  );
};

export default AdminProducts;