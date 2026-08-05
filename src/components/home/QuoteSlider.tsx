import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import portraitHatta from "@/assets/portrait-hatta.png";
import portraitDescartes from "@/assets/portrait-descartes.png";
import quoteBg from "@/assets/quote-bg.png";

type Slide = {
  portrait: string;
  alt: string;
  quote: string;
  author: string;
  source?: string;
};

const slides: Slide[] = [
  {
    portrait: portraitHatta,
    alt: "Ilustrasi Mohammad Hatta",
    quote:
      "Aku rela dipenjara asal bersama buku, karena dengan buku aku bebas.",
    author: "Mohammad Hatta",
  },
  {
    portrait: portraitDescartes,
    alt: "Ilustrasi René Descartes",
    quote:
      "Membaca semua buku yang baik bagaikan sebuah pertemuan dengan orang-orang paling mulia dari masa lampau yang telah menuliskannya; bahkan sebuah pertemuan yang terpilih, di mana yang tersingkap bagi kita hanyalah pemikiran-pemikiran terbaik mereka.",
    author: "René Descartes",
    source: "Discourse on the Method",
  },
];

const AUTOPLAY_MS = 5000;

const QuoteSlider = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next: number) => {
    setIndex(((next % slides.length) + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      className="relative w-full min-h-screen flex items-center overflow-hidden"
      style={{
        backgroundImage: `url(${quoteBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Kutipan inspiratif"
    >
      {/* Subtle dark overlay for legibility */}
      <div className="absolute inset-0 bg-[#0a395a]/40 pointer-events-none" />

      <div className="relative w-full container-page py-16 md:py-24">
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((s, i) => (
              <div
                key={i}
                className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center px-2 md:px-8"
              >
                {/* Portrait */}
                <div className="flex justify-center md:justify-end order-1 md:order-1">
                  <img
                    src={s.portrait}
                    alt={s.alt}
                    className="w-56 sm:w-72 md:w-[420px] h-auto select-none pointer-events-none"
                    draggable={false}
                    loading="lazy"
                  />
                </div>

                {/* Quote text — copyable */}
                <figure className="text-white order-2 md:order-2 max-w-xl">
                  <blockquote
                    className="font-serif text-2xl sm:text-3xl md:text-4xl leading-snug md:leading-tight tracking-tight"
                    style={{ textWrap: "balance" as any }}
                  >
                    <span aria-hidden="true">“</span>
                    {s.quote}
                    <span aria-hidden="true">”</span>
                  </blockquote>
                  <figcaption className="mt-6 text-xs sm:text-sm tracking-[0.18em] uppercase text-white/85">
                    — {s.author}
                    {s.source && (
                      <span className="block normal-case tracking-normal italic text-white/70 mt-1 font-serif text-sm">
                        ({s.source})
                      </span>
                    )}
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>

        {/* Prev/Next */}
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Kutipan sebelumnya"
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white flex items-center justify-center backdrop-blur-sm transition"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Kutipan berikutnya"
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white flex items-center justify-center backdrop-blur-sm transition"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Pergi ke kutipan ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuoteSlider;