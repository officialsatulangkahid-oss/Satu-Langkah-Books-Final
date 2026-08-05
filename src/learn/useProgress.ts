import { useCallback, useEffect, useState } from "react";
import { courses, allLessons, type Course } from "./data";

const KEY = "sl-learn-progress-v1";

export type ProgressState = {
  completed: Record<string, string[]>;
  quizScores: Record<string, { score: number; total: number }>;
  minutes: Record<string, number>;
  recent: string[];
  wishlist: string[];
  notes: Record<string, string>;
  streak: number;
  lastActive: string;
  studentName: string;
};

const empty: ProgressState = {
  completed: {},
  quizScores: {},
  minutes: {},
  recent: [],
  wishlist: [],
  notes: {},
  streak: 1,
  lastActive: new Date().toDateString(),
  studentName: "Pembelajar Satu Langkah",
};

const read = (): ProgressState => {
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    return empty;
  }
};

let memory: ProgressState = read();
const listeners = new Set<(s: ProgressState) => void>();

const write = (next: ProgressState) => {
  memory = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l(next));
};

export const courseProgress = (state: ProgressState, course: Course) => {
  const total = allLessons(course).length;
  const done = state.completed[course.slug]?.length ?? 0;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
};

export function useProgress() {
  const [state, setState] = useState<ProgressState>(memory);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const toggleLesson = useCallback((slug: string, lessonId: string, minutes = 0) => {
    const list = memory.completed[slug] ?? [];
    const has = list.includes(lessonId);
    write({
      ...memory,
      completed: {
        ...memory.completed,
        [slug]: has ? list.filter((i) => i !== lessonId) : [...list, lessonId],
      },
      minutes: {
        ...memory.minutes,
        [slug]: Math.max(0, (memory.minutes[slug] ?? 0) + (has ? -minutes : minutes)),
      },
    });
  }, []);

  const markViewed = useCallback((slug: string) => {
    if (memory.recent[0] === slug) return;
    write({ ...memory, recent: [slug, ...memory.recent.filter((s) => s !== slug)].slice(0, 6) });
  }, []);

  const saveQuiz = useCallback((key: string, score: number, total: number) => {
    write({ ...memory, quizScores: { ...memory.quizScores, [key]: { score, total } } });
  }, []);

  const toggleWishlist = useCallback((slug: string) => {
    const has = memory.wishlist.includes(slug);
    write({
      ...memory,
      wishlist: has ? memory.wishlist.filter((s) => s !== slug) : [...memory.wishlist, slug],
    });
  }, []);

  const saveNote = useCallback((key: string, value: string) => {
    write({ ...memory, notes: { ...memory.notes, [key]: value } });
  }, []);

  const setStudentName = useCallback((studentName: string) => {
    write({ ...memory, studentName });
  }, []);

  const enrolled = courses.filter((c) => (state.completed[c.slug]?.length ?? 0) > 0);
  const totalMinutes = Object.values(state.minutes).reduce((a, b) => a + b, 0);
  const totalLessons = Object.values(state.completed).reduce((a, b) => a + b.length, 0);
  const certificates = courses.filter((c) => courseProgress(state, c).percent === 100);

  return {
    state,
    toggleLesson,
    markViewed,
    saveQuiz,
    toggleWishlist,
    saveNote,
    setStudentName,
    enrolled,
    totalMinutes,
    totalLessons,
    certificates,
  };
}