import { supabase } from "@/integrations/supabase/client";

export async function uploadContentImage(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Silakan masuk terlebih dahulu.");
  const { data: roles, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  if (roleError) throw roleError;
  const admin = roles?.some(row => row.role === "admin");
  const editor = roles?.some(row => row.role === "article_editor");
  if (!admin && !editor) throw new Error("Tidak memiliki izin mengunggah gambar.");
  const prefix = admin ? "content" : `articles/${user.id}`;
  const ext = file.name.split(".").pop() || "png";
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("content-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("content-images").getPublicUrl(path);
  return data.publicUrl;
}