import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag, ExternalLink, BookOpen, Building2, FileText, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHECKOUT_PRODUCTS } from "@/data/checkoutProducts";
import { getProduct, type ContentProduct } from "@/lib/content";
import { PRODUCT_IMAGES } from "@/pages/Product";

type Detail = { label: string; value: string };

/** Local fallback used when the published content JSON is unavailable. */
const FALLBACK: Record<string, ContentProduct> = {
  "reading-journal-special": {
    id: "reading-journal-special",
    slug: "reading-journal-special",
    title: "Reading Journal 2026 Special Edition for Sister",
    short_desc: null,
    category: "E-Book",
    image_url: null,
    price: 89000,
    product_type: "ebook",
    checkout_enabled: true,
    external_link:
      "https://lynk.id/satulangkahofficial/dyze791vzeew/checkout?token=cGFyYW1zPSU1QiU1RCZiaWRfcHJpY2U9MCZxdHlfcHJvZD0xJnNlc3NpZD0mdG90YWxfcHJpY2U9JnRvdGFsX3VuaXQ9",
    long_description: [
      "Di tengah hiruk pikuk kehidupan, Muslimah membutuhkan ruang yang menenangkan—untuk membaca, merenung, dan menata diri dengan kemurnian dan kesungguhan hati. Reading Journal Special Edition for Sister hadir sebagai teman perjalanan intelektual dan spiritual, membantu Muslimah membangun kebiasaan membaca yang istiqamah, penuh adab, dan bernilai ibadah.",
      "Journal ini dirancang khusus dengan sentuhan Islami yang lembut, dilengkapi panduan adab menuntut ilmu, refleksi ruhani, dan motivasi bulanan. Bukan sekadar jurnal membaca, tetapi ruang bertumbuh untuk senantiasa belajar dan mendekat diri kepada Allah melalui ilmu.",
    ],
    details: [
      { label: "Judul", value: "Reading Journal Special Edition for Sister" },
      { label: "Penerbit", value: "Satu Langkah" },
      { label: "Halaman", value: "±470" },
      {
        label: "Isi Utama",
        value:
          "Adab membaca, keutamaan istiqamah, reading goal, habit formation, refleksi Islami bulanan, reading tracker & journal.",
      },
    ],
  },
  "reading-journal-2026": {
    id: "reading-journal-2026",
    slug: "reading-journal-2026",
    title: "Reading Journal 2026",
    short_desc: null,
    category: "E-Book",
    image_url: null,
    price: 75000,
    product_type: "ebook",
    checkout_enabled: true,
    external_link:
      "https://lynk.id/satulangkahofficial/x58o13ynkk59/checkout?token=cGFyYW1zPSU1QiU1RCZiaWRfcHJpY2U9MCZxdHlfcHJvZD0xJnNlc3NpZD0mdG90YWxfcHJpY2U9JnRvdGFsX3VuaXQ9",
    long_description: [
      "Di tengah hiruk pikuk kehidupan, setiap pencari ilmu membutuhkan ruang yang menenangkan—untuk membaca, merenung, dan menata diri dengan niat yang lurus. Reading Journal hadir sebagai teman perjalanan intelektual dan spiritual, membantu membangun kebiasaan membaca yang istiqamah, beradab, dan bernilai.",
      "Journal ini dirancang dengan pendekatan Islami yang reflektif, dilengkapi panduan adab menuntut ilmu, pembahasan istiqamah, tujuan membaca yang terarah, motivasi bulanan, serta ruang personal untuk mencatat proses bertumbuh.",
    ],
    details: [
      { label: "Judul", value: "Reading Journal" },
      { label: "Penerbit", value: "Satu Langkah" },
      { label: "Halaman", value: "±470" },
      {
        label: "Isi Utama",
        value: "Adab membaca, istiqamah, reading goal, habit formation, refleksi Islami bulanan, reading tracker & journal.",
      },
    ],
  },
};

const detailIcon = (label: string) => {
  const key = label.toLowerCase();
  if (key.includes("judul")) return <BookOpen className="h-4 w-4" />;
  if (key.includes("penerbit")) return <Building2 className="h-4 w-4" />;
  if (key.includes("halaman")) return <FileText className="h-4 w-4" />;
  return <Layers className="h-4 w-4" />;
};

const toParagraphs = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((v) => String(v));
  if (typeof value === "string") return value.split("\n").filter(Boolean);
  return [];
};

const toDetails = (value: unknown): Detail[] =>
  Array.isArray(value)
    ? (value as Detail[]).filter((d) => d && typeof d.label === "string")
    : [];

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ContentProduct | null>(id ? FALLBACK[id] ?? null : null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!id) return;
      const data = await getProduct(id);
      if (!alive) return;
      if (data?.title) setProduct(data);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (!product) {
    if (loading) {
      return (
        <section className="pt-32 pb-16 bg-cream min-h-screen">
          <div className="container-page">
            <div className="h-6 w-40 rounded bg-muted animate-pulse" />
          </div>
        </section>
      );
    }
    return (
      <section className="pt-32 pb-16 bg-cream min-h-screen">
        <div className="container-page text-center">
          <h1 className="text-3xl font-bold text-heading mb-4">Produk tidak ditemukan</h1>
          <Button asChild variant="outline">
            <Link to="/product">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Produk
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  const paragraphs = toParagraphs(product.long_description);
  const details = toDetails(product.details);
  const image = PRODUCT_IMAGES[product.slug] ?? product.image_url ?? "/placeholder.svg";

  return (
    <>
      <section className="pt-28 pb-16 lg:pt-36 lg:pb-20 bg-cream">
        <div className="container-page">
          {/* Back button */}
          <Link
            to="/product"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Produk
          </Link>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Image */}
            <div className="animate-fade-in-up">
              <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-card bg-card">
                <div className="aspect-square">
                  <img src={image} alt={product.title} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <span className="inline-block text-xs font-semibold text-gold uppercase tracking-widest mb-3">
                {product.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-heading mb-6 leading-tight">
                {product.title}
              </h1>

              <div className="space-y-4 mb-8">
                {paragraphs.map((para, i) => (
                  <p key={i} className="text-muted-foreground leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              {/* Details */}
              {details.length > 0 && (
                <div className="rounded-xl border border-border/50 bg-card p-6 mb-8 space-y-4">
                  <h3 className="text-sm font-semibold text-heading uppercase tracking-wider mb-4">
                    Detail Buku
                  </h3>
                  {details.map((detail, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {detailIcon(detail.label)}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {detail.label}
                        </span>
                        <p className="text-sm font-medium text-heading">{detail.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA */}
              {CHECKOUT_PRODUCTS[product.slug] ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to={`/checkout/${product.slug}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl text-base font-semibold bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-primary/90 active:scale-[0.98] transition-all duration-300"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Beli Sekarang
                  </Link>
                  {product.external_link && (
                    <a
                      href={product.external_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 h-14 px-6 rounded-xl text-sm font-semibold border border-border bg-card hover:bg-muted/50 transition-all"
                    >
                      Lynk.id
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ) : (
                product.external_link && (
                  <a
                    href={product.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full h-14 px-8 rounded-xl text-base font-semibold bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-primary/90 active:scale-[0.98] transition-all duration-300"
                  >
                    Beli Sekarang
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetail;
