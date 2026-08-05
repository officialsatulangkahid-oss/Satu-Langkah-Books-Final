import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Package, FolderKanban, GraduationCap, ShoppingCart, ArrowRight } from "lucide-react";

const cards = [
  { table: "articles", label: "Artikel", icon: FileText, color: "text-blue-600 bg-blue-50", to: "/admin/articles" },
  { table: "products", label: "Produk", icon: Package, color: "text-emerald-600 bg-emerald-50", to: "/admin/products" },
  { table: "projects", label: "Project", icon: FolderKanban, color: "text-amber-600 bg-amber-50", to: "/admin/projects" },
  { table: "courses", label: "E-Course", icon: GraduationCap, color: "text-purple-600 bg-purple-50", to: "/admin/courses" },
  { table: "orders", label: "Pesanan", icon: ShoppingCart, color: "text-rose-600 bg-rose-50", to: "/admin" },
] as const;

const AdminDashboard = () => {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    cards.forEach(async ({ table }) => {
      const { count } = await supabase.from(table as any).select("*", { count: "exact", head: true });
      setCounts((p) => ({ ...p, [table]: count ?? 0 }));
    });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-2">Admin Panel</p>
        <h1 className="text-3xl font-bold text-heading">Selamat datang kembali</h1>
        <p className="text-muted-foreground mt-1.5">Kelola seluruh konten website Satu Langkah dari sini.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.table} to={c.to} className="group bg-card border border-border rounded-2xl p-6 hover:shadow-card-hover transition-all hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-4">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-all" />
            </div>
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="text-3xl font-bold text-heading mt-1">{counts[c.table] ?? "—"}</p>
          </Link>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-bold text-heading mb-4">Aksi Cepat</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          <Link to="/admin/articles/new" className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-muted/40 text-sm font-medium"><FileText className="h-4 w-4 text-primary" /> Tulis Artikel Baru</Link>
          <Link to="/admin/products/new" className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-muted/40 text-sm font-medium"><Package className="h-4 w-4 text-primary" /> Tambah Produk</Link>
          <Link to="/admin/projects/new" className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-muted/40 text-sm font-medium"><FolderKanban className="h-4 w-4 text-primary" /> Tambah Project</Link>
          <Link to="/admin/courses/new" className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-muted/40 text-sm font-medium"><GraduationCap className="h-4 w-4 text-primary" /> Tambah Kursus</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;