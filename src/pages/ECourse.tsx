import CourseCard from "@/components/courses/CourseCard";
import { CheckCircle, Sparkles } from "lucide-react";

const courses = [
  {
    id: "pengantar-tauhid",
    title: "Pengantar Ilmu Tauhid",
    description: "Memahami dasar-dasar tauhid sebagai fondasi kehidupan seorang muslim dengan pendekatan yang sistematis.",
    level: "Pemula" as const,
    duration: "4 Jam",
    lessons: 12,
    students: 250,
    price: "Rp 99.000",
    priceAmount: 99000,
  },
  {
    id: "adab-penuntut-ilmu",
    title: "Adab Penuntut Ilmu",
    description: "Mempelajari adab-adab yang harus dimiliki seorang penuntut ilmu berdasarkan tuntunan ulama salaf.",
    level: "Pemula" as const,
    duration: "3 Jam",
    lessons: 8,
    students: 180,
    price: "Rp 79.000",
    priceAmount: 79000,
  },
  {
    id: "manhaj-belajar",
    title: "Manhaj Belajar Islam",
    description: "Panduan praktis dalam menyusun kurikulum belajar Islam mandiri yang terstruktur dan berkelanjutan.",
    level: "Menengah" as const,
    duration: "6 Jam",
    lessons: 15,
    students: 120,
    price: "Rp 149.000",
    priceAmount: 149000,
  },
  {
    id: "pendidikan-anak",
    title: "Pendidikan Anak Islami",
    description: "Prinsip dan metode mendidik anak sesuai tuntunan Islam untuk membentuk generasi yang berakhlak mulia.",
    level: "Menengah" as const,
    duration: "5 Jam",
    lessons: 10,
    students: 200,
    price: "Rp 129.000",
    priceAmount: 129000,
  },
];

const benefits = [
  "Akses selamanya ke materi kursus",
  "Sertifikat digital setelah menyelesaikan kursus",
  "Grup diskusi eksklusif dengan peserta lain",
  "Materi dapat diunduh untuk belajar offline",
  "Update materi secara berkala",
];

const ECourse = () => {
  return (
    <>
      {/* Header */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary-foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary-foreground)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        <div className="container-page relative text-primary-foreground">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>E-Course</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
              Kursus <span className="text-gold">Online</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 leading-relaxed mb-10">
              Kursus online terstruktur dengan materi mendalam untuk memperkuat 
              pemahaman Anda tentang Islam dan kehidupan.
            </p>

            {/* Benefits */}
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 text-primary-foreground/90">
                  <div className="p-1 rounded-full bg-gold/20">
                    <CheckCircle className="h-4 w-4 text-gold" />
                  </div>
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="section-padding bg-background">
        <div className="container-page">
          <div className="mb-12 animate-fade-in-up">
            <span className="text-sm font-semibold text-gold uppercase tracking-widest">
              Pilih Kursus
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-heading mt-2 mb-3">
              Katalog Kursus
            </h2>
            <p className="text-muted-foreground">
              Pilih kursus yang sesuai dengan kebutuhan belajar Anda
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {courses.map((course, index) => (
              <div 
                key={course.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CourseCard {...course} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-cream">
        <div className="container-page">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-heading mb-3">
                Pertanyaan Umum
              </h2>
              <p className="text-muted-foreground">
                Jawaban untuk pertanyaan yang sering diajukan
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Bagaimana cara mengakses kursus setelah pembelian?",
                  a: "Setelah pembayaran berhasil, Anda akan menerima email berisi link akses ke kursus. Anda juga dapat mengakses kursus melalui akun Anda di website kami."
                },
                {
                  q: "Apakah ada batas waktu untuk menyelesaikan kursus?",
                  a: "Tidak ada batas waktu. Anda memiliki akses selamanya ke kursus yang sudah dibeli dan dapat belajar sesuai dengan kecepatan Anda sendiri."
                },
                {
                  q: "Bagaimana jika saya memiliki pertanyaan tentang materi?",
                  a: "Setiap kursus memiliki grup diskusi eksklusif di mana Anda dapat bertanya dan berdiskusi dengan peserta lain serta fasilitator."
                },
              ].map((faq, index) => (
                <div 
                  key={index} 
                  className="p-7 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <h4 className="font-bold text-heading mb-3 text-lg">{faq.q}</h4>
                  <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ECourse;
