/** Snap filters payment choices against the methods enabled for this merchant.
 * These are display preferences, not authorization or pricing rules.
 * https://docs.midtrans.com/reference/snap-js
 */
export type PaymentMethodId = "qris" | "bank_transfer" | "ewallet" | "credit_card" | "paylater" | "cstore";
export interface SnapPaymentPreferences {
  enabledPayments?: string[];
  uiMode?: "qr" | "auto";
}
export const CHECKOUT_PAYMENT_METHODS: { id: PaymentMethodId; label: string; description: string }[] = [
  { id: "qris", label: "QRIS", description: "Scan kode QR untuk membayar" },
  { id: "bank_transfer", label: "Bank Transfer (VA)", description: "BCA, BNI, BRI, Mandiri, Permata" },
  { id: "ewallet", label: "GoPay / e-Wallet", description: "GoPay, ShopeePay, OVO, DANA" },
  { id: "credit_card", label: "Kartu Kredit/Debit", description: "Visa, Mastercard, JCB" },
  { id: "paylater", label: "Akulaku / Kredivo", description: "Pilihan cicilan sesuai ketentuan penyedia" },
  { id: "cstore", label: "Convenience Store", description: "Alfamart, Indomaret" },
];
const paymentCodes: Record<PaymentMethodId, string[]> = {
  qris: ["gopay", "shopeepay", "other_qris"],
  bank_transfer: ["bca_va", "bni_va", "bri_va", "permata_va", "echannel", "cimb_va", "danamon_va", "bsi_va", "seabank_va", "saqu_va"],
  ewallet: ["gopay", "shopeepay", "ovo", "dana"],
  credit_card: ["credit_card"],
  paylater: ["akulaku", "kredivo"],
  cstore: ["alfamart", "indomaret"],
};
export function paymentPreferences(method: PaymentMethodId | "all"): SnapPaymentPreferences {
  if (method === "all") return {};
  return { enabledPayments: [...paymentCodes[method]], uiMode: method === "qris" ? "qr" : "auto" };
}
