import { Link, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import LearnLayout from "../components/LearnLayout";
import { getCourse } from "../data";
import { courseProgress, useProgress } from "../useProgress";
import NotFound from "@/pages/NotFound";
export default function Certificate(){const {slug}=useParams();const course=getCourse(slug);const {state}=useProgress();if(!course)return <NotFound/>;const progress=courseProgress(state,course);
 return <LearnLayout><section className="mx-auto max-w-3xl px-4 py-16"><div className="learn-card p-8 text-center sm:p-12"><CheckCircle2 className="mx-auto h-12 w-12 text-primary"/><h1 className="mt-5 text-3xl font-bold">{progress.percent===100?'Langkah belajarmu selesai':'Lanjutkan langkah belajarmu'}</h1><p className="mt-5 text-lg font-semibold">{state.studentName}</p><p className="mt-2 text-primary">{course.title}</p><p className="mt-4 text-sm text-muted-foreground">{progress.done} dari {progress.total} pelajaran ditandai selesai.</p><p className="mt-5 text-sm leading-relaxed text-muted-foreground">Ini ringkasan belajar mandiri berdasarkan progres yang kamu tandai. Belum ada penilaian mentor, sertifikat kompetensi, atau tautan verifikasi publik.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Button asChild variant="outline"><Link to={`/learn/course/${course.slug}`}>Kembali ke kursus</Link></Button>{progress.percent===100&&<Button onClick={()=>window.print()}>Cetak ringkasan</Button>}</div></div></section></LearnLayout>;
}
