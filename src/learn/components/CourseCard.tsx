import { Link } from "react-router-dom";
import { Clock, Heart, Play, Star, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Course } from "../data";

type Props = {
  course: Course;
  percent?: number;
  wishlisted?: boolean;
  onWishlist?: (slug: string) => void;
};

const levelStyles: Record<Course["level"], string> = {
  Pemula: "bg-secondary text-secondary-foreground",
  Menengah: "bg-primary/10 text-primary",
  Lanjutan: "bg-foreground/[0.06] text-foreground",
};

const CourseCard = ({ course, percent, wishlisted, onWishlist }: Props) => (
  <article className="learn-card group flex h-full flex-col overflow-hidden">
    <Link to={`/learn/course/${course.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-muted">
      <img
        src={course.cover}
        alt={`Sampul kursus ${course.title}`}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium text-foreground backdrop-blur">
        {course.category}
      </span>
      <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-background/90 text-primary shadow-lg">
          <Play className="h-5 w-5 fill-current" />
        </span>
      </span>
    </Link>

    <div className="flex flex-1 flex-col p-5">
      <div className="flex items-start gap-3">
        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", levelStyles[course.level])}>
          {course.level}
        </span>
        {onWishlist && (
          <button
            onClick={() => onWishlist(course.slug)}
            aria-label="Simpan ke wishlist"
            className="ml-auto rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
          >
            <Heart className={cn("h-4 w-4", wishlisted && "fill-primary text-primary")} />
          </button>
        )}
      </div>

      <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug transition-colors group-hover:text-primary">
        <Link to={`/learn/course/${course.slug}`}>{course.title}</Link>
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{course.subtitle}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <span className="font-medium text-foreground">{course.rating}</span>({course.reviews})
        </span>
        <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{course.duration}</span>
        <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{course.students}</span>
      </div>

      {typeof percent === "number" && percent > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-[11px] text-muted-foreground">
            <span>Progres</span>
            <span className="font-medium text-primary">{percent}%</span>
          </div>
          <Progress value={percent} className="h-1.5" />
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm font-semibold text-primary">{course.price}</span>
        <Link
          to={`/learn/course/${course.slug}`}
          className="rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {percent ? "Lanjutkan" : "Lihat Kursus"}
        </Link>
      </div>
    </div>
  </article>
);

export default CourseCard;