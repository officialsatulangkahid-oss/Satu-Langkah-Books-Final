import { Link, NavLink, useParams } from "react-router-dom";
import { Award, BookOpen, Clock, Flame, Heart, LayoutDashboard, NotebookPen, Trophy, User } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import LearnLayout from "../components/LearnLayout";
import CourseCard from "../components/CourseCard";
import { courses } from "../data";
import { courseProgress, useProgress } from "../useProgress";

const nav = [
  { to: "/learn/dashboard", label: "Ringkasan", icon: LayoutDashboard, end: true },
  { to: "/learn/dashboard/courses", label: "Kursus Saya", icon: BookOpen },
  { to: "/learn/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { to: "/learn/dashboard/certificates", label: "Sertifikat", icon: Award },
  { to: "/learn/dashboard/notes", label: "Catatan", icon: NotebookPen },
  { to: "/learn/dashboard/profile", label: "Profil", icon: User },
];

const Dashboard = () => {
  const { section } = useParams();
  const { state, totalMinutes, totalLessons, certificates, setStudentName, toggleWishlist } = useProgress();

  const inProgress = courses.filter((c) => (state.completed[c.slug]?.length ?? 0) > 0);
  const wishlist = courses.filter((c) => state.wishlist.includes(c.slug));
  const notes = Object.entries(state.notes).filter(([, v]) => v.trim());

  const stats = [
    { label: "Kursus berjalan", value: inProgress.length, icon: BookOpen },
    { label: "Pelajaran selesai", value: totalLessons, icon: Trophy },
    { label: "Menit belajar", value: totalMinutes, icon: Clock },
    { label: "Hari beruntun", value: state.streak, icon: Flame },
  ];

  return (
    <LearnLayout>
      <div className="mx-auto max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:flex lg:px-8">
        <aside className="lg:w-60 lg:shrink-0">
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-muted"
                  }`
                }
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="mt-8 min-w-0 flex-1 lg:mt-0">
          {!section && (
            <>
              <h1 className="text-2xl font-bold sm:text-3xl">Halo, {state.studentName.split(" ")[0]} 👋</h1>
              <p className="mt-2 text-sm text-muted-foreground">Lanjutkan belajarmu hari ini.</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="learn-card p-5">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
                      <s.icon className="h-4 w-4" />
                    </span>
                    <p className="mt-4 text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              <h2 className="mt-12 text-lg font-semibold">Lanjutkan Belajar</h2>
              <div className="mt-5 space-y-4">
                {inProgress.length ? (
                  inProgress.map((c) => {
                    const p = courseProgress(state, c);
                    return (
                      <Link key={c.slug} to={`/learn/course/${c.slug}`} className="learn-card flex items-center gap-4 p-4">
                        <img src={c.cover} alt="" className="h-16 w-24 shrink-0 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{c.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{p.done} dari {p.total} pelajaran</p>
                          <Progress value={p.percent} className="mt-2 h-1.5" />
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-primary">{p.percent}%</span>
                      </Link>
                    );
                  })
                ) : (
                  <div className="learn-card p-10 text-center text-sm text-muted-foreground">
                    Belum ada kursus berjalan. <Link to="/learn/courses" className="font-medium text-primary">Jelajahi kursus</Link>
                  </div>
                )}
              </div>

              <h2 className="mt-12 text-lg font-semibold">Rekomendasi untukmu</h2>
              <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {courses.slice(0, 3).map((c) => (
                  <CourseCard key={c.slug} course={c} percent={courseProgress(state, c).percent} />
                ))}
              </div>
            </>
          )}

          {section === "courses" && (
            <>
              <h1 className="text-2xl font-bold">Kursus Saya</h1>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {(inProgress.length ? inProgress : courses).map((c) => (
                  <CourseCard key={c.slug} course={c} percent={courseProgress(state, c).percent} />
                ))}
              </div>
            </>
          )}

          {section === "wishlist" && (
            <>
              <h1 className="text-2xl font-bold">Wishlist</h1>
              {wishlist.length ? (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {wishlist.map((c) => (
                    <CourseCard key={c.slug} course={c} wishlisted onWishlist={toggleWishlist} />
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm text-muted-foreground">Belum ada kursus tersimpan.</p>
              )}
            </>
          )}

          {section === "certificates" && (
            <>
              <h1 className="text-2xl font-bold">Sertifikat</h1>
              {certificates.length ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {certificates.map((c) => (
                    <Link key={c.slug} to={`/learn/certificate/${c.slug}`} className="learn-card flex items-center gap-4 p-5">
                      <Award className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm font-semibold">{c.title}</p>
                        <p className="text-xs text-muted-foreground">Lihat & unduh sertifikat</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm text-muted-foreground">
                  Selesaikan satu kursus hingga 100% untuk membuka sertifikat.
                </p>
              )}
            </>
          )}

          {section === "notes" && (
            <>
              <h1 className="text-2xl font-bold">Catatan</h1>
              {notes.length ? (
                <div className="mt-6 space-y-4">
                  {notes.map(([k, v]) => (
                    <div key={k} className="learn-card p-5">
                      <p className="text-xs text-muted-foreground">{k}</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{v}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm text-muted-foreground">Belum ada catatan.</p>
              )}
            </>
          )}

          {section === "profile" && (
            <>
              <h1 className="text-2xl font-bold">Profil</h1>
              <div className="learn-card mt-6 max-w-md p-6">
                <label className="text-sm font-medium">Nama pada sertifikat</label>
                <Input
                  value={state.studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="mt-2 rounded-xl"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Nama ini akan tercetak pada sertifikat penyelesaian kursus.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </LearnLayout>
  );
};

export default Dashboard;