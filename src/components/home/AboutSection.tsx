import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const AboutSection = () => {
  return (
    <section className="section-padding bg-cream overflow-hidden">
      <div className="container-page">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left — Quote */}
          <div className="flex items-center">
            <div>
              <blockquote className="font-serif text-2xl md:text-3xl lg:text-4xl italic leading-snug text-heading mb-8">
                "Membaca buku-buku yang baik berarti memberi makanan rohani yang baik"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-foreground/20" />
                <span className="text-sm text-muted-foreground">Buya Hamka</span>
              </div>
            </div>
          </div>

          {/* Right — About text */}
          <div className="flex flex-col justify-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-4">
              Tentang Kami
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-heading mb-6 leading-tight">
              Gerakan Literasi untuk Generasi Berilmu
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
              Satu Langkah hadir sebagai wadah belajar dan berbagi ilmu. 
              Kami percaya bahwa perubahan besar dimulai dari langkah kecil yang konsisten. 
              Melalui artikel, e-book, dan kursus online, kami berkomitmen membangun 
              budaya membaca dan belajar yang berkelanjutan.
            </p>
            
            {/* Values — simple inline */}
            <div className="flex gap-6 mb-10">
              {["Berilmu", "Beradab", "Bergerak"].map((val) => (
                <div key={val} className="text-center">
                  <span className="text-sm font-bold text-heading">{val}</span>
                </div>
              ))}
            </div>

            <Link
              to="/about"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              Pelajari Lebih Lanjut
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
