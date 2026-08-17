import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/admin/StatusBadge";
import RealtimeRefresher from "@/components/RealtimeRefresher";
import { cn } from "@/lib/utils";
import { QUOTE_STATUSES } from "./constants";

export const metadata: Metadata = {
  title: "Quote Requests",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

interface Props {
  searchParams: { status?: string; page?: string };
}

export default async function AdminQuotesPage({ searchParams }: Props) {
  const supabase = createClient();
  const activeStatus = searchParams.status;
  const page = Math.max(1, Number(searchParams.page ?? 1) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("quotes")
    .select("id, quote_number, customer_name, phone, service_type, status, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (activeStatus && (QUOTE_STATUSES as readonly string[]).includes(activeStatus)) {
    query = query.eq("status", activeStatus);
  }

  const { data: quotes, error, count } = await query;
  const totalPages = count ? Math.max(1, Math.ceil(count / PAGE_SIZE)) : 1;
  const statusQuery = activeStatus ? `&status=${activeStatus}` : "";

  return (
    <div>
      <RealtimeRefresher tables={["quotes"]} />
      <h1 className="font-display text-2xl font-bold text-navy-900">Quote Requests</h1>
      <p className="mt-1 text-sm text-steel-500">Requests submitted through the public Request a Quote form.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/admin/quotes"
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-medium",
            !activeStatus ? "border-navy-900 bg-navy-900 text-white" : "border-steel-300 text-steel-600 hover:border-navy-900"
          )}
        >
          All
        </Link>
        {QUOTE_STATUSES.map((status) => (
          <Link
            key={status}
            href={`/admin/quotes?status=${status}`}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize",
              activeStatus === status ? "border-navy-900 bg-navy-900 text-white" : "border-steel-300 text-steel-600 hover:border-navy-900"
            )}
          >
            {status.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
          Could not load quotes: {error.message}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-steel-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-steel-100 bg-steel-50 text-xs uppercase tracking-wide text-steel-500">
            <tr>
              <th className="px-4 py-3">Quote #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-100">
            {quotes?.map((quote) => (
              <tr key={quote.id}>
                <td className="px-4 py-3 font-mono text-xs text-navy-900">{quote.quote_number}</td>
                <td className="px-4 py-3 font-medium text-navy-900">{quote.customer_name}</td>
                <td className="px-4 py-3 text-steel-500">{quote.phone}</td>
                <td className="px-4 py-3 text-steel-500">{quote.service_type ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={quote.status} />
                </td>
                <td className="px-4 py-3 text-steel-500">{new Date(quote.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/quotes/${quote.id}`} className="text-signal-600 hover:text-signal-500">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {quotes?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-steel-500">
                  No quote requests {activeStatus ? "with this status" : "yet"}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <Link
            href={`/admin/quotes?page=${Math.max(1, page - 1)}${statusQuery}`}
            aria-disabled={page <= 1}
            className={cn(
              "rounded-md border border-steel-300 px-3 py-1.5",
              page <= 1 ? "pointer-events-none opacity-40" : "hover:border-navy-900"
            )}
          >
            Previous
          </Link>
          <span className="text-steel-500">
            Page {page} of {totalPages}
          </span>
          <Link
            href={`/admin/quotes?page=${Math.min(totalPages, page + 1)}${statusQuery}`}
            aria-disabled={page >= totalPages}
            className={cn(
              "rounded-md border border-steel-300 px-3 py-1.5",
              page >= totalPages ? "pointer-events-none opacity-40" : "hover:border-navy-900"
            )}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
