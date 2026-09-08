import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { publishContent } from "@/lib/publishContent";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, FileText } from "lucide-react";
import { toast } from "sonner";

interface Article {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  date: string | null;
  featured: boolean;
  published: boolean;
  image_url: string | null;
}

const AdminArticles = () => {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("id, slug, title, category, date, featured, published, image_url")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as Article[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const togglePublished = async (id: string, current: boolean) => {
    const { error } = await supabase.from("articles").update({ published: !current }).eq("id", id);
    if (error) return toast.error(error.message);
    await publishContent();
    toast.success(!current ? "Diterbitkan" : "Disembunyikan");
    load();
  };

  const remove = async (id: string, title: string) => {
    if (!confirm(`Hapus artikel "${title}"?`)) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await publishContent();
    toast.success("Artikel dihapus");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-2">Konten</p>
          <h1 className="text-3xl font-bold text-heading">Artikel</h1>
          <p className="text-muted-foreground text-sm mt-1">Kelola semua artikel & tulisan reflektif.</p>
        </div>
        <Button asChild variant="navy"><Link to="/admin/articles/new"><Plus className="h-4 w-4" /> Tulis Baru</Link></Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground text-sm">Memuat…</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground mb-4">Belum ada artikel.</p>
            <Button asChild variant="navy"><Link to="/admin/articles/new">Tulis Artikel Pertama</Link></Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((a) => (
              <li key={a.id} className="p-4 sm:p-5 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                <div className="h-14 w-14 rounded-lg bg-muted overflow-hidden shrink-0">
                  {a.image_url && <img src={a.image_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {a.featured && <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold"><Star className="h-3 w-3 fill-gold" /> Featured</span>}
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{a.category || "—"}</span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${a.published ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{a.published ? "Terbit" : "Draf"}</span>
                  </div>
                  <h3 className="font-semibold text-heading truncate">{a.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.date}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => togglePublished(a.id, a.published)} title={a.published ? "Sembunyikan" : "Terbitkan"}>
                    {a.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" asChild><Link to={`/admin/articles/${a.id}`}><Pencil className="h-4 w-4" /></Link></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(a.id, a.title)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminArticles;