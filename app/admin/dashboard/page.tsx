import type { Metadata } from "next";
import {
  Package,
  Wrench,
  FolderKanban,
  FileText,
  ShoppingCart,
  MessageSquare,
  Search,
  BadgeDollarSign,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/admin/StatCard";
import RealtimeRefresher from "@/components/RealtimeRefresher";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

// `any` here is a deliberate, narrow exception: Supabase's query builder
// generic type is invariant across `.eq()`/`.in()` chains.
async function getCount(
  supabase: ReturnType<typeof createClient>,
  table: string,
  filter?: (q: any) => any // eslint-disable-line @typescript-eslint/no-explicit-any
) {
  let query = supabase.from(table).select("*", {
    count: "exact",
    head: true,
  });

  if (filter) query = filter(query);

  const { count, error } = await query;

  if (error) {
    console.error(
      `Dashboard count failed for ${table}:`,
      error.message
    );
    return 0;
  }

  return count ?? 0;
}

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [
    totalProducts,
    activeProducts,
    totalProjects,
    totalQuotes,
    newQuotes,
    reviewingQuotes,
    quotedQuotes,
    approvedQuotes,
    completedQuotes,
    rejectedQuotes,
    pendingQuotes,
    totalOrders,
    unreadMessages,
  ] = await Promise.all([
    // Products
    getCount(supabase, "products"),

    getCount(
      supabase,
      "products",
      (q) => q.eq("is_published", true)
    ),

    // Projects
    getCount(supabase, "projects"),

    // Quotes
    getCount(supabase, "quotes"),

    getCount(
      supabase,
      "quotes",
      (q) => q.eq("status", "new")
    ),

    getCount(
      supabase,
      "quotes",
      (q) => q.eq("status", "reviewing")
    ),

    getCount(
      supabase,
      "quotes",
      (q) => q.eq("status", "quoted")
    ),

    getCount(
      supabase,
      "quotes",
      (q) => q.eq("status", "approved")
    ),

    getCount(
      supabase,
      "quotes",
      (q) => q.eq("status", "completed")
    ),

    getCount(
      supabase,
      "quotes",
      (q) => q.eq("status", "rejected")
    ),

    // Active quote workflow
    getCount(
      supabase,
      "quotes",
      (q) =>
        q.in("status", [
          "new",
          "reviewing",
          "quoted",
        ])
    ),

    // Orders
    getCount(supabase, "orders"),

    // Messages
    getCount(
      supabase,
      "contact_messages",
      (q) => q.eq("is_read", false)
    ),
  ]);

  return (
    <div>
      {/* Realtime refresh */}
      <RealtimeRefresher
        tables={[
          "quotes",
          "contact_messages",
          "orders",
          "products",
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-steel-500">
          A quick look at products, quotes and messages across the site.
        </p>
      </div>

      {/* Main Statistics */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Products"
          value={totalProducts}
          icon={Package}
        />

        <StatCard
          label="Active Products"
          value={activeProducts}
          icon={Package}
        />

        <StatCard
          label="Total Projects"
          value={totalProjects}
          icon={FolderKanban}
        />

        <StatCard
          label="Total Quotes"
          value={totalQuotes}
          icon={FileText}
        />

        <StatCard
          label="New Quotes"
          value={newQuotes}
          icon={Wrench}
        />

        <StatCard
          label="Pending Quotes"
          value={pendingQuotes}
          icon={Clock}
        />

        <StatCard
          label="Total Orders"
          value={totalOrders}
          icon={ShoppingCart}
        />

        <StatCard
          label="Unread Messages"
          value={unreadMessages}
          icon={MessageSquare}
        />
      </div>

      {/* Quote Workflow */}
      <div className="mt-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-600">
            Quote Management
          </p>

          <h2 className="mt-1 font-display text-xl font-bold text-navy-900">
            Quote Status Overview
          </h2>

          <p className="mt-1 text-sm text-steel-500">
            Track every quote through the complete fabrication workflow.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* New */}
          <div className="rounded-xl border border-steel-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-blue-50 p-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>

              <span className="text-2xl font-bold text-navy-900">
                {newQuotes}
              </span>
            </div>

            <p className="mt-4 text-sm font-semibold text-navy-900">
              New
            </p>

            <p className="mt-1 text-xs text-steel-500">
              New quote requests
            </p>
          </div>

          {/* Reviewing */}
          <div className="rounded-xl border border-steel-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-yellow-50 p-2">
                <Search className="h-5 w-5 text-yellow-600" />
              </div>

              <span className="text-2xl font-bold text-navy-900">
                {reviewingQuotes}
              </span>
            </div>

            <p className="mt-4 text-sm font-semibold text-navy-900">
              Reviewing
            </p>

            <p className="mt-1 text-xs text-steel-500">
              Quotes being reviewed
            </p>
          </div>

          {/* Quoted */}
          <div className="rounded-xl border border-steel-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-purple-50 p-2">
                <BadgeDollarSign className="h-5 w-5 text-purple-600" />
              </div>

              <span className="text-2xl font-bold text-navy-900">
                {quotedQuotes}
              </span>
            </div>

            <p className="mt-4 text-sm font-semibold text-navy-900">
              Quoted
            </p>

            <p className="mt-1 text-xs text-steel-500">
              Price sent to customer
            </p>
          </div>

          {/* Approved */}
          <div className="rounded-xl border border-steel-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-green-50 p-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>

              <span className="text-2xl font-bold text-navy-900">
                {approvedQuotes}
              </span>
            </div>

            <p className="mt-4 text-sm font-semibold text-navy-900">
              Approved
            </p>

            <p className="mt-1 text-xs text-steel-500">
              Customer approved quote
            </p>
          </div>

          {/* Completed */}
          <div className="rounded-xl border border-steel-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-emerald-50 p-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>

              <span className="text-2xl font-bold text-navy-900">
                {completedQuotes}
              </span>
            </div>

            <p className="mt-4 text-sm font-semibold text-navy-900">
              Completed
            </p>

            <p className="mt-1 text-xs text-steel-500">
              Completed projects
            </p>
          </div>
        </div>

        {/* Rejected */}
        <div className="mt-4">
          <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white p-2">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-red-900">
                  Rejected Quotes
                </p>

                <p className="text-xs text-red-700">
                  Quotes that were rejected
                </p>
              </div>
            </div>

            <span className="text-2xl font-bold text-red-900">
              {rejectedQuotes}
            </span>
          </div>
        </div>
      </div>

      {/* Workflow Information */}
      <div className="mt-8 rounded-xl border border-steel-100 bg-white p-6">
        <h2 className="font-display text-base font-semibold text-navy-900">
          Quote Workflow
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-blue-50 px-3 py-1.5 font-medium text-blue-700">
            New
          </span>

          <span className="text-steel-400">→</span>

          <span className="rounded-full bg-yellow-50 px-3 py-1.5 font-medium text-yellow-700">
            Reviewing
          </span>

          <span className="text-steel-400">→</span>

          <span className="rounded-full bg-purple-50 px-3 py-1.5 font-medium text-purple-700">
            Quoted
          </span>

          <span className="text-steel-400">→</span>

          <span className="rounded-full bg-green-50 px-3 py-1.5 font-medium text-green-700">
            Approved
          </span>

          <span className="text-steel-400">→</span>

          <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700">
            Completed
          </span>

          <span className="text-steel-400">or</span>

          <span className="rounded-full bg-red-50 px-3 py-1.5 font-medium text-red-700">
            Rejected
          </span>
        </div>
      </div>

      <p className="mt-8 text-sm text-steel-500">
        Dashboard statistics update automatically when new quotes,
        messages, orders or products are added.
      </p>
    </div>
  );
}