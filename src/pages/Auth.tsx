import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  Loader2, Mail, Lock, User as UserIcon, BookOpen,
  AtSign, Calendar as CalendarIcon, Globe, Eye, EyeOff,
} from "lucide-react";
import { z } from "zod";
import logo from "@/assets/logo.png";

const COUNTRIES = [
  "Indonesia", "Malaysia", "Singapura", "Brunei Darussalam",
  "Arab Saudi", "Mesir", "Turki", "Yordania", "Uni Emirat Arab",
  "Amerika Serikat", "Inggris", "Australia", "Jepang", "Korea Selatan",
  "Lainnya",
];

const signupSchema = z
  .object({
    email: z.string().trim().email("Email tidak valid").max(255),
    username: z
      .string()
      .trim()
      .min(3, "Username minimal 3 karakter")
      .max(20, "Username maksimal 20 karakter")
      .regex(/^[a-zA-Z0-9_]+$/, "Hanya huruf, angka, dan _"),
    password: z.string().min(8, "Kata sandi minimal 8 karakter").max(72),
    confirmPassword: z.string(),
    fullName: z.string().trim().min(2, "Nama lengkap wajib diisi").max(100),
    dateOfBirth: z.string().refine((v) => {
      if (!v) return false;
      const d = new Date(v);
      return !isNaN(d.getTime()) && d < new Date();
    }, "Tanggal lahir tidak valid"),
    gender: z.enum(["male", "female"], { required_error: "Pilih jenis kelamin" }),
    country: z.string().min(1, "Pilih negara"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi kata sandi tidak cocok",
  });

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [country, setCountry] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const parsed = signupSchema.safeParse({
          email, username, password, confirmPassword,
          fullName, dateOfBirth, gender, country,
        });
        if (!parsed.success) {
          toast.error(parsed.error.errors[0].message);
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: fullName,
              username,
              date_of_birth: dateOfBirth,
              gender,
              country,
            },
          },
        });
        if (error) throw error;
        toast.success("Pendaftaran berhasil! Selamat datang.");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Selamat datang kembali!");
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
  try {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin`,
    },
    });

    if (error) throw error;
  } catch (err: any) {
    toast.error(err.message || "Gagal masuk dengan Google");
    setLoading(false);
  }
};

  return (
    <div className="min-h-[calc(100vh-9rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 via-background to-secondary/30" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className={`w-full ${mode === "signup" ? "max-w-2xl" : "max-w-md"}`}>
        <div className="bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl p-8 lg:p-10">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <Link to="/" className="mb-5">
              <img src={logo} alt="Satu Langkah Books" className="h-14 w-auto" />
            </Link>
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-gold font-semibold mb-3">
              <span className="h-px w-6 bg-gold" />
              {mode === "login" ? "Masuk Akun" : "Daftar Akun"}
              <span className="h-px w-6 bg-gold" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {mode === "login" ? "Selamat Datang Kembali" : "Bergabunglah Bersama Kami"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login"
                ? "Masuk untuk melanjutkan perjalanan literasimu"
                : "Mulai langkah literasi pertamamu hari ini"}
            </p>
          </div>

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 font-medium gap-3"
            onClick={handleGoogle}
            disabled={loading}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Lanjutkan dengan Google
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground tracking-widest">atau</span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === "signup" ? (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldWrap label="Nama Lengkap" icon={<UserIcon className="h-4 w-4" />}>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nama lengkap" className="pl-10 h-11" required />
                  </FieldWrap>
                  <FieldWrap label="Username" icon={<AtSign className="h-4 w-4" />}>
                    <Input value={username} onChange={(e) => setUsername(e.target.value)}
                      placeholder="username_kamu" className="pl-10 h-11" required />
                  </FieldWrap>
                </div>
                <FieldWrap label="Email" icon={<Mail className="h-4 w-4" />}>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@contoh.com" className="pl-10 h-11" required />
                </FieldWrap>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldWrap label="Kata Sandi" icon={<Lock className="h-4 w-4" />}>
                    <Input type={showPwd ? "text" : "password"} value={password}
                      onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 karakter"
                      className="pl-10 pr-10 h-11" required minLength={8} />
                    <button type="button" onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </FieldWrap>
                  <FieldWrap label="Konfirmasi Sandi" icon={<Lock className="h-4 w-4" />}>
                    <Input type={showPwd ? "text" : "password"} value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi kata sandi"
                      className="pl-10 h-11" required minLength={8} />
                  </FieldWrap>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldWrap label="Tanggal Lahir" icon={<CalendarIcon className="h-4 w-4" />}>
                    <Input type="date" value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="pl-10 h-11" required />
                  </FieldWrap>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Jenis Kelamin
                    </Label>
                    <Select value={gender} onValueChange={(v) => setGender(v as any)}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Pilih" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Laki-laki</SelectItem>
                        <SelectItem value="female">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    <Globe className="inline h-3.5 w-3.5 mr-1" /> Negara
                  </Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Pilih negara" /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <FieldWrap label="Email" icon={<Mail className="h-4 w-4" />}>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@contoh.com" className="pl-10 h-11" required />
                </FieldWrap>
                <FieldWrap label="Kata Sandi" icon={<Lock className="h-4 w-4" />}>
                  <Input type={showPwd ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                    className="pl-10 pr-10 h-11" required />
                  <button type="button" onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </FieldWrap>
              </>
            )}

            <Button type="submit" variant="navy" className="w-full h-12 mt-2" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <BookOpen className="h-4 w-4" />
                  {mode === "login" ? "Masuk" : "Daftar Sekarang"}
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary font-semibold hover:underline"
            >
              {mode === "login" ? "Daftar di sini" : "Masuk di sini"}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Dengan melanjutkan, kamu menyetujui ketentuan layanan kami.
        </p>
      </div>
    </div>
  );
};

export default Auth;

function FieldWrap({
  label, icon, children,
}: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        {children}
      </div>
    </div>
  );
}
