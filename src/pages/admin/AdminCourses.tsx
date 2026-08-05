import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, GraduationCap } from "lucide-react";
import { toast } from "sonner";

const AdminCourses = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string, title: string) => {
    if (!confirm(`Hapus kursus "${title}"?`)) return;
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Dihapus"); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-2">Konten</p>
          <h1 className="text-3xl font-bold text-heading">E-Course</h1>
          <p className="text-muted-foreground text-sm mt-1">Kelola katalog kursus online.</p>
        </div>
        <Button asChild variant="navy"><Link to="/admin/courses/new"><Plus className="h-4 w-4" /> Kursus Baru</Link></Button>
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? <div className="p-10 text-center text-muted-foreground text-sm">Memuat…</div> :
         items.length === 0 ? (
           <div className="p-12 text-center"><GraduationCap className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">Belum ada kursus.</p></div>
         ) : (
          <ul className="divide-y divide-border">
            {items.map((c) => (
              <li key={c.id} className="p-5 flex items-center gap-4 hover:bg-muted/30">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gold">{c.level}</span>
                    <span className="text-[10px] text-muted-foreground">{c.duration} · {c.lessons} materi</span>
                  </div>
                  <h3 className="font-semibold text-heading">{c.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Rp {Number(c.price).toLocaleString("id-ID")}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" asChild><Link to={`/admin/courses/${c.id}`}><Pencil className="h-4 w-4" /></Link></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(c.id, c.title)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
         )}
      </div>
    </div>
  );
};

export default AdminCourses;