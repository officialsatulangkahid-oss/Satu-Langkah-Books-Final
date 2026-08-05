import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const LearnFooter = () => (
  <footer className="border-t border-border bg-background">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
      <div className="lg:col-span-2">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-[15px] font-semibold">
            Satu Langkah <span className="text-primary">Learn</span>
          </span>
        </div>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Ruang belajar tenang untuk membaca, berpikir, dan menulis lebih baik. Satu langkah setiap hari.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold">Belajar</h4>
        <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
          <li><Link className="transition-colors hover:text-primary" to="/learn/courses">Semua Kursus</Link></li>
          <li><Link className="transition-colors hover:text-primary" to="/learn/dashboard">Dashboard</Link></li>
          <li><Link className="transition-colors hover:text-primary" to="/learn/dashboard/certificates">Sertifikat</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-semibold">Satu Langkah</h4>
        <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
          <li><Link className="transition-colors hover:text-primary" to="/">Website Utama</Link></li>
          <li><Link className="transition-colors hover:text-primary" to="/articles">Artikel</Link></li>
          <li><Link className="transition-colors hover:text-primary" to="/product">Produk</Link></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} Satu Langkah Books · Learning Platform
    </div>
  </footer>
);

export default LearnFooter;