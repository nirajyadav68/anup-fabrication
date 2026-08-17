import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

/**
 * Supabase client for Server Components / Route Handlers / Server Actions.
 * Reads and writes the user's session via cookies.
 *
 * NOTE: not parameterized with <Database> yet — see the same note in
 * lib/supabase/client.ts. Add it back once types/database.types.ts is
 * replaced with real `supabase gen types` output.
 *
 * Server Components cannot set cookies. The `set`/`remove` calls below
 * will throw when called from a Server Component render — that's
 * expected and safe to ignore as long as `middleware.ts` is refreshing
 * the session on every request (which it does, see middleware.ts).
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component — middleware handles refresh.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Called from a Server Component — middleware handles refresh.
          }
        },
      },
    }
  );
}

/**
 * Admin client using the service role key — bypasses RLS entirely.
 * Server-side only. Never import this into a Client Component, and
 * never expose SUPABASE_SERVICE_ROLE_KEY with a NEXT_PUBLIC_ prefix.
 */
export function createAdminClient() {
  return createSupabaseJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
