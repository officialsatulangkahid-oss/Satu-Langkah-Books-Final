import { AnimatePresence, motion } from "framer-motion";
import { Highlighter, Quote, Share2, MessageSquare, Bookmark } from "lucide-react";
import type { HighlightColor } from "@/hooks/useArticleAnnotations";

const COLORS: { key: HighlightColor; label: string; className: string }[] = [
  { key: "yellow", label: "Kuning", className: "bg-[hsl(48_96%_62%)]" },
  { key: "green", label: "Hijau", className: "bg-[hsl(142_60%_55%)]" },
  { key: "blue", label: "Biru", className: "bg-[hsl(205_85%_60%)]" },
  { key: "pink", label: "Merah muda", className: "bg-[hsl(330_80%_68%)]" },
];

interface Props {
  position: { top: number; left: number } | null;
  colorMode: boolean;
  bookmarked: boolean;
  onToggleColorMode: () => void;
  onHighlight: (color: HighlightColor) => void;
  onCopyQuote: () => void;
  onShare: () => void;
  onRespond: () => void;
  onBookmark: () => void;
}

const SelectionToolbar = ({
  position,
  colorMode,
  bookmarked,
  onToggleColorMode,
  onHighlight,
  onCopyQuote,
  onShare,
  onRespond,
  onBookmark,
}: Props) => {
  const btn =
    "inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-primary-foreground/85 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50";

  return (
    <AnimatePresence>
      {position && (
        <motion.div
          role="toolbar"
          aria-label="Aksi teks terpilih"
          initial={{ opacity: 0, scale: 0.94, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 4 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          onMouseDown={(e) => e.preventDefault()}
          style={{ top: position.top, left: position.left }}
          className="fixed z-50 -translate-x-1/2 -translate-y-full"
        >
          <div className="flex items-center gap-0.5 rounded-xl border border-primary-foreground/10 bg-primary p-1 shadow-xl">
            {colorMode ? (
              <>
                {COLORS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    aria-label={`Sorot ${c.label}`}
                    onClick={() => onHighlight(c.key)}
                    className={`h-6 w-6 rounded-full ring-2 ring-primary-foreground/20 transition-transform hover:scale-110 ${c.className}`}
                  />
                ))}
                <button type="button" className={btn} onClick={onToggleColorMode}>
                  Batal
                </button>
              </>
            ) : (
              <>
                <button type="button" className={btn} onClick={onToggleColorMode}>
                  <Highlighter className="h-4 w-4" />
                  <span className="hidden sm:inline">Highlight</span>
                </button>
                <span className="h-5 w-px bg-primary-foreground/15" />
                <button type="button" className={btn} onClick={onCopyQuote}>
                  <Quote className="h-4 w-4" />
                  <span className="hidden sm:inline">Copy Quote</span>
                </button>
                <button type="button" className={btn} onClick={onShare}>
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
                <button type="button" className={btn} onClick={onRespond}>
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Respond</span>
                </button>
                <button type="button" className={btn} onClick={onBookmark}>
                  <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
                </button>
              </>
            )}
          </div>
          <div className="mx-auto h-2 w-2 -translate-y-1 rotate-45 bg-primary" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SelectionToolbar;