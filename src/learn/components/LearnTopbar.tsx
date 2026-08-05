import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, GraduationCap, Menu, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useProgress } from "../useProgress";

const links = [
  { to: "/learn", label: "Beranda", end: true },
  { to: "/learn/courses", label: "Kursus" },
  { to: "/learn/dashboard", label: "Dashboard" },
];

const LearnTopbar = ({ onMenu }: { onMenu?: () => void }) => {
  const { state } = useProgress();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const initials = state.studentName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        {onMenu && (
          <button onClick={onMenu} className="rounded-xl p-2 text-muted-foreground hover:bg-muted lg:hidden" aria-label="Buka menu">
            <Menu className="h-5 w-5" />
          </button>
        )}

        <Link to="/learn" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="hidden text-[15px] font-semibold sm:block">
            Satu Langkah <span className="text-primary">Learn</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form
          className="ml-auto hidden max-w-sm flex-1 items-center gap-2 rounded-full border border-border bg-muted/60 px-4 py-2 focus-within:border-primary/40 focus-within:bg-background sm:flex"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/learn/courses?q=${encodeURIComponent(q)}`);
          }}
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari kursus, topik, atau instruktur…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 sm:ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Notifikasi">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex-col items-start gap-0.5">
                <span className="text-sm font-medium">Kelas baru tersedia</span>
                <span className="text-xs text-muted-foreground">Menulis Esai Reflektif kini bisa diakses.</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex-col items-start gap-0.5">
                <span className="text-sm font-medium">Streak kamu berjalan</span>
                <span className="text-xs text-muted-foreground">Belajar hari ini untuk menjaga rentetan.</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring" aria-label="Akun">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
                    {initials || "SL"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate">{state.studentName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/learn/dashboard")}>Dashboard</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/learn/dashboard/courses")}>Kursus Saya</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/learn/dashboard/profile")}>Profil</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/")}>Kembali ke Satu Langkah Books</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button asChild size="sm" className="ml-1 hidden rounded-full lg:inline-flex">
            <Link to="/learn/dashboard">Mulai Belajar</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default LearnTopbar;