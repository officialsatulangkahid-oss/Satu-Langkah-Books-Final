import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { publishContent } from "@/lib/publishContent";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, FolderKanban } from "lucide-react";
import { toast } from "sonner";

const AdminProjects = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("projects").select("*").order("sort_order");
    if (error) toast.error(error.message);
    setItems(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string, title: string) => {
    if (!confirm(`Hapus project "${title}"?`)) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await publishContent();
    toast.success("Dihapus"); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-2">Konten</p>
          <h1 className="text-3xl font-bold text-heading">Project</h1>
          <p className="text-muted-foreground text-sm mt-1">Kelola program & inisiatif.</p>
        </div>
        <Button asChild variant="navy"><Link to="/admin/projects/new"><Plus className="h-4 w-4" /> Project Baru</Link></Button>
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? <div className="p-10 text-center text-muted-foreground text-sm">Memuat…</div> :
         items.length === 0 ? (
           <div className="p-12 text-center"><FolderKanban className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">Belum ada project.</p></div>
         ) : (
          <ul className="divide-y divide-border">
            {items.map((p) => (
              <li key={p.id} className="p-5 flex items-center gap-4 hover:bg-muted/30">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{p.project_type || "—"}</span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">{p.status}</span>
                  </div>
                  <h3 className="font-semibold text-heading">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.description}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" asChild><Link to={`/admin/projects/${p.id}`}><Pencil className="h-4 w-4" /></Link></Button>
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

export default AdminProjects;