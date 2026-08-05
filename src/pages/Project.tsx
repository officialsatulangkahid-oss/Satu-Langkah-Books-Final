import { Book, Wrench, Users, GraduationCap, ArrowRight } from "lucide-react";

const projects = [
  {
    id: "ebook-tauhid",
    title: "E-Book Seri Tauhid",
    description: "Koleksi e-book tentang tauhid yang disusun secara sistematis dan mudah dipahami.",
    icon: Book,
    status: "ongoing" as const,
    type: "E-Book",
  },
  {
    id: "learning-tools",
    title: "Learning Tools",
    description: "Berbagai alat bantu belajar digital seperti flashcard, mind map, dan worksheet.",
    icon: Wrench,
    status: "ongoing" as const,
    type: "Digital Tools",
  },
  {
    id: "program-literasi",
    title: "Program Literasi Komunitas",
    description: "Program membaca bersama dan diskusi buku untuk membangun komunitas pembelajar.",
    icon: Users,
    status: "ongoing" as const,
    type: "Program",
  },
  {
    id: "kelas-online",
    title: "Kelas Belajar Online",
    description: "Kelas online terstruktur dengan materi yang disusun oleh para pengajar berpengalaman.",
    icon: GraduationCap,
    status: "active" as const,
    type: "E-Course",
  },
];

const statusStyles = {
  active: "bg-muted text-muted-foreground",
  build: "bg-gold/10 text-gold",
  ongoing: "bg/emerald-300/10 text-emerald-500",
  completed: "bg-emerald-500/10 text-emerald-600",
};

const statusLabels = {
  active: "Tahap Perencanaan",
  build: "Tahap Pengembangan",
  ongoing: "Sedang Berjalan",
  completed: "Selesai",
};

const Project = () => {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-10 lg:pt-40 lg:pb-14 bg-cream">
        <div className="container-page">
          <div className="max-w-2xl animate-fade-in-up">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-4">
              Project
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-heading leading-tight mb-4">
              Program & Inisiatif
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-lg">
              Berbagai project pendidikan yang kami kembangkan untuk mendukung perjalanan belajar Anda.
            </p>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="section-padding bg-background">
        <div className="container-page">
          <div className="space-y-0 divide-y divide-border/40">
            {projects.map((project, index) => {
              const Icon = project.icon;
              return (
                <div
                  key={project.id}
                  className="group flex items-start gap-5 lg:gap-8 py-8 first:pt-0 last:pb-0 animate-fade-in-up"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="p-3 rounded-xl bg-muted text-muted-foreground shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gold">
                        {project.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusStyles[project.status]}`}>
                        {statusLabels[project.status]}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-heading mb-1">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
                      {project.description}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center self-center">
                    <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-cream">
        <div className="container-page max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-heading mb-4">
            Punya Ide Project?
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Kami terbuka untuk kolaborasi. Jika Anda memiliki ide yang sejalan dengan visi Satu Langkah, mari berdiskusi.
          </p>
          <a
            href="mailto:hello@satulangkah.id"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            Hubungi Kami
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </>
  );
};

export default Project;
