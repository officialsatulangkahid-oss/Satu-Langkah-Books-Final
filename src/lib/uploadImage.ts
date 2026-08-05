import { supabase } from "@/integrations/supabase/client";

export async function uploadContentImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const path = `content/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("content-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("content-images").getPublicUrl(path);
  return data.publicUrl;
}