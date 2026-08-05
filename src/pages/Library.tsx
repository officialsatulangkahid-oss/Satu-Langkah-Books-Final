import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useTransform } from "framer-motion";
import { ArrowRight, BookOpen, Compass } from "lucide-react";
import LibraryBlueprint, { useBlueprintProgress } from "@/components/library/LibraryBlueprint";

/** Progres pembangunan Satu Langkah Library — ubah nilai ini saja. */
export const LIBRARY_PROGRESS = 5;

const paragraphs = [
  "Halo Wargi Bandung,",
  "Satu Langkah Library hadir bukan sekadar sebagai tempat membaca, tetapi sebagai ruang untuk menghidupkan kembali tradisi ilmu yang pernah menjadi napas peradaban. Terinspirasi dari Baitul Hikmah—pusat keilmuan besar dalam sejarah Islam—kami ingin menghadirkan tempat di mana ilmu, adab, dan pencarian makna bisa tumbuh bersama.",
  "Di sisi lain, kami juga membangun ruang kafe yang terinspirasi dari suasana abad ke-17 hingga ke-19—era ketika diskusi hangat, pertukaran gagasan, dan refleksi lahir dari obrolan sederhana di meja-meja kecil ditemani secangkir kopi. Kami ingin menghadirkan suasana yang akrab, hangat, dan membumi, agar belajar terasa dekat dengan kehidupan sehari-hari, bukan sesuatu yang jauh dan kaku.",
  "Satu Langkah Library bukan hanya tentang bangunan, tapi tentang gerakan bersama. Setiap buku yang Wargi beli, setiap program yang diikuti, adalah bagian dari proses membangun perpustakaan ini. Tanpa terasa, langkah kecil itu menjadi kontribusi nyata dalam menghadirkan ruang ilmu untuk banyak orang.",
  "Karena pada akhirnya, perpustakaan ini bukan hanya milik kami—tapi milik kita semua. Tempat kita bertumbuh, berpikir, dan melangkah lebih jauh, bersama.",
];

const Library = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const progress = useBlueprintProgress(stageRef);

  const captionOpacity = useTransform(progress, [0.02, 0.12, 0.75, 0.82], [0, 1, 1, 0]);
  const titleOpacity = useTransform(progress, [0.8, 0.92], [0, 1]);
  const titleY = useTransform(progress, [0.8, 0.92], [24, 0]);
  const percent = useTransform(progress, (v) => `${Math.round(v * 100)}%`);

  return (
    <main className="bg-background">
      {/* Panggung gambar arsitektur */}
      <section ref={stageRef} className="relative h-[520vh] bg-cream">
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-4">
          <motion.p
            style={{ opacity: captionOpacity }}
            className="mb-4 text-xs uppercase tracking-[0.32em] text-muted-foreground"
          >
            Sedang digambar · Satu Langkah Library
          </motion.p>

          <div className="w-full max-w-6xl">
            <LibraryBlueprint progress={progress} />
          </div>

          <motion.div
            style={{ opacity: titleOpacity, y: titleY }}
            className="mt-6 text-center"
          >
            <h1 className="text-3xl font-semibold tracking-tight text-heading sm:text-5xl">
              Satu Langkah Library
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">Dari Bandung Tumbuh Budaya Ilmu</p>
          </motion.div>

          <motion.span
            style={{ opacity: captionOpacity }}
            className="absolute bottom-6 right-6 font-mono text-xs text-muted-foreground"
          >
            <motion.span>{percent}</motion.span>
          </motion.span>
        </div>
      </section>

      {/* Naskah */}
      <section className="bg-background px-6 py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[700px]">
          {paragraphs.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className={
                i === 0
                  ? "mb-8 text-lg font-medium text-heading"
                  : "mb-8 text-[1.125rem] leading-[1.85] text-foreground/80"
              }
            >
              {p}
            </motion.p>
          ))}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-14 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to="/product"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <BookOpen className="h-4 w-4" />
              Beli Produk
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/project"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-7 py-3.5 text-sm font-semibold text-heading transition-all duration-300 hover:-translate-y-0.5 hover:bg-cream-dark"
            >
              Mau Kolaborasi?
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/about"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-heading transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:text-gold"
            >
              <Compass className="h-4 w-4" />
              Tentang Kami
            </Link>
          </motion.div>

          {/* Indikator progres pembangunan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20 border-t border-border pt-8"
          >
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Building Satu Langkah Library
              </p>
              <p className="font-mono text-sm font-semibold text-heading">{LIBRARY_PROGRESS}%</p>
            </div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-cream-dark">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${LIBRARY_PROGRESS}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gold"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Library;
