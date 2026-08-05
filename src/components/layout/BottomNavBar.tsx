import { Link, useLocation } from "react-router-dom";
import { Home, FileText, ShoppingBag, Briefcase, GraduationCap, Library } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Beranda", path: "/", icon: Home },
  { name: "Articles", path: "/articles", icon: FileText },
  { name: "Product", path: "/product", icon: ShoppingBag },
  { name: "Project", path: "/project", icon: Briefcase },
  { name: "Perpustakaan", path: "/library", icon: Library},
];

const BottomNavBar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-300 min-w-[60px]",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-all duration-300",
                active && "bg-primary/10"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-300",
                  active && "text-primary"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-300",
                active && "text-primary font-semibold"
              )}>
                {item.name}
              </span>
              {active && (
                <span className="absolute -bottom-0 w-8 h-0.5 bg-gold rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;
