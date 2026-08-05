import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import LearnLayout from "../components/LearnLayout";
import CourseCard from "../components/CourseCard";
import { categories, courses } from "../data";
import { courseProgress, useProgress } from "../useProgress";
import { cn } from "@/lib/utils";

const levels = ["Semua", "Pemula", "Menengah", "Lanjutan"] as const;

const Courses = () => {
  const [params, setParams] = useSearchParams();
  const { state, toggleWishlist } = useProgress();
  const [level, setLevel] = useState<(typeof levels)[number]>("Semua");

  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "Semua";

  const filtered = useMemo(
    () =>
      courses.filter((c) => {
        const matchQ =
          !q ||
          `${c.title} ${c.subtitle} ${c.category} ${c.instructor}`.toLowerCase().includes(q.toLowerCase());
        const matchCat = category === "Semua" || c.category === category;
        const matchLevel = level === "Semua" || c.level === level;
        return matchQ && matchCat && matchLevel;
      }),
    [q, category, level]
  );

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === "Semua") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  return (
    <LearnLayout>
      <section className="learn-soft-bg border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold sm:text-4xl">Semua Kursus</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Pilih kelas sesuai minat dan tingkat pengalamanmu. Semua kelas bisa diakses selamanya.
          </p>
          <div className="mt-8 flex max-w-xl items-center gap-2 rounded-full border border-border bg-background px-5 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setParam("q", e.target.value)}
              placeholder="Cari kursus…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="lg:w-64 lg:shrink-0">
            <div className="learn-card p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal className="h-4 w-4 text-primary" /> Filter
              </h2>

              <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Kategori</p>
              <div className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:items-start">
                {["Semua", ...categories.map((c) => c.name)].map((c) => (
                  <button
                    key={c}
                    onClick={() => setParam("category", c)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                      category === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <p className="mt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">Tingkat</p>
              <div className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:items-start">
                {levels.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                      level === l ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <p className="mb-5 text-sm text-muted-foreground">{filtered.length} kursus ditemukan</p>
            {filtered.length ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((c) => (
                  <CourseCard
                    key={c.slug}
                    course={c}
                    percent={courseProgress(state, c).percent}
                    wishlisted={state.wishlist.includes(c.slug)}
                    onWishlist={toggleWishlist}
                  />
                ))}
              </div>
            ) : (
              <div className="learn-card p-14 text-center">
                <p className="text-sm text-muted-foreground">Tidak ada kursus yang cocok dengan filter ini.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </LearnLayout>
  );
};

export default Courses;