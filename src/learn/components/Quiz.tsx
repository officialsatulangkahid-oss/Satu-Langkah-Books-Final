import { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "../data";

type Props = {
  questions: QuizQuestion[];
  onFinish?: (score: number, total: number) => void;
};

const Quiz = ({ questions, onFinish }: Props) => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[index];
  const percent = Math.round((index / questions.length) * 100);

  const check = () => {
    if (selected === null) return;
    setRevealed(true);
    if (selected === q.correct) setScore((s) => s + 1);
  };

  const next = () => {
    const finalScore = score;
    if (index + 1 >= questions.length) {
      setDone(true);
      onFinish?.(finalScore, questions.length);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  };

  const reset = () => {
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setDone(false);
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 70;
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div
          className={cn(
            "mx-auto grid h-16 w-16 place-items-center rounded-full",
            passed ? "bg-secondary text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          {passed ? <Check className="h-8 w-8" /> : <RotateCcw className="h-7 w-7" />}
        </div>
        <h3 className="mt-5 text-xl font-semibold">{passed ? "Kerja bagus!" : "Coba sekali lagi"}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Skor kamu {score} dari {questions.length} ({pct}%)
        </p>
        <div className="mx-auto mt-5 max-w-xs">
          <Progress value={pct} className="h-2" />
        </div>
        <Button onClick={reset} variant="outline" className="mt-6 rounded-full">
          <RotateCcw className="mr-2 h-4 w-4" /> Ulangi Kuis
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Pertanyaan {index + 1} dari {questions.length}
          </span>
          <span>{percent}%</span>
        </div>
        <Progress value={percent} className="h-1.5" />
      </div>

      <h3 className="text-lg font-semibold leading-snug">{q.question}</h3>

      <div className="mt-5 space-y-3">
        {q.options.map((opt, i) => {
          const isCorrect = revealed && i === q.correct;
          const isWrong = revealed && i === selected && i !== q.correct;
          return (
            <button
              key={opt}
              disabled={revealed}
              onClick={() => setSelected(i)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all duration-200",
                selected === i && !revealed
                  ? "border-primary bg-secondary"
                  : "border-border hover:border-primary/40 hover:bg-muted/60",
                isCorrect && "border-primary bg-secondary text-secondary-foreground",
                isWrong && "border-destructive/40 bg-destructive/5"
              )}
            >
              <span
                className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-semibold",
                  selected === i ? "border-primary text-primary" : "border-border text-muted-foreground"
                )}
              >
                {isCorrect ? <Check className="h-3.5 w-3.5" /> : isWrong ? <X className="h-3.5 w-3.5" /> : String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="mt-5 rounded-xl bg-muted/70 p-4 text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Penjelasan: </span>
          {q.explanation}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        {revealed ? (
          <Button onClick={next} className="rounded-full">
            {index + 1 >= questions.length ? "Lihat Hasil" : "Pertanyaan Berikutnya"}
          </Button>
        ) : (
          <Button onClick={check} disabled={selected === null} className="rounded-full">
            Periksa Jawaban
          </Button>
        )}
      </div>
    </div>
  );
};

export default Quiz;