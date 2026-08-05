import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  targetRef: React.RefObject<HTMLElement>;
}

const ReadingProgress = ({ targetRef }: Props) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = targetRef.current;
      if (!el) return;
      const start = el.offsetTop;
      const total = el.offsetHeight - window.innerHeight * 0.4;
      const value = ((window.scrollY - start) / Math.max(total, 1)) * 100;
      setProgress(Math.min(100, Math.max(0, value)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetRef]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 h-0.5 bg-transparent" aria-hidden="true">
        <motion.div
          className="h-full bg-gold"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.15 }}
        />
      </div>
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-24 right-5 z-40 hidden rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur md:block lg:bottom-8"
      >
        {Math.round(progress)}% dibaca
      </div>
    </>
  );
};

export default ReadingProgress;