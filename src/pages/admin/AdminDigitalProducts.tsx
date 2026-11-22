import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { paymentCall } from "@/lib/midtrans";
import { toast } from "sonner";

type Product = { id: string; slug: string; title: string };
type Asset = { product_type: string; product_id: string; object_path: string | null; drive_url: string | null; active: boolean };
type Catalog = { products: Product[]; courses: Product[]; assets: Asset[] };

export default function AdminDigitalProducts() {
  const [catalog, setCatalog] = useState<Catalog>({ products: [], courses: [], assets: [] });
  const [productType, setProductType] = useState<"ebook" | "ecourse">("ebook");
  const [productId, setProductId] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const products = productType === "ebook" ? catalog.products : catalog.courses;
  const asset = catalog.assets.find((item) => item.product_type === productType && item.product_id === productId);
  const refresh = useCallback(async () => {
    try { setCatalog(await paymentCall<Catalog>("admin-payment-assets", { action: "list" })); setError(""); }
    catch (err) { setError((err as Error).message); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { setDriveUrl(asset?.drive_url ?? ""); setFile(null); }, [productId, productType, asset?.drive_url]);

  const save = async () => {
    if (!productId || busy) return;
    setBusy(true);
    try {
      const target = { productType, productId };
      if (driveUrl.trim()) {
        await paymentCall("admin-payment-assets", { action: "save", ...target, driveUrl: driveUrl.trim() });
      } else if (file) {
        const extension = file.name.split(".").pop()?.toLowerCase();
        if (!["pdf", "epub", "zip"].includes(extension ?? "") || file.size < 1 || file.size > 50 * 1024 * 1024) throw new Error("Gunakan PDF, EPUB, atau ZIP dengan ukuran maksimal 50 MB");
        const upload = await paymentCall<{ path: string; token: string }>("admin-payment-assets", { action: "upload-url", ...target, extension });
        const { error: uploadError } = await supabase.storage.from("paid-products").uploadToSignedUrl(upload.path, upload.token, file, { contentType: file.type || "application/octet-stream" });
        if (uploadError) throw new Error("Unggah file gagal. Silakan coba lagi.");
        await paymentCall("admin-payment-assets", { action: "save", ...target, objectPath: upload.path });
      } else throw new Error("Pilih file atau isi link Google Drive");
      toast.success("Akses produk tersimpan. Berlaku untuk pesanan yang sudah dibayar.");
      setFile(null); await refresh();
    } catch (err) { toast.error((err as Error).message); }
    finally { setBusy(false); }
  };
  const disable = async () => {
    setBusy(true);
    try { await paymentCall("admin-payment-assets", { action: "disable", productType, productId }); await refresh(); toast.success("Akses unduhan dinonaktifkan"); }
    catch (err) { toast.error((err as Error).message); }
    finally { setBusy(false); }
  };
  return <div className="space-y-6"><h1 className="text-3xl font-bold">Produk digital</h1><p className="text-muted-foreground">Atur file atau link yang dapat dibuka pembeli setelah pembayaran terverifikasi.</p>
    {error && <p role="alert" className="text-destructive">{error}</p>}
    <div className="bg-card border rounded-xl p-6 space-y-5 max-w-2xl">
      <div><Label htmlFor="delivery-type">Jenis produk</Label><select id="delivery-type" className="w-full border rounded-md p-2 bg-background" value={productType} disabled={busy} onChange={(e) => { setProductType(e.target.value as "ebook" | "ecourse"); setProductId(""); }}><option value="ebook">E-book / jurnal</option><option value="ecourse">E-course / paket materi</option></select></div>
      <div><Label htmlFor="delivery-product">Produk</Label><select id="delivery-product" className="w-full border rounded-md p-2 bg-background" value={productId} disabled={busy} onChange={(e) => setProductId(e.target.value)}><option value="">Pilih produk</option>{products.map((product) => <option key={product.id} value={product.id}>{product.title}</option>)}</select></div>
      {asset && <p className="text-sm">Saat ini: {asset.active ? asset.drive_url ? "Link Google Drive aktif" : "File unduhan aktif" : "Unduhan dinonaktifkan"}</p>}
      <div><Label htmlFor="delivery-drive">Link Google Drive (opsional)</Label><Input id="delivery-drive" type="url" placeholder="https://drive.google.com/file/d/…/view" value={driveUrl} disabled={busy} onChange={(e) => setDriveUrl(e.target.value)} /><p className="text-xs text-muted-foreground mt-2">Link dibuka setelah pembayaran. Link Drive yang sudah diterima dapat dibagikan kembali; untuk pembatasan lebih ketat gunakan file privat.</p></div>
      <div><Label htmlFor="delivery-file">Atau unggah file</Label><Input key={`${productType}:${productId}:${asset?.object_path ?? ""}`} id="delivery-file" type="file" accept=".pdf,.epub,.zip" disabled={busy || !!driveUrl.trim()} onChange={(e) => setFile(e.target.files?.[0] ?? null)} /><p className="text-xs text-muted-foreground mt-2">PDF, EPUB, atau ZIP; maksimal 50 MB. Tersimpan privat di Supabase. File lama tidak dihapus otomatis saat diganti.</p></div>
      <div className="flex gap-3"><Button onClick={save} disabled={busy || !productId}>{busy ? "Memproses…" : "Simpan akses produk"}</Button>{asset?.active && <Button variant="outline" onClick={disable} disabled={busy}>Nonaktifkan unduhan</Button>}</div>
    </div>

  </div>;
}
