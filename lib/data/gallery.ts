import { createPublicClient } from "@/lib/supabase/public";
import { mediaUrl } from "@/lib/supabase/storage";

export interface PublicGalleryImage {
  id: string;
  title: string | null;
  url: string;
}

export async function getPublishedGalleryImages(): Promise<PublicGalleryImage[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("gallery")
    .select("id, title, storage_path")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title as string | null,
    url: mediaUrl(row.storage_path)!,
  }));
}
