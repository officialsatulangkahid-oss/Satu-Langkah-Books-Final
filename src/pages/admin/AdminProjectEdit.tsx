import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { publishContent } from "@/lib/publishContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { slugify } from "@/lib/slug";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

const ICONS = ["Book", "Wrench", "Users", "GraduationCap", "Sparkles", "Lightbulb", "Heart", "Globe"];
const STATUSES = ["active", "ongoing", "completed"];

const AdminProjectEdit = () => {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    slug: "", title: "", description: "", icon: "Book", status: "active",
    project_type: "E-Book", sort_order: 0, active: true,
  });

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
      if (error) return toast.error(error.message);
      setForm({
        slug: data.slug, title: data.title, description: data.description || "",
        icon: data.icon || "Book", status: data.status || "active",
        project_type: data.project_type || "", sort_order: data.sort_order || 0, active: !!data.active,
      });
      setLoading(false);
    })();
  }, [id, isNew]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.title.trim()) return toast.error("Judul wajib");
    const slug = form.slug || slugify(form.title);
    setSaving(true);
    const payload = { ...form, slug, sort_order: Number(form.sort_order) || 0 };
    const { error } = isNew
      ? await supabase.from("projects").insert(payload)
      : await supabase.from("projects").update(payload).eq("id", id!);
    setSaving(false);
    if (error) return toast.error(error.message);
    await publishContent();
    toast.success("Tersimpan");
    navigate("/admin/projects");
  };

  if (loading) return <p className="text-muted-foreground">Memuat…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/admin/projects" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
        <Button onClick={save} disabled={saving} variant="navy"><Save className="h-4 w-4" /> {saving ? "Menyimpan…" : "Simpan"}</Button>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-2">{isNew ? "Project Baru" : "Edit Project"}</p>
        <h1 className="text-3xl font-bold text-heading">{form.title || "Project"}</h1>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5 max-w-2xl">
        <div className="flex items-center justify-between">
          <div><p className="text-sm font-medium">Aktif</p><p className="text-xs text-muted-foreground">Tampil di publik</p></div>
          <Switch checked={form.active} onCheckedChange={(v) => set("active", v)} />
        </div>
        <div className="space-y-2"><label className="text-sm font-semibold text-heading">Judul</label>
          <Input value={form.title} onChange={(e) => { set("title", e.target.value); if (isNew && !form.slug) set("slug", slugify(e.target.value)); }} />
        </div>
        <div className="space-y-2"><label className="text-sm font-semibold text-heading">Deskripsi</label>
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><label className="text-sm font-semibold text-heading">Tipe</label>
            <Input value={form.project_type} onChange={(e) => set("project_type", e.target.value)} placeholder="E-Book, Program…" />
          </div>
          <div className="space-y-2"><label className="text-sm font-semibold text-heading">Status</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><label className="text-sm font-semibold text-heading">Ikon</label>
            <select value={form.icon} onChange={(e) => set("icon", e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              {ICONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2"><label className="text-sm font-semibold text-heading">Urutan</label>
            <Input type="number" value={form.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} />
          </div>
        </div>
        <div className="space-y-2"><label className="text-sm font-semibold text-heading">Slug</label>
          <Input value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} />
        </div>
      </div>
    </div>
  );
};

export default AdminProjectEdit;