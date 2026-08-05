import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const features = [
  {
    number: "01",
    title: "Artikel",
    description: "Kumpulan tulisan reflektif-edukatif berlandaskan pandangan Islam tentang ilmu, pendidikan, dan kehidupan.",
    link: "/articles",
  },
  {
    number: "02",
    title: "Proyek & E-Book",
    description: "E-Book dan learning tools untuk mendukung perjalanan belajar Anda.",
    link: "/project",
  },
  {
    number: "03",
    title: "Perpustakaan",
    description: "Tempat membaca dan menumbuhkan budaya ilmu.",
    link: "/library",
  },
];

const FeaturedSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-page">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div className="max-w-xl">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em]">
              Eksplorasi
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-heading mt-3 leading-tight">
              Mulai Perjalanan<br />Belajar Anda
            </h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-sm leading-relaxed lg:text-right">
            Setiap langkah kecil membawa Anda lebih dekat pada ilmu yang bermanfaat.
          </p>
        </div>

        {/* Feature Cards — clean horizontal list */}
        <div className="divide-y divide-border/60">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.link}
              className="group flex items-center gap-6 lg:gap-10 py-8 lg:py-10 transition-colors hover:bg-secondary/30 -mx-5 px-5 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12"
            >
              <span className="text-xs font-mono text-muted-foreground/50 hidden sm:block w-8">
                {feature.number}
              </span>
              <h3 className="text-xl lg:text-2xl font-bold text-heading min-w-[140px] lg:min-w-[200px]">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 hidden md:block">
                {feature.description}
              </p>
              <ArrowRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-1 transition-all flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
