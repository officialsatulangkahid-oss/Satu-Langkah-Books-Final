import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  ListTree,
  PlayCircle,
  Quote,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import LearnTopbar from "../components/LearnTopbar";
import Curriculum from "../components/Curriculum";
import Quiz from "../components/Quiz";
import { allLessons, getCourse } from "../data";
import { courseProgress, useProgress } from "../useProgress";
import NotFound from "@/pages/NotFound";

const Lesson = () => {
  const { slug, lessonId } = useParams();
  const navigate = useNavigate();
  const course = getCourse(slug);
  const { state, toggleLesson, saveQuiz, saveNote } = useProgress();
  const [drawer, setDrawer] = useState(false);

  if (!course) return <NotFound />;

  const lessons = allLessons(course);
  const index = Math.max(0, lessons.findIndex((l) => l.id === lessonId));
  const lesson = lessons[index];
  const completed = state.completed[course.slug] ?? [];
  const isDone = completed.includes(lesson.id);
  const { percent } = courseProgress(state, course);
  const noteKey = `${course.slug}:${lesson.id}`;

  const go = (i: number) => {
    const target = lessons[i];
    if (target) navigate(`/learn/course/${course.slug}/lesson/${target.id}`);
  };

  const finishAndNext = () => {
    if (!isDone) toggleLesson(course.slug, lesson.id, lesson.minutes);
    if (index + 1 < lessons.length) go(index + 1);
    else navigate(`/learn/certificate/${course.slug}`);
  };

  return (
    <div className="learn-scope min-h-screen bg-background">
      <LearnTopbar onMenu={() => setDrawer(true)} />

      <div className="mx-auto max-w-[1500px] lg:flex">
        {/* Main */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Link
            to={`/learn/course/${course.slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke halaman kursus
          </Link>

          <div className="mt-4 overflow-hidden rounded-2xl bg-foreground">
            <div className="relative grid aspect-video place-items-center">
              <img
                src={course.cover}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover opacity-35"
              />
              <div className="relative text-center text-background">
                <PlayCircle className="mx-auto h-16 w-16 opacity-90" />
                <p className="mt-3 text-sm font-medium">{lesson.title}</p>
                <p className="text-xs opacity-70">{lesson.duration}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{lesson.chapterTitle}</p>
              <h1 className="mt-1 truncate text-xl font-bold sm:text-2xl">{lesson.title}</h1>
            </div>
            <button
              onClick={() => setDrawer(true)}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium lg:hidden"
            >
              <ListTree className="h-4 w-4" /> Kurikulum
            </button>
            <Button
              variant={isDone ? "outline" : "default"}
              className="rounded-full"
              onClick={() => toggleLesson(course.slug, lesson.id, lesson.minutes)}
            >
              <Check className="mr-2 h-4 w-4" />
              {isDone ? "Selesai" : "Tandai Selesai"}
            </Button>
          </div>

          <div className="mt-6">
            <Tabs defaultValue="materi">
              <TabsList className="rounded-full bg-muted p-1">
                <TabsTrigger value="materi" className="rounded-full text-xs sm:text-sm">Materi</TabsTrigger>
                <TabsTrigger value="transkrip" className="rounded-full text-xs sm:text-sm">Transkrip</TabsTrigger>
                <TabsTrigger value="catatan" className="rounded-full text-xs sm:text-sm">Catatan</TabsTrigger>
                {lesson.hasQuiz && (
                  <TabsTrigger value="kuis" className="rounded-full text-xs sm:text-sm">Kuis</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="materi" className="mt-6 space-y-8">
                <section>
                  <h2 className="text-lg font-semibold">Ringkasan Pelajaran</h2>
                  <p className="mt-3 text-sm leading-[1.85] text-muted-foreground">{lesson.overview}</p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold">Tujuan Pembelajaran</h2>
                  <ul className="mt-3 space-y-2.5">
                    {lesson.objectives.map((o) => (
                      <li key={o} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {o}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2 className="text-lg font-semibold">Poin Penting</h2>
                  <div className="mt-3 space-y-3">
                    {lesson.summary.map((s) => (
                      <p key={s} className="text-sm leading-[1.85] text-muted-foreground">{s}</p>
                    ))}
                  </div>
                </section>

                {lesson.quotes.map((q) => (
                  <blockquote key={q.text} className="rounded-2xl border-l-4 border-primary bg-secondary/60 p-6">
                    <Quote className="h-5 w-5 text-primary/50" />
                    <p className="mt-3 text-sm italic leading-relaxed">"{q.text}"</p>
                    <footer className="mt-3 text-xs font-medium text-muted-foreground">— {q.author}</footer>
                  </blockquote>
                ))}

                <section className="learn-card p-6">
                  <h2 className="text-sm font-semibold">Yang perlu diingat</h2>
                  <ul className="mt-3 space-y-2">
                    {lesson.takeaways.map((t) => (
                      <li key={t} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-2xl bg-secondary/60 p-6">
                  <h2 className="text-sm font-semibold">Latihan Refleksi</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{lesson.reflection}</p>
                </section>

                <Button variant="outline" className="rounded-full">
                  <Download className="mr-2 h-4 w-4" /> Unduh ringkasan (PDF)
                </Button>
              </TabsContent>

              <TabsContent value="transkrip" className="mt-6 space-y-4">
                {lesson.transcript.map((t) => (
                  <p key={t} className="text-sm leading-[1.9] text-muted-foreground">{t}</p>
                ))}
              </TabsContent>

              <TabsContent value="catatan" className="mt-6">
                <Textarea
                  value={state.notes[noteKey] ?? ""}
                  onChange={(e) => saveNote(noteKey, e.target.value)}
                  placeholder="Tulis catatanmu tentang pelajaran ini…"
                  className="min-h-[220px] rounded-2xl text-sm leading-relaxed"
                />
                <p className="mt-2 text-xs text-muted-foreground">Catatan tersimpan otomatis di perangkat ini.</p>
              </TabsContent>

              {lesson.hasQuiz && (
                <TabsContent value="kuis" className="mt-6">
                  <Quiz
                    questions={course.quiz}
                    onFinish={(score, total) => saveQuiz(`${course.slug}:${lesson.id}`, score, total)}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>

          <nav className="mt-10 flex items-center justify-between gap-3 border-t border-border pt-6">
            <Button variant="outline" className="rounded-full" disabled={index === 0} onClick={() => go(index - 1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Sebelumnya
            </Button>
            <Button className="rounded-full" onClick={finishAndNext}>
              {index + 1 < lessons.length ? "Selesai & Lanjut" : "Selesaikan Kursus"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </nav>
        </main>

        {/* Desktop sidebar */}
        <aside className="learn-scroll hidden w-[360px] shrink-0 overflow-y-auto border-l border-border p-6 lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-4rem)]">
          <h2 className="text-sm font-semibold">Kurikulum</h2>
          <div className="mt-3">
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>Progres kursus</span>
              <span className="font-medium text-primary">{percent}%</span>
            </div>
            <Progress value={percent} className="h-1.5" />
          </div>
          <div className="mt-5">
            <Curriculum
              course={course}
              completed={completed}
              activeLessonId={lesson.id}
              onSelect={(id) => navigate(`/learn/course/${course.slug}/lesson/${id}`)}
            />
          </div>
        </aside>
      </div>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setDrawer(false)} />
          <div className={cn("learn-scroll absolute right-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto bg-background p-5")}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Kurikulum</h2>
              <button onClick={() => setDrawer(false)} className="rounded-full p-2 hover:bg-muted" aria-label="Tutup">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5">
              <Curriculum
                course={course}
                completed={completed}
                activeLessonId={lesson.id}
                onSelect={(id) => {
                  setDrawer(false);
                  navigate(`/learn/course/${course.slug}/lesson/${id}`);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lesson;