import { courses, allLessons, type Course } from "./data";
export type ProgressState = {
 enrolled: string[]; completed: Record<string,string[]>; quizScores: Record<string,{score:number;total:number}>;
 minutes: Record<string,number>; recent:string[]; wishlist:string[]; notes:Record<string,string>;
 streak:number; lastActive:string; studentName:string;
};
export const emptyProgress = (name = "Pembelajar Satu Langkah"): ProgressState => ({ enrolled:[],completed:{},quizScores:{},minutes:{},recent:[],wishlist:[],notes:{},streak:0,lastActive:"",studentName:name });
export function courseProgress(state:ProgressState, course:Course) {
 const lessons = allLessons(course); const done = lessons.filter(l => state.completed[course.slug]?.includes(l.id)).length;
 return {done,total:lessons.length,percent:lessons.length ? Math.round(done/lessons.length*100):0};
}
export function normalizeProgress(raw: unknown, name?:string): ProgressState {
 const base=emptyProgress(name); if (!raw || typeof raw !== "object" || Array.isArray(raw)) return base;
 const data=raw as Partial<ProgressState>;
 const strings=(v:unknown):string[]=>Array.isArray(v)?v.filter((x):x is string=>typeof x==="string").slice(0,100):[];
 const record=(v:unknown):Record<string,unknown>=>v&&typeof v==="object"&&!Array.isArray(v)?v as Record<string,unknown>:{};
 const completed:Record<string,string[]>={}; const minutes:Record<string,number>={};
 for(const c of courses) { completed[c.slug]=allLessons(c).filter(l=>strings(record(data.completed)[c.slug]).includes(l.id)).map(l=>l.id); minutes[c.slug]=allLessons(c).filter(l=>completed[c.slug].includes(l.id)).reduce((sum,l)=>sum+l.minutes,0); }
 return {...base,enrolled:strings(data.enrolled).filter(slug=>courses.some(c=>c.slug===slug)),completed,minutes,
 recent:strings(data.recent),wishlist:strings(data.wishlist),notes:Object.fromEntries(Object.entries(record(data.notes)).filter(([,v])=>typeof v==="string").map(([k,v])=>[k,String(v).slice(0,10000)])),
 quizScores:Object.fromEntries(Object.entries(record(data.quizScores)).filter(([,v])=>v&&typeof v==="object"&&Number.isFinite((v as {score:number}).score)&&Number.isFinite((v as {total:number}).total) && (v as {total:number}).total > 0 && (v as {score:number}).score >= 0 && (v as {score:number}).score <= (v as {total:number}).total)) as ProgressState["quizScores"],
 studentName:typeof data.studentName==="string"?data.studentName.slice(0,100):base.studentName,
 streak:Number.isInteger(data.streak)?Math.max(0,Number(data.streak)):0,lastActive:typeof data.lastActive==="string"?data.lastActive:""};
}
