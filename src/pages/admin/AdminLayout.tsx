import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import {
  LayoutDashboard, FileText, Package, FolderKanban, GraduationCap,
  LogOut, Home, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/articles", icon: FileText, label: "Artikel" },
  { to: "/admin/products", icon: Package, label: "Produk" },
  { to: "/admin/projects", icon: FolderKanban, label: "Project" },
  { to: "/admin/courses", icon: GraduationCap, label: "E-Course" },
];

const AdminLayout = () => {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate(`/auth?redirect=${encodeURIComponent(location.pathname)}`);
  }, [user, loading, navigate, location.pathname]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Memuat…</p></div>;
  }
  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4">
        <div className="max-w-md text-center bg-card border border-border rounded-2xl p-10 shadow-card">
          <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-heading mb-2">Akses Ditolak</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Halaman ini hanya untuk admin. Akun kamu (<span className="font-medium">{user.email}</span>) bukan admin.
          </p>
          <Button variant="outline" onClick={() => navigate("/")}>
            <Home className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex w-full">
      <aside className="hidden md:flex w-64 flex-col bg-primary text-primary-foreground sticky top-0 h-screen">
        <div className="px-6 py-6 border-b border-primary-foreground/10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gold/20 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">Admin</p>
              <p className="text-sm font-bold">Satu Langkah</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-primary-foreground/10 space-y-1">
          <NavLink to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all">
            <Home className="h-4 w-4" /> Lihat Website
          </NavLink>
          <button onClick={() => signOut().then(() => navigate("/"))} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all">
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-primary text-primary-foreground">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-gold" />
            <span className="font-bold text-sm">Admin Panel</span>
          </div>
          <button onClick={() => navigate("/")} className="text-xs">Keluar</button>
        </div>
        <div className="flex overflow-x-auto border-t border-primary-foreground/10">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => cn("flex-shrink-0 px-4 py-2.5 text-xs font-medium border-b-2",
                isActive ? "border-gold text-primary-foreground" : "border-transparent text-primary-foreground/70")}>
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      <main className="flex-1 min-w-0 pt-24 md:pt-0">
        <div className="p-5 md:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;