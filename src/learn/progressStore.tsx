import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { courses, allLessons } from "./data";
import { emptyProgress, normalizeProgress, courseProgress, type ProgressState } from "./progressModel";
type Store={ state:ProgressState; ready:boolean; error:string; saving:boolean; update:(fn:(s:ProgressState)=>ProgressState)=>void; retry:()=>void; flush:()=>Promise<boolean> };
const Context=createContext<Store|null>(null);
export function LearnProgressProvider({children}:{children:ReactNode}) {
 const {user}=useAuth(); const {pathname}=useLocation(); const active=pathname.startsWith('/learn');
 const [snapshot,setSnapshot]=useState({owner:"",state:emptyProgress(),ready:false});
 const [error,setError]=useState(""); const [saving,setSaving]=useState(false); const [attempt,setAttempt]=useState(0);
 const current=useRef(snapshot); const dirty=useRef(false); const queue=useRef(Promise.resolve(true));
 const owner=useRef(user?.id??""); owner.current=user?.id??"";
 const name=String(user?.user_metadata?.full_name || user?.user_metadata?.name || "Pembelajar Satu Langkah");
 useEffect(()=>{
  if(!active)return; let alive=true; const uid=user?.id??"";
  dirty.current=false; setError(""); setSaving(false);
  const reset={owner:uid,state:emptyProgress(name),ready:!uid};current.current=reset;setSnapshot(reset);
  if(uid) Promise.resolve(supabase.from('learn_progress').select('state').eq('user_id',uid).maybeSingle()).then(({data,error:failure})=>{
   if(!alive)return; if(failure){setError('Progres belum dapat dimuat. Pastikan SQL Learn sudah dipasang, lalu coba lagi.');return;}
   const next={owner:uid,state:normalizeProgress(data?.state,name),ready:true};current.current=next;setSnapshot(next);
  }).catch(()=>{if(alive)setError('Koneksi progres terputus. Coba lagi.');});
  return()=>{alive=false;};
 // A new user must never inherit the previous user's in-memory state.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[user?.id,active,attempt]);
 const flush=useCallback(async()=>{
  const value=current.current; const uid=owner.current;
  if(!uid||value.owner!==uid||!value.ready||!dirty.current)return queue.current;
  const serialized=JSON.stringify(value.state);setSaving(true);
  queue.current=queue.current.catch(()=>false).then(async()=>{
   const {error:failure}=await supabase.from('learn_progress').upsert({user_id:uid,state:JSON.parse(serialized) as Json},{onConflict:'user_id'});
   if(owner.current!==uid)return !failure;
   setSaving(false);
   if(failure){setError('Perubahan belum tersimpan di akun. Periksa koneksi lalu tekan Coba lagi.');return false;}
   if(JSON.stringify(current.current.state)===serialized)dirty.current=false;
   setError('');return true;
  }).catch(()=>{if(owner.current===uid){setSaving(false);setError('Perubahan belum tersimpan. Coba lagi.');}return false;});
  return queue.current;
 },[]);
 const update=useCallback((fn:(s:ProgressState)=>ProgressState)=>{
  const now=current.current;if(!owner.current||now.owner!==owner.current||!now.ready)return;
  const next={...now,state:fn(now.state)};current.current=next;dirty.current=true;setSnapshot(next);
 },[]);
 useEffect(()=>{if(!dirty.current)return;const timer=setTimeout(()=>void flush(),800);return()=>clearTimeout(timer);},[snapshot,flush]);
 useEffect(()=>{const warn=(event:BeforeUnloadEvent)=>{if(dirty.current){event.preventDefault();event.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[]);
 const uid=user?.id??""; const belongs=snapshot.owner===uid;
 return <Context.Provider value={{state:belongs?snapshot.state:emptyProgress(name),ready:belongs&&snapshot.ready,error,saving:saving||dirty.current,update,flush,retry:()=>{if(current.current.ready)void flush();else setAttempt(a=>a+1);}}}>{children}</Context.Provider>;
}
export function useProgress(){
 const ctx=useContext(Context);const {user}=useAuth();const navigate=useNavigate();if(!ctx)throw new Error('LearnProgressProvider missing');
 const {state,update}=ctx;
 const toggleLesson=(slug:string,id:string)=>update(s=>{const c=courses.find(c=>c.slug===slug);if(!c||!s.enrolled.includes(slug)||!allLessons(c).some(l=>l.id===id))return s;const list=s.completed[slug]??[];const next=list.includes(id)?list.filter(x=>x!==id):[...list,id];const day=new Date().toLocaleDateString('en-CA');const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);return {...s,completed:{...s.completed,[slug]:next},minutes:{...s.minutes,[slug]:allLessons(c).filter(l=>next.includes(l.id)).reduce((n,l)=>n+l.minutes,0)},lastActive:day,streak:s.lastActive===day?s.streak:s.lastActive===yesterday.toLocaleDateString('en-CA')?s.streak+1:1};});
 return {...ctx,toggleLesson,
 enrollCourse:(slug:string)=>update(s=>({...s,enrolled:[...new Set([...s.enrolled,slug])],recent:[slug,...s.recent.filter(x=>x!==slug)].slice(0,6)})),
 markViewed:(slug:string)=>update(s=>({...s,recent:[slug,...s.recent.filter(x=>x!==slug)].slice(0,6)})),
 saveQuiz:(key:string,score:number,total:number)=>update(s=>({...s,quizScores:{...s.quizScores,[key]:{score,total}}})),
 toggleWishlist:(slug:string)=>{if(!user){navigate('/learn/auth?next='+encodeURIComponent('/learn/course/'+slug));return;}update(s=>({...s,wishlist:s.wishlist.includes(slug)?s.wishlist.filter(x=>x!==slug):[...s.wishlist,slug]}));},
 saveNote:(key:string,value:string)=>update(s=>({...s,notes:{...s.notes,[key]:value.slice(0,10000)}})),
 setStudentName:(studentName:string)=>update(s=>({...s,studentName:studentName.slice(0,100)})),
 enrolled:courses.filter(c=>state.enrolled.includes(c.slug)),
 totalMinutes:Object.values(state.minutes).reduce((a,b)=>a+b,0),totalLessons:courses.reduce((sum,c)=>sum+courseProgress(state,c).done,0),
 certificates:courses.filter(c=>state.enrolled.includes(c.slug)&&courseProgress(state,c).percent===100),
 };
}
