import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, Menu, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProgress } from "../useProgress";
export default function LearnTopbar({onMenu}:{onMenu?:()=>void}) {
 const {user,loading,signOut}=useAuth();const {state,ready,error,saving,retry,flush}=useProgress();const [q,setQ]=useState('');const [leaving,setLeaving]=useState(false);const navigate=useNavigate();const {pathname}=useLocation();
 const links=[{to:'/learn',label:'Beranda',end:true},{to:'/learn/courses',label:'Kursus'},{to:'/learn/dashboard',label:'Belajar Saya'}];
 return <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
 {onMenu&&<button onClick={onMenu} aria-label="Buka kurikulum" className="p-2 lg:hidden"><Menu className="h-5 w-5"/></button>}
 <Link to="/learn" className="flex items-center gap-2 font-semibold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><GraduationCap className="h-5 w-5"/></span><span>Satu Langkah <span className="text-primary">Learn</span></span></Link>
 <nav className="order-3 flex w-full gap-1 overflow-x-auto md:order-none md:ml-4 md:w-auto">{links.map(l=><NavLink key={l.to} to={l.to} end={l.end} className={({isActive})=>`whitespace-nowrap rounded-full px-3 py-2 text-sm ${isActive?'bg-secondary text-primary':'text-muted-foreground'}`}>{l.label}</NavLink>)}</nav>
 <form className="ml-auto hidden max-w-xs items-center gap-2 rounded-full border px-3 py-2 xl:flex" onSubmit={e=>{e.preventDefault();navigate('/learn/courses?q='+encodeURIComponent(q));}}><Search className="h-4 w-4"/><input aria-label="Cari kursus" value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari kursus…" className="w-full bg-transparent text-sm outline-none"/></form>
 <div className="ml-auto flex items-center gap-3">{!loading&&(user?<><Link to="/learn/dashboard/profile" className="max-w-32 truncate text-xs font-medium">{ready?state.studentName:'Akun saya'}</Link><button disabled={leaving} aria-label="Keluar dari akun" onClick={async()=>{setLeaving(true);if(await flush()){await signOut();navigate('/learn');}setLeaving(false);}} className="rounded-full p-2 text-muted-foreground hover:bg-muted"><LogOut className="h-4 w-4"/></button></>:<Button asChild size="sm" className="rounded-full"><Link to={'/learn/auth?next='+encodeURIComponent(pathname==='/learn/auth'?'/learn/dashboard':pathname)}>Masuk / Daftar</Link></Button>)}</div>
 </div>{user&&<div aria-live="polite" className="border-t bg-secondary/40 px-4 py-1 text-center text-xs text-muted-foreground">{error?<>{error} <button onClick={retry} className="font-semibold underline">Coba lagi</button></>:!ready?'Memuat progres akun…':saving?'Menyimpan perubahan…':'Progres belajar pribadi tersinkron ke akun'}</div>}</header>;
}
