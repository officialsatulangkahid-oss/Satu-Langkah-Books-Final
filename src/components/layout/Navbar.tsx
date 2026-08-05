import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import logoShape from "@/assets/logo-shape.png";
import logo from "@/assets/logo.png";
import UserMenu from "./UserMenu";

const navLinks = [
  { name: "Beranda", path: "/" },
  { name: "Artikel", path: "/articles" },
  { name: "Produk", path: "/product" },
  { name: "Project", path: "/project" },
  { name: "Perpustakaan", path: "/library"},
  { name: "Tentang", path: "/about" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Static logo shape - top left, not fixed */}
      <Link
        to="/"
        className="absolute top-0 left-4 z-[60] transition-all duration-300 hover:opacity-80"
      >
        <img src={logoShape} alt="Satu Langkah Books" className="h-[90px] w-auto lg:h-[110px]" />
      </Link>

      {/* Static top navbar - not fixed */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <nav className="container-page">
          <div className="flex items-center justify-center h-12 lg:h-14 relative">
            <div className="hidden lg:flex items-center gap-0">
              {navLinks.map((link, index) => (
                <div key={link.path} className="flex items-center">
                  {index > 0 && (
                    <span className="w-1 h-1 rounded-full bg-foreground/25 mx-3" />
                  )}
                  <Link
                    to={link.path}
                    className={cn(
                      "px-3 py-1.5 text-[13px] font-medium tracking-wider uppercase transition-all duration-300",
                      isActive(link.path)
                        ? "text-primary font-semibold"
                        : "text-foreground/60 hover:text-foreground"
                    )}
                  >
                    {link.name}
                  </Link>
                </div>
              ))}
            </div>
            <div className="lg:hidden flex-1" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden">
              <UserMenu />
            </div>
          </div>
        </nav>
      </header>

      {/* Scrolled navbar - fixed, appears on scroll */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-background/95 backdrop-blur-xl shadow-sm border-b border-border/50",
          scrolled
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <nav className="container-page">
          <div className="flex items-center h-16">
            <Link
              to="/"
              className="flex-shrink-0 mr-8 transition-all duration-300 hover:opacity-80"
            >
              <img src={logo} alt="Satu Langkah Books" className="h-10 w-auto" />
            </Link>
            <div className="hidden lg:flex items-center justify-center flex-1 gap-0">
              {navLinks.map((link, index) => (
                <div key={link.path} className="flex items-center">
                  {index > 0 && (
                    <span className="w-1 h-1 rounded-full bg-foreground/25 mx-3" />
                  )}
                  <Link
                    to={link.path}
                    className={cn(
                      "px-3 py-1.5 text-[13px] font-medium tracking-wider uppercase transition-all duration-300",
                      isActive(link.path)
                        ? "text-primary font-semibold"
                        : "text-foreground/60 hover:text-foreground"
                    )}
                  >
                    {link.name}
                  </Link>
                </div>
              ))}
            </div>
            <div className="flex-1 lg:flex-none" />
            <div className="flex-shrink-0 hidden">
              <UserMenu />
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;
