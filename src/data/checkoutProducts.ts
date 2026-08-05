import readingJournalSpecial from "@/assets/reading-journal-special.png";
import readingJournal2026 from "@/assets/reading-journal-2026.png";

export interface CheckoutProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  type: "ebook" | "ecourse";
  shortDesc: string;
}

export const CHECKOUT_PRODUCTS: Record<string, CheckoutProduct> = {
  "reading-journal-2026": {
    id: "reading-journal-2026",
    name: "Reading Journal 2026",
    price: 75000,
    image: readingJournal2026,
    type: "ebook",
    shortDesc: "Jurnal membaca tahunan dengan refleksi Islami.",
  },
  "reading-journal-special": {
    id: "reading-journal-special",
    name: "Reading Journal 2026 Special Edition for Sister",
    price: 89000,
    image: readingJournalSpecial,
    type: "ebook",
    shortDesc: "Edisi spesial untuk para sister muslimah.",
  },
};

// Voucher list (dummy, client-side)
export const VOUCHERS: Record<string, { type: "percent" | "fixed"; value: number; label: string }> = {
  READ10: { type: "percent", value: 10, label: "Diskon 10%" },
  WELCOME: { type: "fixed", value: 15000, label: "Potongan Rp 15.000" },
  SISTER20: { type: "percent", value: 20, label: "Diskon 20% sister edition" },
};