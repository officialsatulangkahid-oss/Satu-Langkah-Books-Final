## Rencana Implementasi

### Bagian 1: Form Pendaftaran Lengkap
Memperluas form signup di `src/pages/Auth.tsx` dengan field tambahan:
- Email, Username, Password, Confirm Password
- Full Name, Date of Birth, Gender, Country

**Perubahan database** (migrasi):
- Tambah kolom ke tabel `profiles`: `username` (unique), `full_name`, `date_of_birth`, `gender`, `country`
- Update trigger `handle_new_user` agar mengisi field baru dari `raw_user_meta_data`
- Tambah constraint unique pada `username`

**Validasi form** (Zod):
- Email valid, username 3-20 char alphanumeric, password min 8 char, confirm password match
- DOB tidak boleh masa depan, gender enum, country dari list
- Toggle show/hide password

UI tetap premium dengan layout 2-kolom untuk field pendek (DOB+Gender, Country).

### Bagian 2: Alur Checkout Multi-Step (Midtrans)
Membuat halaman checkout baru `/checkout/:productId` dengan stepper 4 tahap:

```
[1] Voucher → [2] Data Diri → [3] Pembayaran → [4] Selesai
```

**Step 1 — Voucher**
- Input kode voucher (opsional), tombol "Terapkan"
- Tampilkan ringkasan harga (subtotal, diskon, total)
- Untuk sekarang: validasi voucher dummy lokal (mis. `READ10` = 10% off). Bisa diganti backend nanti.

**Step 2 — Data Diri**
- Auto-fill dari profil user kalau login (nama, email, phone)
- Field: Nama, Email, No WhatsApp, Alamat (opsional)
- Validasi Zod

**Step 3 — Pembayaran**
- Pilihan metode pembayaran (visual cards): Bank Transfer (BCA/BNI/Mandiri/BRI), QRIS, GoPay, ShopeePay, Kartu Kredit, Alfamart/Indomaret
- Tombol "Bayar Sekarang" → memanggil edge function `create-transaction` yang sudah ada
- Pakai **Midtrans Snap** popup (script `snap.js`) bukan redirect, agar kembali ke step 4 setelah sukses
- Snap callbacks: `onSuccess`, `onPending`, `onError`, `onClose` → route ke step 4

**Step 4 — Selesai**
- Status pembayaran (sukses/pending), order ID, ringkasan
- Tombol "Lihat Produk" / "Kembali ke Beranda"

**Produk contoh**
- Tombol "Beli Sekarang" pada `Product.tsx` & `ProductDetail.tsx` mengarah ke `/checkout/:productId` (bukan modal lama)
- Harga dummy untuk Reading Journal (mis. Rp 75.000)

### Bagian 3: Teknis
- Komponen baru: `src/pages/Checkout.tsx`, `src/components/checkout/Stepper.tsx`, `src/components/checkout/steps/{Voucher,CustomerInfo,Payment,Complete}.tsx`
- Daftarkan route di `App.tsx`
- Edge function `create-transaction` sudah ada — hanya perlu memastikan response `token` dipakai untuk Snap
- Tambah script Midtrans Snap di `index.html` (sandbox URL)
- `MIDTRANS_CLIENT_KEY` perlu diekspos ke frontend → simpan sebagai env publik via Vite, atau ambil via edge function (lebih aman). Akan ambil via edge function `get-midtrans-config` yang return client key.

### Catatan
- Voucher saat ini hanya client-side (dummy). Untuk produksi nanti bisa dibuat tabel `vouchers` + validasi server.
- Midtrans masih sandbox sampai user konfirmasi akun production.
- Username unique di DB; signup akan gagal kalau bentrok (toast error jelas).
