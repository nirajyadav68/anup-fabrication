import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
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
  searchParams: {
    status?: string;
    page?: string;
    search?: string;
  };
}

export default async function AdminQuotesPage({ searchParams }: Props) {
  const supabase = createClient();

  const activeStatus = searchParams.status;
  const search = searchParams.search?.trim() ?? "";

  const page = Math.max(
    1,
    Number(searchParams.page ?? 1) || 1
  );

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("quotes")
    .select(
      `
        id,
        quote_number,
        customer_name,
        phone,
        service_type,
        material,
        width,
        height,
        finish,
        estimated_price,
        quantity,
        status,
        created_at
      `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  // Status filter
  if (
    activeStatus &&
    (QUOTE_STATUSES as readonly string[]).includes(activeStatus)
  ) {
    query = query.eq("status", activeStatus);
  }

  // Search
  if (search) {
    const safeSearch = search.replace(/[%_]/g, "");

    query = query.or(
      `quote_number.ilike.%${safeSearch}%,customer_name.ilike.%${safeSearch}%,phone.ilike.%${safeSearch}%`
    );
  }

  const {
    data: quotes,
    error,
    count,
  } = await query.range(from, to);

  const totalPages = count
    ? Math.max(1, Math.ceil(count / PAGE_SIZE))
    : 1;

  const createQuery = (nextPage: number) => {
    const params = new URLSearchParams();

    if (activeStatus) {
      params.set("status", activeStatus);
    }

    if (search) {
      params.set("search", search);
    }

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }

    const queryString = params.toString();

    return queryString
      ? `/admin/quotes?${queryString}`
      : "/admin/quotes";
  };

  return (
    <div>
      <RealtimeRefresher tables={["quotes"]} />

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">
          Quote Requests
        </h1>

        <p className="mt-1 text-sm text-steel-500">
          Requests submitted through the public Request a Quote form.
        </p>
      </div>

      {/* Search */}
      <form
        action="/admin/quotes"
        method="GET"
        className="mt-6"
      >
        {activeStatus && (
          <input
            type="hidden"
            name="status"
            value={activeStatus}
          />
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />

            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Search quote number, customer or phone..."
              className="w-full rounded-lg border border-steel-200 bg-white py-2.5 pl-9 pr-4 text-sm text-navy-900 outline-none transition focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800"
          >
            Search
          </button>

          {search && (
            <Link
              href={
                activeStatus
                  ? `/admin/quotes?status=${activeStatus}`
                  : "/admin/quotes"
              }
              className="rounded-lg border border-steel-200 bg-white px-5 py-2.5 text-center text-sm font-semibold text-steel-600 transition hover:border-navy-900 hover:text-navy-900"
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {/* Status Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={
            search
              ? `/admin/quotes?search=${encodeURIComponent(search)}`
              : "/admin/quotes"
          }
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-medium",
            !activeStatus
              ? "border-navy-900 bg-navy-900 text-white"
              : "border-steel-300 text-steel-600 hover:border-navy-900"
          )}
        >
          All
        </Link>

        {QUOTE_STATUSES.map((status) => {
          const params = new URLSearchParams();

          params.set("status", status);

          if (search) {
            params.set("search", search);
          }

          return (
            <Link
              key={status}
              href={`/admin/quotes?${params.toString()}`}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize",
                activeStatus === status
                  ? "border-navy-900 bg-navy-900 text-white"
                  : "border-steel-300 text-steel-600 hover:border-navy-900"
              )}
            >
              {status.replace(/_/g, " ")}
            </Link>
          );
        })}
      </div>

      {/* Search result information */}
      {(search || activeStatus) && (
        <div className="mt-4 rounded-lg border border-signal-100 bg-signal-50 px-4 py-3 text-sm text-signal-800">
          {count ?? 0} quote{count === 1 ? "" : "s"} found
          {search && (
            <>
              {" "}
              for <strong>&quot;{search}&quot;</strong>
            </>
          )}
          {activeStatus && (
            <>
              {" "}
              with status{" "}
              <strong>{activeStatus.replace(/_/g, " ")}</strong>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
          Could not load quotes: {error.message}
        </p>
      )}

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-lg border border-steel-100 bg-white">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="border-b border-steel-100 bg-steel-50 text-xs uppercase tracking-wide text-steel-500">
            <tr>
              <th className="px-4 py-3">Quote #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Finish</th>
              <th className="px-4 py-3">Estimated Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-steel-100">
            {quotes?.map((quote) => (
              <tr
                key={quote.id}
                className="transition hover:bg-steel-50/60"
              >
                {/* Quote Number */}
                <td className="px-4 py-4 font-mono text-xs font-semibold text-navy-900">
                  {quote.quote_number}
                </td>

                {/* Customer */}
                <td className="px-4 py-4">
                  <p className="font-medium text-navy-900">
                    {quote.customer_name}
                  </p>

                  {quote.material && (
                    <p className="mt-1 text-xs text-steel-400">
                      {quote.material}
                    </p>
                  )}
                </td>

                {/* Phone */}
                <td className="px-4 py-4 text-steel-500">
                  {quote.phone || "—"}
                </td>

                {/* Project */}
                <td className="px-4 py-4 text-steel-500">
                  {quote.service_type || "—"}
                </td>

                {/* Size */}
                <td className="px-4 py-4">
                  {quote.width && quote.height ? (
                    <span className="font-medium text-navy-900">
                      {quote.width} × {quote.height}
                    </span>
                  ) : quote.quantity ? (
                    <span className="text-steel-600">
                      Qty: {quote.quantity}
                    </span>
                  ) : (
                    <span className="text-steel-400">
                      —
                    </span>
                  )}
                </td>

                {/* Finish */}
                <td className="px-4 py-4 text-steel-500">
                  {quote.finish || "—"}
                </td>

                {/* Estimated Price */}
                <td className="px-4 py-4">
                  {quote.estimated_price ? (
                    <span className="font-semibold text-navy-900">
                      ₹
                      {Number(
                        quote.estimated_price
                      ).toLocaleString("en-IN")}
                    </span>
                  ) : (
                    <span className="text-steel-400">
                      —
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <StatusBadge status={quote.status} />
                </td>

                {/* Date */}
                <td className="px-4 py-4 whitespace-nowrap text-steel-500">
                  {new Date(
                    quote.created_at
                  ).toLocaleDateString("en-IN")}
                </td>

                {/* Action */}
                <td className="px-4 py-4 text-right">
                  <Link
                    href={`/admin/quotes/${quote.id}`}
                    className="font-medium text-signal-600 hover:text-signal-500"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}

            {quotes?.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-12 text-center"
                >
                  <div className="mx-auto max-w-sm">
                    <FileTextIcon />

                    <p className="mt-3 font-medium text-navy-900">
                      No quote requests found
                    </p>

                    <p className="mt-1 text-sm text-steel-500">
                      Try changing the search or status filter.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <Link
            href={createQuery(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={cn(
              "rounded-md border border-steel-300 px-3 py-1.5",
              page <= 1
                ? "pointer-events-none opacity-40"
                : "hover:border-navy-900"
            )}
          >
            Previous
          </Link>

          <span className="text-steel-500">
            Page {page} of {totalPages}
          </span>

          <Link
            href={createQuery(
              Math.min(totalPages, page + 1)
            )}
            aria-disabled={page >= totalPages}
            className={cn(
              "rounded-md border border-steel-300 px-3 py-1.5",
              page >= totalPages
                ? "pointer-events-none opacity-40"
                : "hover:border-navy-900"
            )}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}

function FileTextIcon() {
  return (
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-steel-50">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-6 w-6 text-steel-400"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-8.25a2.25 2.25 0 00-2.25-2.25h-6.5a2.25 2.25 0 00-1.59.66l-3.91 3.91a2.25 2.25 0 00-.66 1.59v9.09a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25v-4.5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 4.5v4.125a1.125 1.125 0 001.125 1.125H14.25"
        />
      </svg>
    </div>
  );
}