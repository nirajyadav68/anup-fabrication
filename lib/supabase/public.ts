import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

/**
 * A Supabase client for PUBLIC, READ-ONLY marketing pages (Services,
 * Products, Projects, Gallery listings) — deliberately does NOT touch
 * next/headers `cookies()`. Calling cookies() forces a route into fully
 * dynamic rendering, which defeats `export const revalidate = N` (ISR).
 * Since these pages only ever read published content under RLS (no user
 * session needed), this client lets them be cached and revalidated
 * instead of hitting the database on every request.
 *
 * Do NOT use this for anything that needs the signed-in user (admin
 * pages, anything behind auth) — use lib/supabase/server.ts there.
 */
export function createPublicClient() {
  return createSupabaseJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
