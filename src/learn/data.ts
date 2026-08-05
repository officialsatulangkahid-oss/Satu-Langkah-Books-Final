export type Lesson = {
  id: string;
  title: string;
  duration: string;
  minutes: number;
  type: "video" | "reading";
  hasQuiz?: boolean;
  overview: string;
  objectives: string[];
  summary: string[];
  takeaways: string[];
  quotes: { text: string; author: string }[];
  reflection: string;
  transcript: string[];
};

export type Chapter = { id: string; title: string; lessons: Lesson[] };

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

export type Course = {
  slug: string;
  title: string;
  subtitle: string;
  instructor: string;
  instructorRole: string;
  category: string;
  level: "Pemula" | "Menengah" | "Lanjutan";
  duration: string;
  readingTime: string;
  rating: number;
  reviews: number;
  students: number;
  price: string;
  cover: string;
  description: string;
  includes: string[];
  chapters: Chapter[];
  quiz: QuizQuestion[];
};

const lesson = (
  id: string,
  title: string,
  minutes: number,
  extra: Partial<Lesson> = {}
): Lesson => ({
  id,
  title,
  minutes,
  duration: `${minutes} menit`,
  type: "video",
  overview:
    "Pelajaran ini memperkenalkan membaca sebagai proses intelektual yang aktif. Pembaca akan memahami mengapa membaca lebih dari sekadar mengenali kata, dan bagaimana pemahaman menuntut pemikiran yang disengaja.",
  objectives: [
    "Menjelaskan mengapa membaca adalah aktivitas aktif.",
    "Membedakan membaca pasif dan membaca aktif.",
    "Memahami definisi membaca menurut Adler.",
    "Menerapkan teknik membaca aktif pada bacaan sehari-hari.",
  ],
  summary: [
    "Membaca yang baik menuntut pembaca mengajukan pertanyaan kepada teks, bukan menunggu teks menjelaskan dirinya sendiri.",
    "Pemahaman tumbuh ketika pembaca berusaha menyamai pikiran penulis, bukan sekadar mengingat kalimatnya.",
    "Kecepatan membaca hanyalah alat; yang menentukan adalah kedalaman pemahaman.",
  ],
  takeaways: [
    "Membaca aktif = bertanya, menandai, meringkas, dan mengevaluasi.",
    "Setiap buku menuntut level membaca yang berbeda.",
    "Catatan pinggir adalah percakapan dengan penulis.",
  ],
  quotes: [
    {
      text: "Membaca yang baik adalah membaca dengan aktif; semakin besar usaha, semakin besar pemahaman.",
      author: "Mortimer J. Adler",
    },
  ],
  reflection:
    "Ambil satu buku yang sedang kamu baca. Tuliskan tiga pertanyaan yang ingin kamu ajukan kepada penulisnya, lalu cari jawabannya di dalam teks.",
  transcript: [
    "Selamat datang di pelajaran pertama. Sebelum kita bicara teknik, kita perlu menyepakati satu hal: membaca bukan aktivitas pasif.",
    "Adler membedakan antara membaca untuk informasi dan membaca untuk pemahaman. Keduanya sah, tetapi hanya yang kedua yang membuat kita tumbuh.",
    "Bayangkan penulis sebagai seseorang yang berbicara kepada kita dari jarak jauh. Tugas kita adalah menangkap maksudnya seutuhnya.",
  ],
  ...extra,
});

export const courses: Course[] = [
  {
    slug: "how-to-read-a-book",
    title: "How to Read a Book",
    subtitle: "Seni membaca yang mengubah cara kamu berpikir",
    instructor: "Tim Satu Langkah",
    instructorRole: "Kurator Literasi",
    category: "Literasi",
    level: "Menengah",
    duration: "4j 20m",
    readingTime: "± 5 jam membaca",
    rating: 4.9,
    reviews: 328,
    students: 1240,
    price: "Rp 149.000",
    cover:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80",
    description:
      "Kursus berbasis buku klasik Mortimer J. Adler ini membimbing kamu melewati empat level membaca — elementer, inspeksional, analitis, hingga sintopikal. Cocok untuk siapa pun yang ingin membaca lebih sedikit buku, tetapi memahaminya jauh lebih dalam.",
    includes: [
      "18 video pembelajaran",
      "Materi bacaan tiap bab",
      "PDF ringkasan yang bisa diunduh",
      "Kuis interaktif tiap pelajaran",
      "Sertifikat penyelesaian",
    ],
    chapters: [
      {
        id: "intro",
        title: "Introduction",
        lessons: [
          lesson("intro-1", "Welcome", 4),
          lesson("intro-2", "How this course works", 6),
          lesson("intro-3", "About the author", 5),
          lesson("intro-4", "How to get the most from this course", 7, { hasQuiz: true }),
        ],
      },
      {
        id: "ch1",
        title: "Chapter 1 — The Art of Reading",
        lessons: [
          lesson("ch1-1", "What is Reading?", 12, { hasQuiz: true }),
          lesson("ch1-2", "Active Reading", 14, { hasQuiz: true }),
          lesson("ch1-3", "Passive Reading", 9),
          lesson("ch1-4", "Four Levels of Reading", 16, { hasQuiz: true }),
          lesson("ch1-5", "Reading for Understanding", 11, { type: "reading" }),
          lesson("ch1-6", "Common Reading Mistakes", 10),
        ],
      },
      {
        id: "ch2",
        title: "Chapter 2 — Inspectional Reading",
        lessons: [
          lesson("ch2-1", "Systematic Skimming", 13, { hasQuiz: true }),
          lesson("ch2-2", "Superficial Reading", 10),
          lesson("ch2-3", "When to Skim", 8),
        ],
      },
      {
        id: "ch3",
        title: "Chapter 3 — Analytical Reading",
        lessons: [
          lesson("ch3-1", "Asking Questions", 12, { hasQuiz: true }),
          lesson("ch3-2", "Understanding Arguments", 15),
          lesson("ch3-3", "Finding Main Ideas", 11),
          lesson("ch3-4", "Criticizing Fairly", 13),
        ],
      },
      {
        id: "ch4",
        title: "Chapter 4 — Syntopical Reading",
        lessons: [
          lesson("ch4-1", "Reading Multiple Books", 14, { hasQuiz: true }),
          lesson("ch4-2", "Comparing Authors", 12),
          lesson("ch4-3", "Building Knowledge", 13, { type: "reading" }),
        ],
      },
      {
        id: "final",
        title: "Final Quiz & Certificate",
        lessons: [
          lesson("final-1", "Final Quiz", 20, { hasQuiz: true }),
          lesson("final-2", "Certificate", 3, { type: "reading" }),
        ],
      },
    ],
    quiz: [
      {
        id: "q1",
        question: "Menurut Adler, membaca yang baik menuntut...",
        options: ["Menghafal", "Berpikir aktif", "Membaca cepat", "Menonton video"],
        correct: 1,
        explanation:
          "Adler menekankan bahwa pemahaman lahir dari usaha berpikir aktif, bukan sekadar menghafal atau mempercepat laju baca.",
      },
      {
        id: "q2",
        question: "Level membaca manakah yang berfokus pada pemahaman mendalam?",
        options: ["Elementary", "Inspectional", "Analytical", "Entertainment"],
        correct: 2,
        explanation:
          "Analytical reading adalah level ketiga yang menuntut pembaca membedah struktur, argumen, dan maksud penulis secara menyeluruh.",
      },
      {
        id: "q3",
        question: "Systematic skimming paling tepat digunakan untuk...",
        options: [
          "Menghafal seluruh isi buku",
          "Menilai apakah buku layak dibaca mendalam",
          "Menggantikan membaca analitis",
          "Mencari hiburan",
        ],
        correct: 1,
        explanation:
          "Skimming sistematis membantu kita memutuskan apakah sebuah buku pantas mendapat waktu baca yang lebih serius.",
      },
    ],
  },
  {
    slug: "the-art-of-reading",
    title: "The Art of Reading",
    subtitle: "Menumbuhkan kebiasaan membaca yang berkelanjutan",
    instructor: "Tim Satu Langkah",
    instructorRole: "Kurator Literasi",
    category: "Kebiasaan",
    level: "Pemula",
    duration: "2j 45m",
    readingTime: "± 3 jam membaca",
    rating: 4.8,
    reviews: 194,
    students: 860,
    price: "Rp 99.000",
    cover:
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1200&q=80",
    description:
      "Membangun ritme membaca yang konsisten, memilih buku yang tepat, dan merawat perpustakaan pribadi. Kursus ringan untuk pembaca yang ingin memulai kembali.",
    includes: [
      "12 video pembelajaran",
      "Template reading journal (PDF)",
      "Kuis refleksi",
      "Sertifikat penyelesaian",
    ],
    chapters: [
      {
        id: "intro",
        title: "Introduction",
        lessons: [lesson("a-intro-1", "Welcome", 4), lesson("a-intro-2", "Cara memakai kursus ini", 5)],
      },
      {
        id: "ch1",
        title: "Chapter 1 — Membangun Ritme",
        lessons: [
          lesson("a-ch1-1", "Menemukan waktu membaca", 11, { hasQuiz: true }),
          lesson("a-ch1-2", "Lingkungan baca yang tenang", 9),
          lesson("a-ch1-3", "Mengatasi kebuntuan membaca", 12),
        ],
      },
      {
        id: "ch2",
        title: "Chapter 2 — Merawat Bacaan",
        lessons: [
          lesson("a-ch2-1", "Reading journal", 13, { type: "reading", hasQuiz: true }),
          lesson("a-ch2-2", "Kurasi perpustakaan pribadi", 10),
        ],
      },
    ],
    quiz: [
      {
        id: "q1",
        question: "Kunci utama kebiasaan membaca yang bertahan adalah...",
        options: ["Target jumlah buku", "Konsistensi kecil harian", "Membaca cepat", "Membeli banyak buku"],
        correct: 1,
        explanation: "Konsistensi kecil yang berulang jauh lebih kuat daripada target besar yang jarang tercapai.",
      },
    ],
  },
  {
    slug: "membaca-dalam-tradisi-islam",
    title: "Membaca dalam Tradisi Islam",
    subtitle: "Iqra' sebagai fondasi peradaban ilmu",
    instructor: "Tim Satu Langkah",
    instructorRole: "Kurator Literasi",
    category: "Islam & Ilmu",
    level: "Menengah",
    duration: "3j 10m",
    readingTime: "± 4 jam membaca",
    rating: 4.9,
    reviews: 142,
    students: 610,
    price: "Rp 129.000",
    cover:
      "https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=1200&q=80",
    description:
      "Menelusuri budaya membaca, menyalin, dan mewariskan ilmu dalam tradisi Islam klasik — dari majelis ilmu hingga perpustakaan besar dunia Muslim.",
    includes: ["10 video pembelajaran", "Bacaan primer terpilih", "Kuis tiap bab", "Sertifikat penyelesaian"],
    chapters: [
      {
        id: "intro",
        title: "Introduction",
        lessons: [lesson("i-intro-1", "Welcome", 4), lesson("i-intro-2", "Peta kursus", 6)],
      },
      {
        id: "ch1",
        title: "Chapter 1 — Iqra' dan Awal Mula",
        lessons: [
          lesson("i-ch1-1", "Makna Iqra'", 12, { hasQuiz: true }),
          lesson("i-ch1-2", "Majelis ilmu", 10),
          lesson("i-ch1-3", "Tradisi hafalan dan tulisan", 14),
        ],
      },
    ],
    quiz: [
      {
        id: "q1",
        question: "Wahyu pertama menekankan perintah untuk...",
        options: ["Berperang", "Membaca", "Berdagang", "Berdiam"],
        correct: 1,
        explanation: "Perintah pertama adalah Iqra' — bacalah, yang menjadi fondasi tradisi keilmuan Islam.",
      },
    ],
  },
  {
    slug: "menulis-esai-reflektif",
    title: "Menulis Esai Reflektif",
    subtitle: "Dari catatan bacaan menjadi tulisan bermakna",
    instructor: "Tim Satu Langkah",
    instructorRole: "Editor",
    category: "Menulis",
    level: "Lanjutan",
    duration: "3j 40m",
    readingTime: "± 4 jam membaca",
    rating: 4.7,
    reviews: 88,
    students: 420,
    price: "Rp 159.000",
    cover:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
    description:
      "Mengubah kebiasaan membaca menjadi kemampuan menulis. Struktur esai, suara personal, dan disiplin revisi.",
    includes: ["14 video pembelajaran", "Lembar kerja menulis (PDF)", "Kuis tiap bab", "Sertifikat penyelesaian"],
    chapters: [
      {
        id: "intro",
        title: "Introduction",
        lessons: [lesson("m-intro-1", "Welcome", 4)],
      },
      {
        id: "ch1",
        title: "Chapter 1 — Menemukan Gagasan",
        lessons: [
          lesson("m-ch1-1", "Dari kutipan ke gagasan", 13, { hasQuiz: true }),
          lesson("m-ch1-2", "Menyusun kerangka", 11),
        ],
      },
    ],
    quiz: [
      {
        id: "q1",
        question: "Esai reflektif paling kuat ketika...",
        options: [
          "Penuh kutipan tanpa analisis",
          "Menghubungkan bacaan dengan pengalaman dan gagasan penulis",
          "Sepanjang mungkin",
          "Menghindari sudut pandang pribadi",
        ],
        correct: 1,
        explanation: "Refleksi bermakna lahir dari pertemuan antara teks, pengalaman, dan pemikiran penulis.",
      },
    ],
  },
];

export const categories = [
  { name: "Literasi", icon: "BookOpen", count: 12, desc: "Teknik & seni membaca" },
  { name: "Islam & Ilmu", icon: "Moon", count: 8, desc: "Tradisi keilmuan Islam" },
  { name: "Menulis", icon: "PenLine", count: 6, desc: "Esai, catatan, refleksi" },
  { name: "Kebiasaan", icon: "Sprout", count: 5, desc: "Ritme belajar harian" },
  { name: "Pendidikan", icon: "GraduationCap", count: 7, desc: "Belajar & mengajar" },
  { name: "Filsafat", icon: "Compass", count: 4, desc: "Berpikir mendalam" },
];

export const testimonials = [
  {
    name: "Rania Putri",
    role: "Mahasiswa",
    text: "Kelas How to Read a Book benar-benar mengubah cara saya membaca. Sekarang saya membaca lebih sedikit, tapi jauh lebih paham.",
    rating: 5,
  },
  {
    name: "Ahmad Fauzi",
    role: "Guru",
    text: "Materinya tenang dan tidak membuat kewalahan. Kuis tiap pelajaran membantu saya mengingat inti pembahasan.",
    rating: 5,
  },
  {
    name: "Dewi Anggraini",
    role: "Penulis lepas",
    text: "Reading journal dan sertifikatnya membuat proses belajar terasa nyata. Desainnya juga nyaman dipakai berjam-jam.",
    rating: 4,
  },
];

export const faqs = [
  {
    q: "Apakah kursus bisa diakses selamanya?",
    a: "Ya. Setelah mendaftar, kamu memiliki akses seumur hidup ke seluruh materi kursus beserta pembaruannya.",
  },
  {
    q: "Apakah saya mendapatkan sertifikat?",
    a: "Sertifikat otomatis diterbitkan ketika progres kursus mencapai 100%, lengkap dengan ID unik dan bisa diunduh.",
  },
  {
    q: "Apakah materi bisa diunduh?",
    a: "Ringkasan pelajaran dan lembar kerja tersedia dalam format PDF yang dapat diunduh di setiap pelajaran.",
  },
  {
    q: "Apakah cocok untuk pemula?",
    a: "Sangat cocok. Setiap kursus memiliki tingkat kesulitan yang jelas, dan kamu bisa memulai dari kursus level Pemula.",
  },
  {
    q: "Bagaimana cara belajar lewat ponsel?",
    a: "Seluruh tampilan telah dioptimalkan untuk ponsel. Kurikulum akan tampil sebagai panel geser agar video tetap menjadi fokus utama.",
  },
];

export const getCourse = (slug?: string) => courses.find((c) => c.slug === slug);

export const allLessons = (course: Course) =>
  course.chapters.flatMap((ch) => ch.lessons.map((l) => ({ ...l, chapterTitle: ch.title })));