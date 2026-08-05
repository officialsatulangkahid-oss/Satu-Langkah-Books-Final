import howToReadABook from "@/assets/how-to-read-a-book.png";
import theArtOfReading from "@/assets/the-art-of-reading.png";
import conceptEducationIslam from "@/assets/book-concept-education-islam.png";
import islamSekularisme from "@/assets/book-islam-sekularisme.png";
import islamDiabolisme from "@/assets/book-islam-diabolisme.png";
import syakhshiyatulMuslim from "@/assets/book-syakhshiyatul-muslim.png";
import budayaIlmu from "@/assets/book-budaya-ilmu.png";
import atomicHabits from "@/assets/book-atomic-habits.png";
import kebangkitanUmat from "@/assets/book-kebangkitan-umat-islam.png";
import talimulMutaallim from "@/assets/book-talimul-mutaallim.png";
import sevenHabits from "@/assets/book-7-habits.png";

const books = [
  { title: "How to Read a Book", author: "Mortimer J. Adler & Charles Van Doren", image: howToReadABook },
  { title: "The Art of Reading", author: "Yogi Theo Rinaldi", image: theArtOfReading },
  { title: "The Concept of Education in Islam", author: "Syed Muhammad Naquib Al-Attas", image: conceptEducationIslam },
  { title: "Islam dan Sekularisme", author: "Syed Muhammad Naquib Al-Attas", image: islamSekularisme },
  { title: "Islam dan Diabolisme Intelektual", author: "Syamsuddin Arif", image: islamDiabolisme },
  { title: "Syakhshiyatul Muslim", author: "Dr. Muhammad Ali Al-Hasyimi", image: syakhshiyatulMuslim },
  { title: "Budaya Ilmu", author: "Wan Mohd Nor Wan Daud", image: budayaIlmu },
  { title: "Atomic Habits", author: "James Clear", image: atomicHabits },
  { title: "Model Kebangkitan Umat Islam", author: "Dr. Majid 'Irsan al-Kilani", image: kebangkitanUmat },
  { title: "Ta'limul Muta'allim", author: "Imam Az-Zarnuji", image: talimulMutaallim },
  { title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", image: sevenHabits },
];

// Duplicate for seamless infinite loop
const loopBooks = [...books, ...books];

const BookShowcaseSection = () => {
  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-page">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em]">
            Rekomendasi
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-heading mt-3 mb-4">
            Di Antara Buku-Buku Yang Kami Kurasi
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Koleksi buku pilihan yang diulas secara mendalam oleh Satu Langkah Books.
          </p>
        </div>
      </div>

      {/* Infinite Marquee Slider — full bleed */}
      <div
        className="relative overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="flex w-max gap-10 lg:gap-14 animate-marquee hover:[animation-play-state:paused]">
          {loopBooks.map((book, i) => (
            <div
              key={`${book.title}-${i}`}
              className="group flex flex-col items-center w-40 sm:w-48 shrink-0"
            >
              <div className="overflow-hidden rounded-lg mb-5 shadow-sm">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-auto object-contain group-hover:scale-[1.03] transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <h3 className="text-sm font-bold text-heading text-center leading-snug mb-1 line-clamp-2">
                {book.title}
              </h3>
              <p className="text-xs text-muted-foreground text-center line-clamp-1">{book.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BookShowcaseSection;
