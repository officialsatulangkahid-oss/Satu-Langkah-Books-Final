import { useState } from "react";
import { Check, ChevronDown, FileText, HelpCircle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Course } from "../data";

type Props = {
  course: Course;
  completed: string[];
  activeLessonId?: string;
  onSelect?: (lessonId: string) => void;
};

const Curriculum = ({ course, completed, activeLessonId, onSelect }: Props) => {
  const [open, setOpen] = useState<string[]>([course.chapters[0]?.id]);

  const toggle = (id: string) =>
    setOpen((o) => (o.includes(id) ? o.filter((i) => i !== id) : [...o, id]));

  return (
    <div className="space-y-3">
      {course.chapters.map((ch) => {
        const isOpen = open.includes(ch.id);
        const doneCount = ch.lessons.filter((l) => completed.includes(l.id)).length;
        return (
          <div key={ch.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <button
              onClick={() => toggle(ch.id)}
              className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/50"
            >
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
              <span className="flex-1 text-sm font-semibold">{ch.title}</span>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                {doneCount}/{ch.lessons.length}
              </span>
            </button>

            {isOpen && (
              <ul className="border-t border-border">
                {ch.lessons.map((l) => {
                  const done = completed.includes(l.id);
                  const active = activeLessonId === l.id;
                  return (
                    <li key={l.id}>
                      <button
                        onClick={() => onSelect?.(l.id)}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                          active ? "bg-secondary" : "hover:bg-muted/50"
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-6 w-6 shrink-0 place-items-center rounded-full border",
                            done ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
                          )}
                        >
                          {done ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : l.type === "reading" ? (
                            <FileText className="h-3 w-3" />
                          ) : (
                            <PlayCircle className="h-3.5 w-3.5" />
                          )}
                        </span>
                        <span className={cn("flex-1 text-sm", active ? "font-medium text-primary" : "text-foreground")}>
                          {l.title}
                        </span>
                        {l.hasQuiz && <HelpCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                        <span className="shrink-0 text-[11px] text-muted-foreground">{l.duration}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Curriculum;