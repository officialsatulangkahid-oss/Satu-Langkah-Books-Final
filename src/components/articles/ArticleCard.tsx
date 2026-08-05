import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";

interface ArticleCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
}

const ArticleCard = ({ id, title, excerpt, category, readTime, date }: ArticleCardProps) => {
  return (
    <Link
      to={`/articles/${id}`}
      className="group block h-full bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1 overflow-hidden"
    >
      {/* Content */}
      <div className="p-7">
        {/* Category & Date */}
        <div className="flex items-center justify-between mb-5">
          <span className="px-3 py-1.5 rounded-lg bg-gold/10 text-gold text-xs font-semibold">
            {category}
          </span>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-heading mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
          {excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-5 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{readTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-primary font-semibold text-sm group-hover:gap-2.5 transition-all">
            <span>Baca</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;