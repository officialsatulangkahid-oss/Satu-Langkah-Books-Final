import { useCallback, useEffect, useState } from "react";

export type HighlightColor = "yellow" | "green" | "blue" | "pink";

export interface Highlight {
  id: string;
  articleId: string;
  selectedText: string;
  color: HighlightColor;
  createdAt: string;
}

export interface Response {
  id: string;
  articleId: string;
  selectedText: string;
  body: string;
  createdAt: string;
}

const HL_KEY = "sl:article-highlights";
const RS_KEY = "sl:article-responses";

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

export function useArticleAnnotations(articleId: string | undefined) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);

  useEffect(() => {
    if (!articleId) return;
    setHighlights(read<Highlight>(HL_KEY).filter((h) => h.articleId === articleId));
    setResponses(read<Response>(RS_KEY).filter((r) => r.articleId === articleId));
  }, [articleId]);

  const addHighlight = useCallback(
    (selectedText: string, color: HighlightColor) => {
      if (!articleId || !selectedText.trim()) return;
      const item: Highlight = {
        id: crypto.randomUUID(),
        articleId,
        selectedText: selectedText.trim(),
        color,
        createdAt: new Date().toISOString(),
      };
      const all = read<Highlight>(HL_KEY);
      write(HL_KEY, [...all, item]);
      setHighlights((prev) => [...prev, item]);
    },
    [articleId],
  );

  const removeHighlight = useCallback((id: string) => {
    write(
      HL_KEY,
      read<Highlight>(HL_KEY).filter((h) => h.id !== id),
    );
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const addResponse = useCallback(
    (selectedText: string, body: string) => {
      if (!articleId || !body.trim()) return;
      const item: Response = {
        id: crypto.randomUUID(),
        articleId,
        selectedText: selectedText.trim(),
        body: body.trim(),
        createdAt: new Date().toISOString(),
      };
      const all = read<Response>(RS_KEY);
      write(RS_KEY, [...all, item]);
      setResponses((prev) => [...prev, item]);
    },
    [articleId],
  );

  const removeResponse = useCallback((id: string) => {
    write(
      RS_KEY,
      read<Response>(RS_KEY).filter((r) => r.id !== id),
    );
    setResponses((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { highlights, responses, addHighlight, removeHighlight, addResponse, removeResponse };
}

/** Bookmarks (per article id) */
const BM_KEY = "sl:article-bookmarks";

export function useBookmark(articleId: string | undefined) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (!articleId) return;
    setBookmarked(read<string>(BM_KEY).includes(articleId));
  }, [articleId]);

  const toggle = useCallback(() => {
    if (!articleId) return;
    const all = read<string>(BM_KEY);
    const next = all.includes(articleId) ? all.filter((i) => i !== articleId) : [...all, articleId];
    write(BM_KEY, next);
    setBookmarked(next.includes(articleId));
  }, [articleId]);

  return { bookmarked, toggle };
}