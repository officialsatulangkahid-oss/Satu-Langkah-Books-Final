import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageInput from "@/components/admin/ImageInput";
import { slugify } from "@/lib/slug";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

const CATEGORIES = ["Tauhid", "Literasi Islam", "Pendidikan", "Refleksi"];

const AdminArticleEdit = () => {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    slug: "", title: "", excerpt: "", category: "Refleksi",
    read_time: "5 menit", date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    author: "Tim Satu Langkah", image_url: "", featured: false, published: true,
    content_html: "",
  });

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error } = await supabase.from("articles").select("*").eq("id", id).single();
      if (error) { toast.error(error.message); return; }
      const raw = data.content;
      let html = "";
      if (typeof raw === "string") html = raw;
      else if (Array.isArray(raw)) html = raw.map((p: any) => `<p>${p}</p>`).join("");
      setForm({
        slug: data.slug, title: data.title, excerpt: data.excerpt || "", category: data.category || "Refleksi",
        read_time: data.read_time || "5 menit", date: data.date || "", author: data.author || "Tim Satu Langkah",
        image_url: data.image_url || "", featured: !!data.featured, published: !!data.published,
        content_html: html,
      });
      setLoading(false);
    })();
  }, [id, isNew]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.title.trim()) return toast.error("Judul wajib diisi");
    const slug = form.slug || slugify(form.title);
    setSaving(true);
    const payload = {
      slug, title: form.title, excerpt: form.excerpt, category: form.category,
      read_time: form.read_time, date: form.date, author: form.author,
      image_url: form.image_url || null, featured: form.featured, published: form.published,
      content: form.content_html as any,
    };
    const { error } = isNew
      ? await supabase.from("articles").insert(payload)
      : await supabase.from("articles").update(payload).eq("id", id!);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(isNew ? "Artikel dibuat" : "Perubahan disimpan");
    navigate("/admin/articles");
  };

  if (loading) return <p className="text-muted-foreground">Memuat…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to="/admin/articles" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
        <Button onClick={save} disabled={saving} variant="navy"><Save className="h-4 w-4" /> {saving ? "Menyimpan…" : "Simpan"}</Button>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-2">{isNew ? "Tulisan Baru" : "Edit Artikel"}</p>
        <h1 className="text-3xl font-bold text-heading">{isNew ? "Buat Artikel" : form.title || "Edit"}</h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-heading">Judul</label>
            <Input value={form.title} onChange={(e) => { set("title", e.target.value); if (isNew && !form.slug) set("slug", slugify(e.target.value)); }} placeholder="Judul artikel…" className="text-lg" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-heading">Ringkasan</label>
            <Textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={3} placeholder="Ringkasan singkat…" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-heading">Isi Artikel</label>
            <RichTextEditor value={form.content_html} onChange={(v) => set("content_html", v)} placeholder="Mulai menulis…" />
          </div>
        </div>

        <aside className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-heading text-sm">Pengaturan</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Terbit</p>
                <p className="text-xs text-muted-foreground">Tampil ke publik</p>
              </div>
              <Switch checked={form.published} onCheckedChange={(v) => set("published", v)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Featured</p>
                <p className="text-xs text-muted-foreground">Tampil di highlight</p>
              </div>
              <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-heading">Slug URL</label>
              <Input value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} placeholder="contoh-slug-artikel" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-heading">Kategori</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-heading">Tanggal</label>
                <Input value={form.date} onChange={(e) => set("date", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-heading">Lama Baca</label>
                <Input value={form.read_time} onChange={(e) => set("read_time", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-heading">Penulis</label>
              <Input value={form.author} onChange={(e) => set("author", e.target.value)} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <ImageInput value={form.image_url} onChange={(v) => set("image_url", v)} label="Gambar Sampul" />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminArticleEdit;