import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getArticles, type ContentArticleListItem } from "@/lib/content";

const categories = ["Semua", "Tauhid", "Literasi Islam", "Pendidikan", "Refleksi"];

type ArticleRow = ContentArticleListItem;

const Articles = () => {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setArticles(await getArticles());
      setLoading(false);
    })();
  }, []);


  const filteredArticles = activeCategory === "Semua"
    ? articles
    : articles.filter(article => article.category === activeCategory);

  const featuredArticle = filteredArticles.find(a => a.featured);
  const regularArticles = filteredArticles.filter(a => !a.featured);

  return (
    <>
      {/* Header — editorial literary */}
      <section className="relative overflow-hidden pt-12 pb-12 lg:pt-16 lg:pb-16 bg-cream article-hero-pattern">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-20 border-r border-border/40 bg-background/20 md:w-28" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-20 border-l border-border/40 bg-background/20 md:w-28" />
        <div className="pointer-events-none absolute left-8 top-8 hidden h-12 w-12 border-l border-t border-gold/35 md:block" />
        <div className="pointer-events-none absolute bottom-8 right-8 hidden h-12 w-12 border-b border-r border-gold/35 md:block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="container-page relative">
          <div className="max-w-3xl animate-fade-in-up">
            <div className="mb-5 flex items-center gap-4">
              <span className="h-px w-12 bg-gold" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                Artikel & Literasi
              </p>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.35rem] font-bold text-heading leading-tight mb-5">
              Menata Pikiran Lewat Tulisan
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-xl md:text-lg">
              Kumpulan tulisan reflektif dan edukatif yang berlandaskan pandangan alam Islam, membahas ilmu, pendidikan, dan kehidupan sebagai jalan menumbuhkan pemahaman yang utuh dan bermakna.
            </p>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="py-5 bg-background border-b border-border/60 sticky top-16 z-30 backdrop-blur-xl bg-background/90">
        <div className="container-page">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                  activeCategory === category
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-background">
        <div className="container-page">
          {/* Featured Article */}
          {featuredArticle && (
            <Link
              to={`/articles/${featuredArticle.slug}`}
              className="group block mb-16 animate-fade-in-up"
            >
              <div className="grid lg:grid-cols-5 gap-0 rounded-2xl overflow-hidden border border-border/40 hover:border-border transition-all duration-500">
                <div className="lg:col-span-3 aspect-[16/10] lg:aspect-auto overflow-hidden bg-muted">
                  <img
                    src={featuredArticle.image_url || "/placeholder.svg"}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    width={960}
                    height={600}
                  />
                </div>
                <div className="lg:col-span-2 p-8 lg:p-10 flex flex-col justify-center bg-card">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gold">
                      {featuredArticle.category}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="text-xs text-muted-foreground">{featuredArticle.date}</span>
                  </div>
                  <h2 className="text-2xl lg:text-[1.75rem] font-bold text-heading mb-4 group-hover:text-primary transition-colors leading-snug">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-8 line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {featuredArticle.read_time}
                    </span>
                    <span className="flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                      Baca
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Article List — clean editorial style */}
          <div className="space-y-0 divide-y divide-border/40">
            {regularArticles.map((article, index) => (
              <Link
                key={article.id}
                to={`/articles/${article.slug}`}
                className="group grid grid-cols-[88px_1fr] items-start gap-5 py-8 first:pt-0 last:pb-0 animate-fade-in-up sm:grid-cols-[112px_1fr] lg:grid-cols-[136px_1fr_auto] lg:gap-7"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted shadow-sm">
                  <img
                    src={article.image_url || "/placeholder.svg"}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    width={272}
                    height={340}
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gold">
                      {article.category}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="text-xs text-muted-foreground">{article.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-heading group-hover:text-primary transition-colors mb-1.5 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 max-w-xl">
                    {article.excerpt}
                  </p>
                </div>
                <div className="hidden lg:flex items-center gap-4 pt-6 shrink-0">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {article.read_time}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {filteredArticles.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                Belum ada artikel dalam kategori ini.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Articles;
