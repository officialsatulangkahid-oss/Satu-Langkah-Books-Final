import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getProducts, type ContentProductListItem } from "@/lib/content";
import readingJournalSpecial from "@/assets/reading-journal-special.png";
import readingJournal2026 from "@/assets/reading-journal-2026.png";

/** Local assets keyed by slug — used when the published JSON has no image. */
export const PRODUCT_IMAGES: Record<string, string> = {
  "reading-journal-special": readingJournalSpecial,
  "reading-journal-2026": readingJournal2026,
};

/** Fallback so the page never renders empty if content JSON is unavailable. */
const FALLBACK_PRODUCTS: ContentProductListItem[] = [
  {
    id: "reading-journal-special",
    slug: "reading-journal-special",
    title: "Reading Journal 2026 Special Edition for Sister",
    short_desc:
      "Edisi spesial Reading Journal yang dirancang khusus untuk para sister. Dilengkapi dengan layout estetik, tracker membaca, dan space refleksi.",
    category: "E-Book",
    image_url: null,
    price: 89000,
    product_type: "ebook",
    checkout_enabled: true,
    external_link: null,
  },
  {
    id: "reading-journal-2026",
    slug: "reading-journal-2026",
    title: "Reading Journal 2026",
    short_desc:
      "Reading Journal 2026 dengan desain minimalis dan elegan. Cocok untuk siapa saja yang ingin membangun kebiasaan membaca.",
    category: "E-Book",
    image_url: null,
    price: 75000,
    product_type: "ebook",
    checkout_enabled: true,
    external_link: null,
  },
];

const Product = () => {
  const [products, setProducts] = useState<ContentProductListItem[]>(FALLBACK_PRODUCTS);

  useEffect(() => {
    (async () => {
      const items = await getProducts();
      if (items.length) setProducts(items);
    })();
  }, []);

  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-10 lg:pt-40 lg:pb-14 bg-cream">
        <div className="container-page">
          <div className="max-w-2xl animate-fade-in-up">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-4">
              Produk
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-heading leading-tight mb-4">
              Koleksi Pilihan
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              Buku dan journal yang dikurasi untuk menemani perjalanan literasi Anda.
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="section-padding bg-background">
        <div className="container-page">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
            {products.map((product, index) => (
              <Link
                to={`/product/${product.slug}`}
                key={product.id}
                className="group animate-fade-in-up max-w-sm mx-auto w-full"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="rounded-xl overflow-hidden bg-muted mb-5 border border-border/30 group-hover:border-border transition-all duration-500">
                  <img
                    src={PRODUCT_IMAGES[product.slug] ?? product.image_url ?? "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-auto object-contain group-hover:scale-[1.03] transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gold">
                    {product.category}
                  </span>
                  <h3 className="text-lg font-bold text-heading mt-2 mb-1.5 group-hover:text-primary transition-colors leading-snug">
                    {product.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                    {product.short_desc}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                    Lihat Detail
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Product;
