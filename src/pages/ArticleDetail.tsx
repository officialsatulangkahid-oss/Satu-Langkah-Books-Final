import { useParams, Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Share2,
  Bookmark,
  MessageSquare,
  Highlighter,
  Link2,
  X,
} from "lucide-react";
import { getArticle, getArticles } from "@/lib/content";
import { toast } from "sonner";
import SelectionToolbar from "@/components/article/SelectionToolbar";
import ShareQuoteDialog from "@/components/article/ShareQuoteDialog";
import ReadingProgress from "@/components/article/ReadingProgress";
import { useArticleAnnotations, useBookmark, type HighlightColor } from "@/hooks/useArticleAnnotations";
import { paintHighlights } from "@/lib/highlightPainter";

interface ArticleData {
  id: string;
  slug: string | null;
  title: string;
  excerpt: string | null;
  category: string | null;
  read_time: string | null;
  date: string | null;
  author: string | null;
  image_url: string | null;
  content: any;
}

interface RelatedRow {
  id: string;
  slug: string | null;
  title: string;
  excerpt: string | null;
  category: string | null;
  read_time: string | null;
}

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [related, setRelated] = useState<RelatedRow[]>([]);
  const [loading, setLoading] = useState(true);

  const contentRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);

  const [selection, setSelection] = useState<{ text: string; top: number; left: number } | null>(null);
  const [colorMode, setColorMode] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [respondFor, setRespondFor] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [hoverRail, setHoverRail] = useState<{ top: number; text: string } | null>(null);

  const { highlights, responses, addHighlight, removeHighlight, addResponse, removeResponse } =
    useArticleAnnotations(article?.id);
  const { bookmarked, toggle: toggleBookmark } = useBookmark(article?.id);

  /* ---------------- data ---------------- */
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      const data = await getArticle(id);
      setArticle((data as unknown as ArticleData) ?? null);
      setLoading(false);

      if (data) {
        const rel = (await getArticles())
          .filter((a) => a.id !== data.id)
          .slice(0, 3);
        setRelated(rel as RelatedRow[]);
      }
    })();
  }, [id]);


  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [id]);

  /* ---------------- content shape ---------------- */
  const isHtml = typeof article?.content === "string" && /<[a-z][\s\S]*>/i.test(article.content);
  const paragraphs: string[] = Array.isArray(article?.content) ? (article!.content as string[]) : [];

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  /* ---------------- highlights ---------------- */
  useEffect(() => {
    if (!contentRef.current || loading) return;
    paintHighlights(contentRef.current, highlights);
  }, [highlights, loading, article]);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    const onClick = (e: MouseEvent) => {
      const mark = (e.target as HTMLElement).closest("mark[data-sl-highlight]");
      if (mark) removeHighlight(mark.getAttribute("data-sl-highlight")!);
    };
    node.addEventListener("click", onClick);
    return () => node.removeEventListener("click", onClick);
  }, [removeHighlight]);

  /* ---------------- selection toolbar ---------------- */
  const syncSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !contentRef.current) {
      setSelection(null);
      setColorMode(false);
      return;
    }
    const range = sel.getRangeAt(0);
    if (!contentRef.current.contains(range.commonAncestorContainer)) {
      setSelection(null);
      return;
    }
    const text = sel.toString().trim();
    if (text.length < 2) {
      setSelection(null);
      return;
    }
    const rect = range.getBoundingClientRect();
    setSelection({
      text,
      top: Math.max(rect.top - 10, 56),
      left: Math.min(Math.max(rect.left + rect.width / 2, 120), window.innerWidth - 120),
    });
  }, []);

  useEffect(() => {
    const onUp = () => window.setTimeout(syncSelection, 10);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchend", onUp);
    document.addEventListener("keyup", onUp);
    window.addEventListener("scroll", syncSelection, { passive: true });
    return () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchend", onUp);
      document.removeEventListener("keyup", onUp);
      window.removeEventListener("scroll", syncSelection);
    };
  }, [syncSelection]);

  const clearSelection = () => {
    window.getSelection()?.removeAllRanges();
    setSelection(null);
    setColorMode(false);
  };

  const quoteText = (text: string) =>
    `${text}\n\n— ${article?.title ?? ""}\n${shareUrl.split("#")[0]}`;

  const handleCopyQuote = async (text: string) => {
    await navigator.clipboard.writeText(quoteText(text));
    toast.success("Kutipan disalin");
    clearSelection();
  };

  const handleHighlight = (color: HighlightColor) => {
    if (!selection) return;
    addHighlight(selection.text, color);
    toast.success("Teks disorot");
    clearSelection();
  };

  /* ---------------- active paragraph focus ---------------- */
  useEffect(() => {
    const node = contentRef.current;
    if (!node || loading) return;
    const blocks = Array.from(node.querySelectorAll("p, blockquote, li, h2, h3"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.toggleAttribute("data-reading-active", entry.isIntersecting);
        });
      },
      { rootMargin: "-32% 0px -42% 0px" },
    );
    blocks.forEach((b) => observer.observe(b));
    return () => observer.disconnect();
  }, [loading, article]);

  /* ---------------- paragraph hover rail ---------------- */
  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    const onMove = (e: MouseEvent) => {
      const p = (e.target as HTMLElement).closest("p, blockquote");
      if (!p || !node.contains(p)) return setHoverRail(null);
      const rect = p.getBoundingClientRect();
      const parent = node.getBoundingClientRect();
      setHoverRail({ top: rect.top - parent.top + 4, text: p.textContent ?? "" });
    };
    node.addEventListener("mousemove", onMove);
    node.addEventListener("mouseleave", () => setHoverRail(null));
    return () => node.removeEventListener("mousemove", onMove);
  }, [loading, article]);

  /* ---------------- lightbox ---------------- */
  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    const onClick = (e: MouseEvent) => {
      const img = (e.target as HTMLElement).closest("img");
      if (img) setLightbox((img as HTMLImageElement).src);
    };
    node.addEventListener("click", onClick);
    return () => node.removeEventListener("click", onClick);
  }, [loading, article]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const readingMeta = useMemo(
    () => [article?.author, article?.date].filter(Boolean).join(" · "),
    [article],
  );

  /* ---------------- render ---------------- */
  if (loading) {
    return (
      <div className="mx-auto max-w-[700px] px-6 pt-32 pb-24">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-6 h-12 w-full animate-pulse rounded bg-muted" />
        <div className="mt-3 h-12 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-10 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 w-full animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="mx-auto max-w-[700px] px-6 pt-40 pb-24 text-center">
        <p className="mb-6 text-xl text-muted-foreground">Artikel tidak ditemukan.</p>
        <Link to="/articles" className="font-semibold text-primary hover:underline">
          ← Kembali ke Artikel
        </Link>
      </div>
    );
  }

  return (
    <article ref={articleRef} className="reading-root pb-24">
      <ReadingProgress targetRef={articleRef} />

      {/* Header */}
      <header className="mx-auto max-w-[700px] px-6 pt-14 md:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Semua Artikel
          </Link>

          {article.category && (
            <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {article.category}
            </p>
          )}

          <h1 className="mt-4 text-[2.25rem] font-bold leading-[1.12] tracking-[-0.025em] text-heading md:text-[3rem] lg:text-[3.4rem]">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="mt-5 text-[1.2rem] leading-relaxed text-muted-foreground md:text-[1.375rem]">
              {article.excerpt}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border/60 py-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{readingMeta}</span>
            {article.read_time && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {article.read_time}
              </span>
            )}
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                aria-label={bookmarked ? "Hapus bookmark" : "Simpan artikel"}
                onClick={toggleBookmark}
                className="rounded-lg p-2 transition-colors hover:bg-accent hover:text-foreground"
              >
                <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current text-gold" : ""}`} />
              </button>
              <button
                type="button"
                aria-label="Bagikan artikel"
                onClick={() => setShareOpen(true)}
                className="rounded-lg p-2 transition-colors hover:bg-accent hover:text-foreground"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Cover */}
      {article.image_url && (
        <motion.figure
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="mx-auto mt-12 max-w-[860px] px-6"
        >
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full cursor-zoom-in rounded-2xl shadow-card"
            onClick={() => setLightbox(article.image_url!)}
            loading="lazy"
          />
          <figcaption className="mt-3 text-center text-xs text-muted-foreground">
            {article.title}
          </figcaption>
        </motion.figure>
      )}

      {/* Body */}
      <div className="relative mx-auto mt-14 max-w-[700px] px-6">
        {/* hover rail */}
        <AnimatePresence>
          {hoverRail && (
            <motion.div
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ top: hoverRail.top }}
              className="absolute -left-14 hidden flex-col gap-1 lg:flex"
            >
              <button
                type="button"
                aria-label="Salin tautan paragraf"
                onClick={() => {
                  navigator.clipboard.writeText(`${shareUrl.split("#")[0]}#quote`);
                  toast.success("Tautan paragraf disalin");
                }}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Link2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Tanggapi paragraf"
                onClick={() => setRespondFor(hoverRail.text.slice(0, 180))}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <MessageSquare className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Sorot paragraf"
                onClick={() => {
                  addHighlight(hoverRail.text, "yellow");
                  toast.success("Paragraf disorot");
                }}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Highlighter className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={contentRef} className="reading-body">
          {isHtml ? (
            <div dangerouslySetInnerHTML={{ __html: article.content as string }} />
          ) : (
            paragraphs.map((paragraph, i) => (
              <p key={i} className={i === 0 ? "has-dropcap" : undefined}>
                {paragraph}
              </p>
            ))
          )}
        </div>

        {/* Responses */}
        <section className="mt-20 border-t border-border/60 pt-10">
          <h2 className="text-lg font-bold text-heading">
            Tanggapan {responses.length > 0 && <span className="text-muted-foreground">({responses.length})</span>}
          </h2>

          <div className="mt-6 space-y-4">
            {responses.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Belum ada tanggapan. Pilih sebagian teks lalu klik “Respond” untuk menulis catatan.
              </p>
            )}
            {responses.map((r) => (
              <div key={r.id} className="rounded-xl border border-border/70 bg-card p-4">
                <p className="border-l-2 border-gold pl-3 text-sm italic text-muted-foreground">
                  {r.selectedText}
                </p>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-foreground/85">{r.body}</p>
                <button
                  type="button"
                  onClick={() => removeResponse(r.id)}
                  className="mt-3 text-xs text-muted-foreground hover:text-destructive"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-border/60 pt-10">
            <h2 className="text-lg font-bold text-heading">Bacaan Lainnya</h2>
            <div className="mt-6 grid gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/articles/${r.slug ?? r.id}`}
                  className="group rounded-xl border border-border/60 p-5 transition-colors hover:bg-accent/50"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
                    {r.category}
                  </p>
                  <h3 className="mt-2 text-lg font-bold leading-snug text-heading group-hover:text-primary">
                    {r.title}
                  </h3>
                  {r.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {r.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Floating share rail */}
      <div className="fixed bottom-24 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-background/90 p-1.5 shadow-lg backdrop-blur lg:bottom-1/2 lg:left-8 lg:translate-x-0 lg:translate-y-1/2 lg:flex-col">
        <button
          type="button"
          aria-label="Bagikan artikel"
          onClick={() => setShareOpen(true)}
          className="rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Share2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={bookmarked ? "Hapus bookmark" : "Simpan artikel"}
          onClick={toggleBookmark}
          className="rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current text-gold" : ""}`} />
        </button>
        <button
          type="button"
          aria-label="Salin tautan artikel"
          onClick={() => {
            navigator.clipboard.writeText(shareUrl);
            toast.success("Tautan disalin");
          }}
          className="rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Link2 className="h-4 w-4" />
        </button>
      </div>

      {/* Selection toolbar */}
      <SelectionToolbar
        position={selection ? { top: selection.top, left: selection.left } : null}
        colorMode={colorMode}
        bookmarked={bookmarked}
        onToggleColorMode={() => setColorMode((v) => !v)}
        onHighlight={handleHighlight}
        onCopyQuote={() => selection && handleCopyQuote(selection.text)}
        onShare={() => setShareOpen(true)}
        onRespond={() => {
          if (selection) setRespondFor(selection.text);
          clearSelection();
        }}
        onBookmark={() => {
          toggleBookmark();
          clearSelection();
        }}
      />

      {/* Respond composer */}
      <AnimatePresence>
        {respondFor && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md rounded-2xl border border-border bg-card p-4 shadow-xl lg:bottom-8"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="border-l-2 border-gold pl-3 text-xs italic leading-relaxed text-muted-foreground line-clamp-3">
                {respondFor}
              </p>
              <button
                type="button"
                aria-label="Tutup"
                onClick={() => setRespondFor(null)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Tulis tanggapanmu…"
              aria-label="Tanggapan"
              className="mt-3 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={3}
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRespondFor(null);
                  setDraft("");
                }}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  addResponse(respondFor, draft);
                  setDraft("");
                  setRespondFor(null);
                  toast.success("Tanggapan tersimpan");
                }}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Kirim
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share dialog */}
      <ShareQuoteDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        quote={selection?.text ?? article.excerpt ?? article.title}
        title={article.title}
        url={shareUrl.split("#")[0]}
        onCopyLink={() => {
          navigator.clipboard.writeText(`${shareUrl.split("#")[0]}#quote`);
          toast.success("Tautan disalin");
        }}
        onCopyQuote={() => handleCopyQuote(selection?.text ?? article.excerpt ?? article.title)}
      />

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label="Pratinjau gambar"
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/90 p-6"
          >
            <motion.img
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              src={lightbox}
              alt=""
              className="max-h-[88vh] max-w-full rounded-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
};

export default ArticleDetail;