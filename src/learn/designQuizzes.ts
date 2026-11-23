import type { QuizQuestion } from "./data";
const q = (id: string, question: string, options: string[], correct: number, explanation: string): QuizQuestion => ({ id, question, options, correct, explanation });
export const designQuizzes: Record<string, QuizQuestion[]> = {
 "elemen-visual": [
  q("elemen-1", "Sebelum memilih warna dan efek untuk poster, apa yang perlu ditentukan?", ["Pesan utama dan pembaca sasaran", "Jumlah dekorasi sebanyak mungkin", "Filter foto yang sedang tren", "Aplikasi yang paling mahal"], 0, "Tujuan komunikasi dan pembaca menentukan pilihan visual yang relevan."),
  q("elemen-2", "Ruang kosong pada desain terutama membantu untuk…", ["Mengisi halaman dengan hiasan", "Memberi jeda dan memisahkan kelompok informasi", "Menghilangkan semua informasi penting", "Memperbesar ukuran file"], 1, "Ruang kosong memberi jeda visual sehingga isi lebih mudah dibaca dan dikelompokkan."),
  q("elemen-3", "Sebuah ilustrasi menarik justru mengalihkan perhatian dari ajakan utama. Langkah yang tepat?", ["Tambahkan ilustrasi lain", "Besarkan semua elemen", "Kurangi dominasi ilustrasi agar mendukung pesan", "Hilangkan ajakan utama"], 2, "Elemen visual sebaiknya membantu pesan, bukan bersaing dengannya."),
 ],
 "prinsip-hierarki": [
  q("hierarki-1", "Judul, tanggal, dan catatan terlihat sama kuat. Apa perbaikan awalnya?", ["Tambahkan bayangan ke semua teks", "Buat tingkatan ukuran dan bobot berdasarkan prioritas", "Ganti setiap kata dengan font berbeda", "Samakan jarak semua huruf"], 1, "Hierarki membantu mata mengetahui informasi yang harus dibaca lebih dahulu."),
  q("hierarki-2", "Tanggal dan lokasi acara merupakan satu kelompok informasi. Bagaimana menatanya?", ["Letakkan di dua sudut yang berjauhan", "Putar keduanya ke arah berbeda", "Letakkan berdekatan dengan jarak kelompok yang konsisten", "Sembunyikan lokasi"], 2, "Prinsip kedekatan menunjukkan hubungan antar informasi."),
  q("hierarki-3", "Apa manfaat mengulang gaya heading dan jarak secara konsisten?", ["Membangun pola visual yang mudah dikenali", "Membuat semua bagian sama pentingnya", "Menghilangkan kebutuhan membaca", "Menambah dekorasi tanpa tujuan"], 0, "Repetisi yang terarah membangun konsistensi dan membantu pembaca mengikuti struktur."),
 ],
 "tipografi": [
  q("tipe-1", "Cara paling terarah membedakan judul, isi, dan catatan adalah…", ["Memakai font baru pada setiap baris", "Membuat skala ukuran dan bobot yang konsisten", "Menulis semua isi dengan huruf dekoratif", "Memadatkan semua teks tanpa jarak"], 1, "Skala teks dan bobot membentuk struktur tanpa membutuhkan banyak keluarga font."),
  q("tipe-2", "Paragraf terasa sesak meski ukuran huruf cukup besar. Apa yang perlu diperiksa?", ["Nama file desain", "Jumlah ikon", "Warna aplikasi", "Jarak antarbaris dan panjang baris"], 3, "Keterbacaan juga dipengaruhi leading dan panjang baris, bukan hanya ukuran huruf."),
  q("tipe-3", "Bagaimana memilih serif atau sans serif?", ["Serif selalu salah untuk poster", "Sans serif selalu lebih profesional", "Sesuaikan konteks, karakter pesan, dan keterbacaannya", "Pilih yang paling sulit dibaca"], 2, "Tidak ada satu kategori font yang selalu benar; fungsi, konteks, dan keterbacaan menjadi pertimbangan."),
 ],
 "warna": [
  q("warna-1", "Teks terang sulit terbaca di atas foto terang. Apa yang paling membantu?", ["Menambah jumlah warna", "Memperkuat kontras terang-gelap dan menstabilkan latar teks", "Menambah saturasi semua elemen", "Mengubah nama font"], 1, "Kontras terang-gelap dan latar yang stabil membantu teks terpisah dari gambar."),
  q("warna-2", "Palet awal yang mudah dikelola biasanya membagi warna menjadi…", ["Satu warna berbeda untuk setiap huruf", "Seluruh warna dari foto referensi", "Warna utama, aksen, dan netral", "Warna paling terang saja"], 2, "Pembagian fungsi warna membantu konsistensi dan memberi aksen pada bagian penting."),
  q("warna-3", "Mengapa informasi penting sebaiknya tidak dibedakan dengan warna saja?", ["Sebagian pembaca mungkin kesulitan membedakan warna tersebut", "Warna tidak pernah boleh digunakan", "Semua desain harus hitam putih", "Ukuran file akan selalu lebih kecil"], 0, "Label, bentuk, atau ikon dapat mendampingi warna agar informasi tetap dapat dipahami."),
 ],
 "komposisi": [
  q("layout-1", "Apa fungsi grid dalam tata letak?", ["Memaksa semua desain terlihat identik", "Menentukan warna secara otomatis", "Menggantikan pesan utama", "Membantu alignment dan hubungan antar elemen"], 3, "Grid adalah alat bantu mengatur posisi dan hubungan, bukan pengganti keputusan desain."),
  q("layout-2", "Tepi kiri judul dan isi sedikit bergeser tanpa alasan. Perbaikan yang masuk akal?", ["Tambah hiasan pada bagian kosong", "Gunakan titik alignment yang konsisten", "Putar semua elemen", "Perkecil margin sampai habis"], 1, "Alignment yang konsisten membuat komposisi lebih teratur dan mudah diikuti."),
  q("layout-3", "Mengapa membuat beberapa thumbnail layout sebelum detail warna?", ["Membandingkan komposisi dan urutan baca lebih cepat", "Menghindari seluruh proses revisi", "Memastikan semua layout sama", "Menggantikan kebutuhan brief"], 0, "Thumbnail sederhana memungkinkan eksplorasi struktur tanpa terikat detail visual terlalu dini."),
 ],
 "analisis-poster": [
  q("analisis-1", "Saat mempelajari poster referensi, apa yang sebaiknya ditiru?", ["Seluruh komposisi tanpa perubahan", "Logo pembuatnya", "Prinsip yang membuat pesannya bekerja, dengan penerapan baru", "Semua gambar tanpa memeriksa izin"], 2, "Analisis referensi mempelajari alasan dan prinsipnya, bukan menjiplak karya."),
  q("analisis-2", "Pertanyaan awal untuk menilai poster adalah…", ["Apakah efeknya paling banyak?", "Apa pesannya, siapa pembacanya, dan ke mana mata diarahkan?", "Apakah semua area terisi?", "Apakah dibuat di aplikasi mahal?"], 1, "Efektivitas poster dinilai dalam konteks tujuan dan pembaca sasarannya."),
  q("analisis-3", "Masukan 'desain ini kurang bagus' menjadi lebih berguna jika…", ["Diulang tanpa contoh", "Diubah menjadi selera pribadi saja", "Dikirim tanpa konteks", "Dijelaskan masalah spesifik, dampaknya pada pembaca, dan usulan revisi"], 3, "Umpan balik yang spesifik membuat revisi dapat dicoba dan dievaluasi."),
 ],
 "praktik-tipografi": [
  q("praktik-1", "Saat mengikuti demonstrasi InDesign dengan aplikasi lain, fokus utamanya adalah…", ["Mencari tombol dengan posisi yang persis sama", "Memahami hierarki, grid, dan keputusan visual yang diterapkan", "Mengganti semua teks dengan gambar", "Meniru seluruh karya tanpa analisis"], 1, "Prinsip desain dapat diterapkan lintas aplikasi walaupun letak tombol dan alur kerjanya berbeda."),
  q("praktik-2", "Urutan kerja yang paling mendukung eksplorasi adalah…", ["Ekspor final dahulu, baru tentukan pesan", "Pilih efek dahulu, abaikan brief", "Tentukan pesan, eksplorasi beberapa layout, pilih, lalu sempurnakan", "Gunakan draft pertama tanpa evaluasi"], 2, "Eksplorasi memberi pilihan sebelum waktu dihabiskan untuk detail dan penyempurnaan."),
  q("praktik-3", "Apa yang perlu dibandingkan antara draft dan revisi poster?", ["Apakah pesan, urutan baca, dan keterbacaan membaik", "Apakah ukuran file selalu bertambah", "Apakah revisi memakai lebih banyak efek", "Apakah jumlah font meningkat"], 0, "Revisi dinilai dari perbaikan fungsi komunikasi, bukan bertambahnya dekorasi."),
 ],
 "proyek-akhir": [
  q("proyek-1", "Dalam brief 'Satu Hari, Satu Halaman', apa ajakan tindakannya?", ["Beli aplikasi desain", "Tambahkan lima judul utama", "Gunakan semua warna", "Mulai dari satu halaman hari ini"], 3, "Ajakan yang diminta brief mengajak pembaca mulai membaca dari langkah yang kecil dan konkret."),
  q("proyek-2", "Rubrik penilaian mandiri proyek mencakup…", ["Harga aplikasi dan kecepatan komputer", "Pesan, hierarki, keterbacaan, kontras, dan konsistensi", "Jumlah efek dan font sebanyak mungkin", "Selera pembuat tanpa mempertimbangkan pembaca"], 1, "Lima kriteria tersebut menilai apakah keputusan visual mendukung komunikasi."),
  q("proyek-3", "Dua aspek rubrik mendapat nilai paling rendah. Langkah selanjutnya?", ["Hapus versi awal dan abaikan hasilnya", "Langsung klaim karya sudah dinilai mentor", "Revisi dua aspek tersebut dan bandingkan hasil dengan draft", "Tambah dekorasi tanpa mengubah masalah"], 2, "Evaluasi mandiri dipakai untuk merencanakan revisi yang terarah dan melihat dampaknya."),
 ],
};
