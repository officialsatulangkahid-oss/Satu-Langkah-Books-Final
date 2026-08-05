import { useState, useEffect, useRef } from "react";
import { BookOpen } from "lucide-react";

const quote = "Membaca buku-buku yang baik berarti memberi makanan rohani yang baik.";
const words = quote.split(" ");

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const finishedRef = useRef(false);

  const safeFinish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  };

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("hold"), 100);
    const exitTimer = setTimeout(() => setPhase("exit"), 3500);
    const finishTimer = setTimeout(safeFinish, 4500);

    // Safety: also finish on user interaction or page hidden
    const onSkip = () => safeFinish();
    window.addEventListener("keydown", onSkip);
    window.addEventListener("click", onSkip);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
      window.removeEventListener("keydown", onSkip);
      window.removeEventListener("click", onSkip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black transition-opacity duration-1000 ${
        phase === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-x-0 top-1/2 h-px bg-primary-foreground/30" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-primary-foreground/15" />
        <div className="absolute inset-8 border border-primary-foreground/10" />
      </div>

      <div className="relative mx-auto max-w-3xl px-8 text-center">

        <div
          className={`mx-auto mb-8 h-px bg-gold transition-all duration-1000 ease-out ${
            phase === "enter" ? "w-0 opacity-0" : "w-16 opacity-100"
          }`}
          style={{ transitionDelay: "200ms" }}
        />

        <p className="font-serif text-2xl leading-relaxed text-primary-foreground/95 sm:text-3xl md:text-4xl">
          <span
            className={`mr-1 inline-block text-gold transition-all duration-700 ${
              phase === "enter" ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
            }`}
            style={{ transitionDelay: "320ms" }}
          >
            “
          </span>
          {words.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className={`inline-block pr-2 transition-all duration-700 ease-out ${
                phase === "enter" ? "translate-y-4 opacity-0 blur-sm" : "translate-y-0 opacity-100 blur-0"
              }`}
              style={{ transitionDelay: `${520 + index * 100}ms` }}
            >
              {word}
            </span>
          ))}
          <span
            className={`inline-block text-gold transition-all duration-700 ${
              phase === "enter" ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
            }`}
            style={{ transitionDelay: `${520 + words.length * 100}ms` }}
          >
            ”
          </span>
        </p>

        <div
          className={`mt-8 flex items-center justify-center gap-3 transition-all duration-1000 ease-out ${
            phase === "enter"
              ? "opacity-0 translate-y-4"
              : "opacity-100 translate-y-0"
          }`}
          style={{ transitionDelay: "1350ms" }}
        >
          <div className="w-8 h-[1px] bg-gold/60" />
          <span className="text-sm tracking-[0.2em] uppercase text-primary-foreground/60 font-medium">
            Buya Hamka
          </span>
          <div className="w-8 h-[1px] bg-gold/60" />
        </div>

        <div
          className={`mx-auto mt-8 h-px bg-gold transition-all duration-1000 ease-out ${
            phase === "enter" ? "w-0 opacity-0" : "w-16 opacity-100"
          }`}
          style={{ transitionDelay: "1450ms" }}
        />
      </div>
    </div>
  );
};

export default SplashScreen;
