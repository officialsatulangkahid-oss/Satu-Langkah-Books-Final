import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Clock,
  Download,
  Heart,
  Infinity as InfinityIcon,
  PlayCircle,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import LearnLayout from "../components/LearnLayout";
import Curriculum from "../components/Curriculum";
import CourseCard from "../components/CourseCard";
import { allLessons, courses, getCourse } from "../data";
import { courseProgress, useProgress } from "../useProgress";
import NotFound from "@/pages/NotFound";

const CourseDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const course = getCourse(slug);
  const { state, toggleWishlist, ready, enrollCourse } = useProgress();

  const { user } = useAuth();

  if (!course) return <NotFound />;

  const completed = state.completed[course.slug] ?? [];
  const { percent, done, total } = courseProgress(state, course);
  const lessons = allLessons(course);
  const nextLesson = lessons.find((l) => !completed.includes(l.id)) ?? lessons[0];
  const related = courses.filter((c) => c.slug !== course.slug).slice(0, 3);

  return (
    <LearnLayout>
      {/* Hero */}
      <section className="learn-soft-bg border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
          <div>
            <nav className="text-xs text-muted-foreground">
              <Link to="/learn" className="hover:text-primary">Beranda</Link>
              <span className="mx-2">/</span>
              <Link to="/learn/courses" className="hover:text-primary">Kursus</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{course.title}</span>
            </nav>

            <span className="mt-6 inline-block rounded-full bg-secondary px-3 py-1 text-[11px] font-medium text-primary">
              {course.category} · {course.level}
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">{course.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{course.description}</p>

            <div className="mt-6 flex flex-wrap gap-5 text-sm text-muted-foreground"><span>{course.level} · Belajar mandiri</span><span>{course.duration}</span><span>{total} pelajaran</span></div>

            <div className="mt-6 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                SL
              </span>
              <div>
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
                  {course.instructor} <BadgeCheck className="h-4 w-4 text-primary" />
                </p>
                <p className="text-xs text-muted-foreground">{course.instructorRole}</p>
              </div>
            </div>
          </div>

          {/* Sticky enroll card */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="learn-card overflow-hidden p-0">
              <div className="relative aspect-video bg-muted">
                <img src={course.cover} alt={`Sampul ${course.title}`} className="h-full w-full object-cover" />
                <span className="absolute inset-0 grid place-items-center bg-foreground/20">
                  <PlayCircle className="h-14 w-14 text-background" />
                </span>
              </div>
              <div className="p-6">
                <p className="text-2xl font-bold text-primary">{course.price}</p>

                {percent > 0 && (
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                      <span>{done} dari {total} pelajaran</span>
                      <span className="font-medium text-primary">{percent}%</span>
                    </div>
                    <Progress value={percent} className="h-2" />
                  </div>
                )}

                <Button
                  className="mt-5 w-full rounded-full"
                  size="lg"
                  disabled={!!user && !ready}
                  onClick={() => { if (!user) { navigate(`/learn/auth?next=${encodeURIComponent(`/learn/course/${course.slug}`)}`); return; } enrollCourse(course.slug); navigate(`/learn/course/${course.slug}/lesson/${nextLesson.id}`); }}
                >
                  {!user ? "Masuk & ikuti gratis" : !ready ? "Memuat akun…" : state.enrolled.includes(course.slug) ? "Lanjutkan Belajar" : "Ikuti kelas gratis"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="mt-3 w-full rounded-full"
                  onClick={() => toggleWishlist(course.slug)}
                >
                  <Heart className={cn("mr-2 h-4 w-4", state.wishlist.includes(course.slug) && "fill-primary text-primary")} />
                  {state.wishlist.includes(course.slug) ? "Tersimpan di Wishlist" : "Simpan ke Wishlist"}
                </Button>

                <ul className="mt-6 space-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
                  {course.includes.map((i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {i}
                    </li>
                  ))}
                  <li className="flex items-start gap-2.5">
                    <InfinityIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Akses materi selama kelas tersedia
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Download className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Ringkasan & brief dalam format teks
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Ringkasan penyelesaian mandiri
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Curriculum + outcomes */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
        <div>
          <h2 className="text-2xl font-bold">Apa yang akan kamu pelajari</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {[...new Set(lessons.flatMap(l => l.objectives))].filter((_, i) => i % 3 === 0).map((o) => (
              <li key={o} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {o}
              </li>
            ))}
          </ul>

          <h2 className="mt-14 text-2xl font-bold">Kurikulum</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {course.chapters.length} bab · {total} pelajaran · {course.duration}
          </p>
          <div className="mt-6">
            <Curriculum
              course={course}
              completed={completed}
              onSelect={(id) => { if (!user) { navigate(`/learn/auth?next=${encodeURIComponent(`/learn/course/${course.slug}`)}`); return; } if (!ready) return; enrollCourse(course.slug); navigate(`/learn/course/${course.slug}/lesson/${id}`); }}
            />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="learn-card p-6">
            <h3 className="text-sm font-semibold">Tentang kurasi & sumber</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Kurikulum, panduan, kuis, dan latihan disusun Tim Satu Langkah. Video berasal dari kanal LearnFree dan Gareth David Studio, diputar melalui YouTube dengan atribusi. Kelas ini bukan afiliasi resmi dengan kreator dan belum menyediakan review mentor.
            </p>
          </div>
          <div className="learn-card p-6">
            <h3 className="text-sm font-semibold">Estimasi waktu</h3>
            <p className="mt-3 text-sm text-muted-foreground">{course.readingTime}</p>
            <p className="mt-1 text-sm text-muted-foreground">{course.duration}</p>
          </div>
        </aside>
      </section>

      {/* Related */}
      {related.length > 0 && <section className="learn-soft-bg py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">Kursus lain yang mungkin cocok</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <CourseCard key={c.slug} course={c} percent={courseProgress(state, c).percent} />
            ))}
          </div>
        </div>
      </section>}
    </LearnLayout>
  );
};

export default CourseDetail;