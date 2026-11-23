import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GraduationCap, ArrowLeft, Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { safeRedirect } from "@/lib/authRedirect";
const credentials=z.object({email:z.string().trim().email('Alamat email tidak valid.'),password:z.string().min(8,'Kata sandi minimal 8 karakter.').max(72)});
export default function LearnAuth(){
 const [params]=useSearchParams();const navigate=useNavigate();const {user,loading:authLoading}=useAuth();
 const [mode,setMode]=useState<'login'|'signup'|'forgot'|'reset'>(params.get('mode')==='reset'?'reset':params.get('mode')==='signup'?'signup':'login');
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [confirm,setConfirm]=useState('');const [name,setName]=useState('');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [error,setError]=useState((params.has('error_description') || new URLSearchParams(window.location.hash.slice(1)).has('error'))?'Login tidak selesai. Silakan coba lagi.':'');
 const next=safeRedirect(params.get('next'));
 const callback=window.location.origin+'/learn/auth?next='+encodeURIComponent(next);
 useEffect(()=>{if(!authLoading&&user&&mode!=='reset')navigate(next,{replace:true});},[authLoading,user,mode,next,navigate]);
 const submit=async(event:FormEvent)=>{event.preventDefault();setError('');setMessage('');setBusy(true);
 try{
  if(mode==='forgot'){
   if(!z.string().trim().email().safeParse(email).success)throw new Error('Isi alamat email yang valid.');
   const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin+'/learn/auth?mode=reset'});if(error)throw error;
   setMessage('Jika akun tersebut terdaftar, tautan pemulihan akan dikirim. Periksa inbox dan spam.');
  }else if(mode==='reset'){
   if(!user)throw new Error('Buka halaman ini melalui tautan pemulihan pada email.');
   if(password.length<8||password.length>72||password!==confirm)throw new Error('Kata sandi minimal 8 karakter dan konfirmasinya harus sama.');
   const {error}=await supabase.auth.updateUser({password});if(error)throw error;navigate('/learn/dashboard',{replace:true});
  }else{
   const result=credentials.safeParse({email,password});if(!result.success)throw new Error(result.error.issues[0].message);
   if(mode==='signup'){
    if(name.trim().length<2||name.trim().length>100)throw new Error('Nama lengkap harus 2–100 karakter.');
    if(password!==confirm)throw new Error('Konfirmasi kata sandi tidak cocok.');
    const {data,error}=await supabase.auth.signUp({email:result.data.email!,password:result.data.password!,options:{emailRedirectTo:callback,data:{full_name:name.trim()}}});if(error)throw error;
    if(data.session)navigate(next,{replace:true});else setMessage('Periksa email untuk mengonfirmasi pendaftaran, lalu kembali masuk. Jika email sudah terdaftar, gunakan Masuk atau Lupa kata sandi.');
   }else{const {error}=await supabase.auth.signInWithPassword({email:result.data.email!,password:result.data.password!});if(error)throw error;navigate(next,{replace:true});}
  }
 }catch(err){setError(err instanceof Error?err.message:'Autentifikasi belum berhasil. Coba lagi.');}finally{setBusy(false);}};
 const google=async()=>{setBusy(true);setError('');try{const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:callback}});if(error)throw error;}catch(err){setError(err instanceof Error?err.message:'Google belum dapat dihubungi.');setBusy(false);}};
 return <main className="learn-scope grid min-h-screen place-items-center bg-secondary/40 px-4 py-12"><div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-9">
 <Link to="/learn" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4"/>Kembali ke Learn</Link>
 <GraduationCap className="mt-8 h-10 w-10 text-primary"/><p className="mt-4 text-xs font-semibold uppercase tracking-widest text-primary">Satu Langkah Learn</p>
 <h1 className="mt-2 text-2xl font-bold">{mode==='signup'?'Mulai langkah belajarmu':mode==='forgot'?'Pulihkan akun':mode==='reset'?'Atur kata sandi baru':'Selamat datang kembali'}</h1>
 <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Satu akun untuk Books dan Learn. Daftar gratis untuk menyimpan progres dan catatan belajarmu.</p>
 {(mode==='login'||mode==='signup')&&<><Button type="button" variant="outline" className="mt-6 w-full rounded-xl" onClick={google} disabled={busy}>Lanjutkan dengan Google</Button><p className="my-5 text-center text-xs text-muted-foreground">atau gunakan email</p></>}
 <form onSubmit={submit} className="space-y-4">
 {mode==='signup'&&<div className="space-y-2"><Label htmlFor="learn-name">Nama lengkap</Label><Input id="learn-name" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)}/></div>}
 {mode!=='reset'&&<div className="space-y-2"><Label htmlFor="learn-email">Email</Label><Input id="learn-email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div>}
 {mode!=='forgot'&&<div className="space-y-2"><Label htmlFor="learn-password">Kata sandi</Label><Input id="learn-password" type="password" autoComplete={mode==='login'?'current-password':'new-password'} minLength={8} maxLength={72} required value={password} onChange={e=>setPassword(e.target.value)}/></div>}
 {(mode==='signup'||mode==='reset')&&<div className="space-y-2"><Label htmlFor="learn-confirm">Konfirmasi kata sandi</Label><Input id="learn-confirm" type="password" autoComplete="new-password" required value={confirm} onChange={e=>setConfirm(e.target.value)}/></div>}
 {error&&<p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}{message&&<p role="status" className="rounded-xl bg-secondary p-3 text-sm">{message}</p>}
 <Button disabled={busy} className="w-full rounded-xl" type="submit">{busy&&<Loader2 className="mr-2 h-4 w-4 animate-spin"/>}{mode==='signup'?'Buat akun gratis':mode==='forgot'?'Kirim tautan pemulihan':mode==='reset'?'Simpan kata sandi':'Masuk'}</Button>
 </form>
 <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm"><button type="button" onClick={()=>{setMode(mode==='signup'?'login':'signup');setError('');setMessage('');}} className="text-primary">{mode==='signup'?'Sudah punya akun? Masuk':'Belum punya akun? Daftar'}</button>{mode==='login'&&<button type="button" onClick={()=>{setMode('forgot');setError('');setMessage('');}} className="text-muted-foreground">Lupa kata sandi?</button>}</div>
 </div></main>;
}
