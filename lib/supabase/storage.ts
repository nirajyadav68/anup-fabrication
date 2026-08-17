const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/** Resolve a "media" bucket storage path (e.g. "products/abc.jpg") to its public URL. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/media/${path}`;
}
