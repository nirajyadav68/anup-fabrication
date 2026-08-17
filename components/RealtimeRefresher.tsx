"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface RealtimeRefresherProps {
  /** Table names to watch for INSERT/UPDATE/DELETE. */
  tables: string[];
}

/**
 * Renders nothing. Subscribes to Supabase Realtime changes on the given
 * tables and calls router.refresh() when something changes, so server
 * components re-fetch fresh data without the visitor needing to reload
 * the page — e.g. a quote status change, a price update, or a new quote
 * request appearing in the admin list.
 *
 * Deliberately narrow: only wired into pages where live updates add real
 * value (per the spec's "don't overuse realtime" guidance), not globally.
 */
export default function RealtimeRefresher({ tables }: RealtimeRefresherProps) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`realtime-${tables.join("-")}`);

    for (const table of tables) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        router.refresh();
      });
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables.join(",")]);

  return null;
}
