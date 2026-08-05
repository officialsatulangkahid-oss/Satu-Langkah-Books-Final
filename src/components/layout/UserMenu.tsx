import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const UserMenu = ({ compact = false }: { compact?: boolean }) => {
  const { user, signOut, loading, isAdmin } = useAuth();

  if (loading) return <div className="h-9 w-20" />;

  if (!user) {
    return (
      <Button asChild size="sm" variant="navy" className="h-9 px-4 text-xs tracking-wider uppercase font-semibold">
        <Link to="/auth">
          <LogIn className="h-3.5 w-3.5" />
          Masuk
        </Link>
      </Button>
    );
  }

  const name =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    user.email?.split("@")[0] ||
    "User";
  const avatar = user.user_metadata?.avatar_url as string | undefined;
  const initials = name.slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Kamu telah keluar");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 group">
          <Avatar className="h-9 w-9 border-2 border-gold/40 group-hover:border-gold transition-colors">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-semibold truncate">{name}</span>
            <span className="text-xs text-muted-foreground font-normal truncate">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin && (
          <>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/admin">
                <ShieldCheck className="h-4 w-4 mr-2 text-gold" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
