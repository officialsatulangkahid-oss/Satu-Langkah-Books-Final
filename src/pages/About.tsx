import { Button } from "@/components/ui/button";
import { Target, Heart, Lightbulb, BookOpen, Users, Award, ArrowRight, } from "lucide-react";

const values = [
  {
    icon: Lightbulb,
    title: "Berilmu",
    description: "Ilmu adalah cahaya yang menerangi jalan, dan kami berkomitmen menyebarkan pengetahuan yang bermanfaat.",
  },
  {
    icon: Heart,
    title: "Beradab",
    description: "Ilmu tanpa adab bagaikan pohon tanpa buah. Kami menekankan pentingnya adab dalam setiap proses belajar.",
  },
  {
    icon: Target,
    title: "Bergerak",
    description: "Perubahan besar berawal dari langkah kecil yang terus bergerak; karena itu, kami berkomitmen menjaga setiap program tetap konsisten dan berkelanjutan.",
  },
];

const milestones = [
  { number: "2023", label: "Tahun Berdiri" },
  { number: "50+", label: "Artikel Diterbitkan" },
  { number: "1000+", label: "Pembaca Aktif" },
  { number: "10+", label: "Program Berjalan" },
];

const About = () => {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary-foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary-foreground)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        <div className="container-page relative text-primary-foreground">
          <div className="max-w-3xl animate-fade-in-up">
            <span className="text-sm font-semibold text-gold uppercase tracking-widest">
              Tentang Kami
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-3 mb-6 leading-tight text-white">
              Dari Langkah Kecil,<br />
              <span className="text-gold">Tumbuhlah Budaya Ilmu</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed max-w-2xl">
              Satu Langkah Books merupakan bagian dari Satu Langkah, sebuah gerakan literasi yang hadir untuk menumbuhkan kembali semangat belajar dan membaca di tengah masyarakat, dengan keyakinan bahwa perubahan besar berawal dari langkah-langkah kecil yang konsisten.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section-padding bg-background">
        <div className="container-page">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="relative bg-cream rounded-3xl p-10 lg:p-12 overflow-hidden animate-fade-in-up">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-bl-[100px] -z-0" />
              <div className="relative">
                <div className="p-4 rounded-2xl bg-primary text-primary-foreground w-fit mb-6">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-heading mb-4">Visi</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Menjadi wadah terdepan dalam membangun generasi pembelajar yang 
                  berilmu, beradab, dan berkontribusi positif bagi masyarakat dan peradaban.
                </p>
              </div>
            </div>

            <div className="relative bg-secondary rounded-3xl p-10 lg:p-12 overflow-hidden animate-fade-in-delay-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-0" />
              <div className="relative">
                <div className="p-4 rounded-2xl bg-gold text-white w-fit mb-6">
                  <Target className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-heading mb-4">Misi</h2>
                <ul className="space-y-4 text-muted-foreground">
                  {[
                    "Menyediakan konten edukatif berkualitas yang mudah diakses",
                    "Mengembangkan program literasi yang berkelanjutan",
                    "Membangun komunitas pembelajar yang saling mendukung",
                    "Memproduksi produk digital yang bermanfaat bagi masyarakat",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-cream">
        <div className="container-page">
          <div className="max-w-2xl mb-16 animate-fade-in-up">
            <span className="text-sm font-semibold text-gold uppercase tracking-widest">
              Nilai Kami
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-heading mt-3 mb-5">
              Prinsip yang Kami Pegang
            </h2>
            <p className="text-muted-foreground text-lg">
              Tiga nilai utama yang menjadi fondasi setiap langkah kami
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div 
                key={value.title}
                className="group bg-card rounded-2xl p-8 lg:p-10 border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex p-4 rounded-2xl bg-gold/10 text-gold mb-6 group-hover:bg-gold group-hover:text-white transition-all duration-300">
                  <value.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-heading mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="section-padding bg-background hidden">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-heading mb-4">
              Perjalanan Kami
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {milestones.map((milestone, index) => (
              <div 
                key={index}
                className="text-center p-8 rounded-2xl bg-secondary border border-border/50 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {milestone.number}
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  {milestone.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        </div>
        
        <div className="container-page relative">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <div className="inline-flex p-4 rounded-2xl bg-white/10 border border-white/20 mb-8">
              <Award className="h-8 w-8" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
              Yuk Mulai<br />
              <span className="text-gold">Perjalanan Literasimu</span>
            </h2>
            <p className="text-lg text-primary-foreground/80 leading-relaxed mb-10 max-w-2xl mx-auto">
              Jelajahi berbagai produk dan program kami untuk mengembangkan 
              potensi diri dan memperkaya wawasan Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="gold" size="lg">
                <a href="/articles">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Lihat Artikel
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground border border-white/20">
                <a href="/project">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Jelajahi Project
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
