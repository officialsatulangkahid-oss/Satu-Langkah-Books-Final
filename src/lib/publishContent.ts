import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { clearContentCache } from "@/lib/content";

/**
 * Re-publishes public content (articles, products, projects, courses) so the
 * website shows the latest admin edits immediately.
 *
 * Called after every admin save/delete. Failures are surfaced to the admin so
 * they know the website copy is still lagging behind the database.
 */
export async function publishContent(): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke("publish-content");
    const failure = error?.message ?? (data as { error?: string } | null)?.error;
    if (failure) {
      console.error("[publishContent]", error ?? data);
      toast.error(`Gagal menerbitkan ke website: ${failure}`);
      return false;
    }
    // The website reads published JSON through a session cache — reset it so
    // the change is visible without a hard reload.
    clearContentCache();
    return true;
  } catch (e) {
    console.error("[publishContent]", e);
    toast.error("Gagal menerbitkan ke website. Coba simpan ulang.");
    return false;
  }
}