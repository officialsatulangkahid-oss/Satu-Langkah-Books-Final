import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  GraduationCap,
  Moon,
  PenLine,
  PlayCircle,
  Quote,
  Sprout,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import LearnLayout from "../components/LearnLayout";
import CourseCard from "../components/CourseCard";
import { categories, courses, faqs, testimonials } from "../data";
import { courseProgress, useProgress } from "../useProgress";

const icons: Record<string, typeof BookOpen> = {
  BookOpen,
  Moon,
  PenLine,
  Sprout,
  GraduationCap,
  Compass,
};

const steps = [
  { title: "Pilih kursus", desc: "Telusuri kategori dan temukan kelas yang sesuai ritme belajarmu." },
  { title: "Belajar bertahap", desc: "Ikuti bab demi bab dengan video, bacaan, dan kuis singkat." },
  { title: "Dapatkan sertifikat", desc: "Selesaikan seluruh pelajaran dan unduh sertifikatmu." },
];

const Landing = () => {
  const { state, toggleWishlist } = useProgress();
  const [email, setEmail] = useState("");

  return (
    <LearnLayout>
      {/* Hero */}
      <section className="learn-mesh relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary px-4 py-1.5 text-xs font-medium text-primary">
              <Sprout className="h-3.5 w-3.5" /> Platform belajar Satu Langkah Books
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.12] sm:text-5xl lg:text-[3.4rem]">
              Belajar Membaca, Berpikir, dan Menulis{" "}
              <span className="text-primary">Satu Langkah</span> Setiap Hari
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              Kelas online yang tenang dan terstruktur untuk memperdalam literasi, tradisi keilmuan Islam,
              dan kebiasaan belajar yang bertahan lama.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link to="/learn/courses">
                  Mulai Belajar <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-7">
                <Link to="/learn/course/how-to-read-a-book">
                  <PlayCircle className="mr-2 h-4 w-4" /> Lihat Kelas Unggulan
                </Link>
              </Button>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
              {[
                { label: "Pelajar aktif", value: "3.100+" },
                { label: "Kelas tersedia", value: "42" },
                { label: "Rating rata-rata", value: "4.9" },
              ].map((s) => (
                <div key={s.label}>
                  <dt className="text-2xl font-bold text-primary">{s.value}</dt>
                  <dd className="mt-1 text-xs text-muted-foreground">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="learn-card overflow-hidden p-0">
              <img
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80"
                alt="Pelajar sedang membaca di ruang belajar yang tenang"
                className="h-[380px] w-full object-cover lg:h-[460px]"
              />
            </div>
            <div className="absolute -bottom-6 -left-4 hidden w-60 rounded-2xl border border-border bg-background p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
                  <Award className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Sertifikat resmi</p>
                  <p className="text-xs text-muted-foreground">Setelah progres 100%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <h2 className="text-3xl font-bold">Jelajahi Kategori</h2>
          <p className="mt-3 text-muted-foreground">Temukan jalur belajar yang paling dekat dengan kebutuhanmu.</p>
        </header>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const Icon = icons[c.icon] ?? BookOpen;
            return (
              <Link key={c.name} to={`/learn/courses?category=${encodeURIComponent(c.name)}`} className="learn-card group flex items-center gap-4 p-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{c.desc} · {c.count} kelas</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured courses */}
      <section className="learn-soft-bg py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">Kursus Pilihan</h2>
              <p className="mt-3 text-muted-foreground">Kelas paling banyak diikuti pelajar Satu Langkah.</p>
            </div>
            <Link to="/learn/courses" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              Lihat semua <ArrowRight className="h-4 w-4" />
            </Link>
          </header>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((c) => (
              <CourseCard
                key={c.slug}
                course={c}
                percent={courseProgress(state, c).percent}
                wishlisted={state.wishlist.includes(c.slug)}
                onWishlist={toggleWishlist}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Cara Kerjanya</h2>
          <p className="mt-3 text-muted-foreground">Tiga langkah sederhana menuju kebiasaan belajar yang konsisten.</p>
        </header>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="learn-card p-7">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="learn-soft-bg py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Kata Para Pelajar</h2>
            <p className="mt-3 text-muted-foreground">Cerita mereka yang belajar bersama Satu Langkah.</p>
          </header>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="learn-card p-7">
                <Quote className="h-6 w-6 text-primary/40" />
                <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">"{t.text}"</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-xs font-semibold text-primary">
                    {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <Star className="h-3.5 w-3.5 fill-current" /> {t.rating}.0
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <header className="text-center">
          <h2 className="text-3xl font-bold">Pertanyaan Umum</h2>
          <p className="mt-3 text-muted-foreground">Hal-hal yang sering ditanyakan sebelum mulai belajar.</p>
        </header>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q} className="border-border">
              <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground">
          <Users className="mx-auto h-8 w-8 opacity-80" />
          <h2 className="mt-5 text-3xl font-bold text-primary-foreground">Mulai perjalanan belajarmu hari ini</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-primary-foreground/85">
            Dapatkan info kelas baru, materi gratis, dan panduan membaca langsung ke emailmu.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setEmail("");
            }}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-5 py-3 text-sm text-primary-foreground outline-none placeholder:text-primary-foreground/60 focus:border-primary-foreground/60"
            />
            <button
              type="submit"
              className="rounded-full bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary transition-transform hover:scale-[1.02]"
            >
              Daftar
            </button>
          </form>
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-primary-foreground/75">
            <CheckCircle2 className="h-3.5 w-3.5" /> Gratis, dan bisa berhenti kapan saja.
          </p>
        </div>
      </section>
    </LearnLayout>
  );
};

export default Landing;