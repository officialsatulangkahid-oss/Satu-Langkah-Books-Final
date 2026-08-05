import { Link, useParams } from "react-router-dom";
import { Award, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import LearnLayout from "../components/LearnLayout";
import { getCourse } from "../data";
import { courseProgress, useProgress } from "../useProgress";
import NotFound from "@/pages/NotFound";

const Certificate = () => {
  const { slug } = useParams();
  const course = getCourse(slug);
  const { state } = useProgress();

  if (!course) return <NotFound />;

  const { percent } = courseProgress(state, course);
  const id = `SL-${course.slug.slice(0, 6).toUpperCase()}-${String(percent).padStart(3, "0")}`;

  return (
    <LearnLayout>
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        {percent < 100 ? (
          <div className="learn-card p-12 text-center">
            <Award className="mx-auto h-10 w-10 text-primary/50" />
            <h1 className="mt-4 text-2xl font-bold">Sertifikat belum tersedia</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Progres kursus kamu {percent}%. Selesaikan seluruh pelajaran untuk membuka sertifikat.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to={`/learn/course/${course.slug}`}>Lanjutkan Belajar</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-3xl border-2 border-primary/25 bg-card p-10 text-center sm:p-14">
              <Award className="mx-auto h-12 w-12 text-primary" />
              <p className="mt-6 text-xs uppercase tracking-[0.3em] text-muted-foreground">Sertifikat Penyelesaian</p>
              <h1 className="mt-6 text-3xl font-bold sm:text-4xl">{state.studentName}</h1>
              <p className="mt-4 text-sm text-muted-foreground">telah menyelesaikan kursus</p>
              <p className="mt-2 text-xl font-semibold text-primary">{course.title}</p>
              <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
                <span>ID: {id}</span>
                <span>Satu Langkah Learn</span>
                <span>{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button className="rounded-full" onClick={() => window.print()}>
                <Download className="mr-2 h-4 w-4" /> Unduh Sertifikat
              </Button>
              <Button variant="outline" className="rounded-full" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                <Share2 className="mr-2 h-4 w-4" /> Salin Tautan
              </Button>
            </div>
          </>
        )}
      </section>
    </LearnLayout>
  );
};

export default Certificate;