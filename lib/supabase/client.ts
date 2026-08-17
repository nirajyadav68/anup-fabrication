import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for Client Components ("use client"). Safe to call
 * repeatedly — createBrowserClient reuses the underlying connection.
 *
 * NOTE: not parameterized with <Database> yet. types/database.types.ts is
 * hand-written and doesn't cover every table/relationship used by admin
 * queries (e.g. embedded `product_images(...)` selects), so typing the
 * client against it now would cause false compile errors. Once you run
 * `npx supabase gen types typescript ...` (see README §3a), swap in the
 * generated file and add `<Database>` back here for full query typing.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
