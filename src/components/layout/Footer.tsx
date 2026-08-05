import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Instagram, Youtube, Mail } from "lucide-react";
import { SiShopee } from "react-icons/si";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/30">
      {/* Main Footer */}
      <div className="container-page pt-16 pb-20 lg:pt-20 lg:pb-24">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Logo */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="inline-block">
              <img src={logo} alt="Satu Langkah Books" className="h-14 w-auto" />
            </Link>
          </div>

         {/* Bantuan dan Panduan */}
        <div className="col-span-1 lg:col-span-2">
          <h4 className="text-xs text-muted-foreground mb-5 tracking-wide">
            Bantuan dan Panduan
          </h4>

          <ul className="space-y-3">
            <li>
              <a
                href="mailto:officialsatulangkahid@gmail.com"
                className="inline-flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-colors"
              >
                <Mail size={16} />
                Email
              </a>
            </li>

            <li>
              <a
                href="#"
                className="text-sm text-foreground/80 hover:text-foreground transition-colors"
              >
                Kebijakan Privasi
              </a>
            </li>

            <li>
              <a
                href="#"
                className="text-sm text-foreground/80 hover:text-foreground transition-colors"
              >
                Ketentuan Penggunaan
              </a>
            </li>
          </ul>
        </div>

          {/* Produk */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="text-xs text-muted-foreground mb-5 tracking-wide">
              Produk
            </h4>
            <ul className="space-y-3">
              {[
                { name: "E-Book Collection", path: "/project" },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Jadi Bagian dari Kami */}
          <div className="col-span-1 lg:col-span-3">
            <h4 className="text-xs text-muted-foreground mb-5 tracking-wide">
              Jadi Bagian dari Kami
            </h4>
            <ul className="space-y-3">
              {[
                { name: "Tentang Kami", path: "/about" },
                { name: "Artikel", path: "/articles" },
                { name: "Dukung Gerakan", path: "/about" },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ikuti Kami */}
          <div className="col-span-1 lg:col-span-3">
            <h4 className="text-xs text-muted-foreground mb-5 tracking-wide">
              Ikuti Kami
            </h4>

            <ul className="space-y-3">
              {[
                {
                  name: "Instagram",
                  icon: <Instagram size={17} />,
                  href: "https://instagram.com/satulangkahidofficial",
                },
                {
                  name: "Shopee",
                  icon: <SiShopee size={17} />,
                  href: "https://shopee.co.id/satulangkahbooks",
                },
              ].map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 text-sm text-foreground/80 hover:text-foreground transition-colors"
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom watermark & copyright */}
      <div className="container-page pb-12 relative overflow-hidden">
        <p className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} Satu Langkah Books. Semua hak dilindungi.
        </p>
        {/* Large watermark text */}
        <div className="absolute bottom-0 right-0 select-none pointer-events-none">
          <span className="font-serif text-[8rem] lg:text-[12rem] font-bold text-foreground/[0.03] leading-none tracking-tight">
            Satu Langkah
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
