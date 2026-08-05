import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import ImageInput from "@/components/admin/ImageInput";
import { slugify } from "@/lib/slug";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, X } from "lucide-react";

interface DetailRow { label: string; value: string }

const AdminProductEdit = () => {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    slug: "", title: "", category: "E-Book", image_url: "", price: 75000,
    short_desc: "", external_link: "", checkout_enabled: true, active: true, product_type: "ebook",
    long_description: [""] as string[],
    details: [{ label: "", value: "" }] as DetailRow[],
  });

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (error) return toast.error(error.message);
      setForm({
        slug: data.slug, title: data.title, category: data.category || "E-Book",
        image_url: data.image_url || "", price: data.price || 0,
        short_desc: data.short_desc || "", external_link: data.external_link || "",
        checkout_enabled: !!data.checkout_enabled, active: !!data.active,
        product_type: data.product_type || "ebook",
        long_description: Array.isArray(data.long_description) && data.long_description.length ? (data.long_description as string[]) : [""],
        details: Array.isArray(data.details) && data.details.length ? (data.details as unknown as DetailRow[]) : [{ label: "", value: "" }],
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
      slug, title: form.title, category: form.category, image_url: form.image_url || null,
      price: Number(form.price) || 0, short_desc: form.short_desc, external_link: form.external_link || null,
      checkout_enabled: form.checkout_enabled, active: form.active, product_type: form.product_type,
      long_description: form.long_description.filter((p) => p.trim()) as any,
      details: form.details.filter((d) => d.label.trim() || d.value.trim()) as any,
    };
    const { error } = isNew
      ? await supabase.from("products").insert(payload)
      : await supabase.from("products").update(payload).eq("id", id!);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(isNew ? "Produk dibuat" : "Tersimpan");
    navigate("/admin/products");
  };

  if (loading) return <p className="text-muted-foreground">Memuat…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/admin/products" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
        <Button onClick={save} disabled={saving} variant="navy"><Save className="h-4 w-4" /> {saving ? "Menyimpan…" : "Simpan"}</Button>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-2">{isNew ? "Produk Baru" : "Edit Produk"}</p>
        <h1 className="text-3xl font-bold text-heading">{form.title || "Produk"}</h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5 bg-card border border-border rounded-xl p-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-heading">Judul</label>
            <Input value={form.title} onChange={(e) => { set("title", e.target.value); if (isNew && !form.slug) set("slug", slugify(e.target.value)); }} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-heading">Deskripsi Singkat</label>
            <Textarea value={form.short_desc} onChange={(e) => set("short_desc", e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-heading">Deskripsi Panjang (paragraf)</label>
            {form.long_description.map((para, i) => (
              <div key={i} className="flex gap-2">
                <Textarea value={para} onChange={(e) => {
                  const next = [...form.long_description]; next[i] = e.target.value; set("long_description", next);
                }} rows={3} />
                <Button type="button" size="sm" variant="ghost" onClick={() => { const next = form.long_description.filter((_, idx) => idx !== i); set("long_description", next.length ? next : [""]); }}><X className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={() => set("long_description", [...form.long_description, ""])}><Plus className="h-4 w-4" /> Paragraf</Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-heading">Detail Produk</label>
            {form.details.map((d, i) => (
              <div key={i} className="flex gap-2">
                <Input placeholder="Label (cth: Halaman)" value={d.label} onChange={(e) => { const n = [...form.details]; n[i] = { ...d, label: e.target.value }; set("details", n); }} className="w-1/3" />
                <Input placeholder="Nilai" value={d.value} onChange={(e) => { const n = [...form.details]; n[i] = { ...d, value: e.target.value }; set("details", n); }} className="flex-1" />
                <Button type="button" size="sm" variant="ghost" onClick={() => { const n = form.details.filter((_, idx) => idx !== i); set("details", n.length ? n : [{ label: "", value: "" }]); }}><X className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={() => set("details", [...form.details, { label: "", value: "" }])}><Plus className="h-4 w-4" /> Detail</Button>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Aktif</p><p className="text-xs text-muted-foreground">Tampil di katalog</p></div>
              <Switch checked={form.active} onCheckedChange={(v) => set("active", v)} />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Checkout In-app</p><p className="text-xs text-muted-foreground">Pakai Midtrans</p></div>
              <Switch checked={form.checkout_enabled} onCheckedChange={(v) => set("checkout_enabled", v)} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="space-y-2"><label className="text-sm font-semibold text-heading">Slug</label><Input value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} /></div>
            <div className="space-y-2"><label className="text-sm font-semibold text-heading">Kategori</label><Input value={form.category} onChange={(e) => set("category", e.target.value)} /></div>
            <div className="space-y-2"><label className="text-sm font-semibold text-heading">Harga (IDR)</label><Input type="number" value={form.price} onChange={(e) => set("price", Number(e.target.value))} /></div>
            <div className="space-y-2"><label className="text-sm font-semibold text-heading">Link Eksternal (opsional)</label><Input value={form.external_link} onChange={(e) => set("external_link", e.target.value)} placeholder="https://lynk.id/…" /></div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <ImageInput value={form.image_url} onChange={(v) => set("image_url", v)} label="Gambar Produk" />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminProductEdit;