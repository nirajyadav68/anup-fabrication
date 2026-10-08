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
  IndianRupee,
  TrendingUp,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/admin/StatCard";
import RealtimeRefresher from "@/components/RealtimeRefresher";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

// ======================================================
// COUNT HELPER
// ======================================================

async function getCount(
  supabase: ReturnType<typeof createClient>,
  table: string,
  filter?: (q: any) => any
) {
  let query = supabase
    .from(table)
    .select("*", {
      count: "exact",
      head: true,
    });

  if (filter) {
    query = filter(query);
  }

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

// ======================================================
// REVENUE HELPER
// ======================================================

async function getOrderRevenue(
  supabase: ReturnType<typeof createClient>,
  filter?: (q: any) => any
) {
  let query = supabase
    .from("orders")
    .select("total");

  if (filter) {
    query = filter(query);
  }

  const { data, error } = await query;

  if (error) {
    console.error(
      "Order revenue query failed:",
      error.message
    );

    return {
      total: 0,
      average: 0,
      count: 0,
    };
  }

  const amounts = (data ?? [])
    .map((order) => Number(order.total ?? 0))
    .filter((amount) => amount > 0);

  const total = amounts.reduce(
    (sum, amount) => sum + amount,
    0
  );

  const average =
    amounts.length > 0
      ? total / amounts.length
      : 0;

  return {
    total,
    average,
    count: amounts.length,
  };
}

// ======================================================
// CURRENCY FORMAT
// ======================================================

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

// ======================================================
// DASHBOARD
// ======================================================

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [
    // ==================================================
    // PRODUCTS
    // ==================================================

    totalProducts,
    activeProducts,

    // ==================================================
    // PROJECTS
    // ==================================================

    totalProjects,

    // ==================================================
    // QUOTES
    // ==================================================

    totalQuotes,
    newQuotes,
    reviewingQuotes,
    quotedQuotes,
    approvedQuotes,
    completedQuotes,
    rejectedQuotes,
    pendingQuotes,

    // ==================================================
    // ORDERS
    // ==================================================

    totalOrders,
    pendingOrders,
    confirmedOrders,
    productionOrders,
    readyOrders,
    deliveredOrders,
    cancelledOrders,

    // ==================================================
    // PAYMENTS
    // ==================================================

    pendingPayments,
    partialPayments,
    paidOrders,
    refundedOrders,

    // ==================================================
    // REVENUE
    // ==================================================

    totalRevenue,
    paidRevenue,
    pendingRevenue,
    partialRevenue,
    refundedRevenue,

    // ==================================================
    // MESSAGES
    // ==================================================

    unreadMessages,
  ] = await Promise.all([
    // ==================================================
    // PRODUCTS
    // ==================================================

    getCount(
      supabase,
      "products"
    ),

    getCount(
      supabase,
      "products",
      (q) =>
        q.eq(
          "is_published",
          true
        )
    ),

    // ==================================================
    // PROJECTS
    // ==================================================

    getCount(
      supabase,
      "projects"
    ),

    // ==================================================
    // QUOTES
    // ==================================================

    getCount(
      supabase,
      "quotes"
    ),

    getCount(
      supabase,
      "quotes",
      (q) =>
        q.eq(
          "status",
          "new"
        )
    ),

    getCount(
      supabase,
      "quotes",
      (q) =>
        q.eq(
          "status",
          "reviewing"
        )
    ),

    getCount(
      supabase,
      "quotes",
      (q) =>
        q.eq(
          "status",
          "quoted"
        )
    ),

    getCount(
      supabase,
      "quotes",
      (q) =>
        q.eq(
          "status",
          "approved"
        )
    ),

    getCount(
      supabase,
      "quotes",
      (q) =>
        q.eq(
          "status",
          "completed"
        )
    ),

    getCount(
      supabase,
      "quotes",
      (q) =>
        q.eq(
          "status",
          "rejected"
        )
    ),

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

    // ==================================================
    // ORDERS
    // ==================================================

    getCount(
      supabase,
      "orders"
    ),

    getCount(
      supabase,
      "orders",
      (q) =>
        q.eq(
          "status",
          "pending"
        )
    ),

    getCount(
      supabase,
      "orders",
      (q) =>
        q.eq(
          "status",
          "confirmed"
        )
    ),

    getCount(
      supabase,
      "orders",
      (q) =>
        q.eq(
          "status",
          "in_production"
        )
    ),

    getCount(
      supabase,
      "orders",
      (q) =>
        q.eq(
          "status",
          "ready"
        )
    ),

    getCount(
      supabase,
      "orders",
      (q) =>
        q.eq(
          "status",
          "delivered"
        )
    ),

    getCount(
      supabase,
      "orders",
      (q) =>
        q.eq(
          "status",
          "cancelled"
        )
    ),

    // ==================================================
    // PAYMENTS
    // ==================================================

    getCount(
      supabase,
      "orders",
      (q) =>
        q.eq(
          "payment_status",
          "pending"
        )
    ),

    getCount(
      supabase,
      "orders",
      (q) =>
        q.eq(
          "payment_status",
          "partially_paid"
        )
    ),

    getCount(
      supabase,
      "orders",
      (q) =>
        q.eq(
          "payment_status",
          "paid"
        )
    ),

    getCount(
      supabase,
      "orders",
      (q) =>
        q.eq(
          "payment_status",
          "refunded"
        )
    ),

    // ==================================================
    // REVENUE
    // ==================================================

    // Total order value
    getOrderRevenue(
      supabase
    ),

    // Paid order value
    getOrderRevenue(
      supabase,
      (q) =>
        q.eq(
          "payment_status",
          "paid"
        )
    ),

    // Pending payment order value
    getOrderRevenue(
      supabase,
      (q) =>
        q.eq(
          "payment_status",
          "pending"
        )
    ),

    // Partially paid order value
    getOrderRevenue(
      supabase,
      (q) =>
        q.eq(
          "payment_status",
          "partially_paid"
        )
    ),

    // Refunded order value
    getOrderRevenue(
      supabase,
      (q) =>
        q.eq(
          "payment_status",
          "refunded"
        )
    ),

    // ==================================================
    // MESSAGES
    // ==================================================

    getCount(
      supabase,
      "contact_messages",
      (q) =>
        q.eq(
          "is_read",
          false
        )
    ),
  ]);

  // ======================================================
  // RETURN
  // ======================================================

  return (
    <div>
      {/* ==================================================
          REALTIME REFRESH
      ================================================== */}

      <RealtimeRefresher
        tables={[
          "quotes",
          "contact_messages",
          "orders",
          "products",
        ]}
      />

      {/* ==================================================
          HEADER
      ================================================== */}

      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-steel-500">
          A quick look at products, quotes,
          orders and messages across the site.
        </p>
      </div>

      {/* ==================================================
          MAIN STATISTICS
      ================================================== */}

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

      {/* ==================================================
          REVENUE ANALYTICS
      ================================================== */}

      <div className="mt-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-600">
            Financial Overview
          </p>

          <h2 className="mt-1 font-display text-xl font-bold text-navy-900">
            Revenue Analytics
          </h2>

          <p className="mt-1 text-sm text-steel-500">
            Track order value and payment-related
            revenue across your fabrication business.
          </p>
        </div>

        {/* Revenue Cards */}

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Order Value */}

          <div className="rounded-xl border border-steel-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-blue-50 p-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>

              <span className="text-2xl font-bold text-navy-900">
                {formatCurrency(
                  totalRevenue.total
                )}
              </span>
            </div>

            <p className="mt-4 text-sm font-semibold text-navy-900">
              Total Order Value
            </p>

            <p className="mt-1 text-xs text-steel-500">
              {totalRevenue.count} orders with value
            </p>
          </div>

          {/* Paid Revenue */}

          <div className="rounded-xl border border-steel-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-green-50 p-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>

              <span className="text-2xl font-bold text-green-700">
                {formatCurrency(
                  paidRevenue.total
                )}
              </span>
            </div>

            <p className="mt-4 text-sm font-semibold text-navy-900">
              Paid Order Value
            </p>

            <p className="mt-1 text-xs text-steel-500">
              Fully paid orders
            </p>
          </div>

          {/* Pending Revenue */}

          <div className="rounded-xl border border-steel-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-yellow-50 p-2">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>

              <span className="text-2xl font-bold text-yellow-700">
                {formatCurrency(
                  pendingRevenue.total
                )}
              </span>
            </div>

            <p className="mt-4 text-sm font-semibold text-navy-900">
              Pending Payment Value
            </p>

            <p className="mt-1 text-xs text-steel-500">
              Orders awaiting payment
            </p>
          </div>

          {/* Partial Revenue */}

          <div className="rounded-xl border border-steel-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-purple-50 p-2">
                <BadgeDollarSign className="h-5 w-5 text-purple-600" />
              </div>

              <span className="text-2xl font-bold text-purple-700">
                {formatCurrency(
                  partialRevenue.total
                )}
              </span>
            </div>

            <p className="mt-4 text-sm font-semibold text-navy-900">
              Partially Paid Value
            </p>

            <p className="mt-1 text-xs text-steel-500">
              Orders with partial payment
            </p>
          </div>
        </div>

        {/* Revenue Summary */}

        <div className="mt-6 rounded-xl border border-steel-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-signal-50 p-2">
              <IndianRupee className="h-5 w-5 text-signal-600" />
            </div>

            <div>
              <h3 className="font-display text-base font-semibold text-navy-900">
                Revenue Summary
              </h3>

              <p className="text-xs text-steel-500">
                Current order-value snapshot
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-steel-50 p-4">
              <p className="text-xs text-steel-500">
                Average Order Value
              </p>

              <p className="mt-1 text-2xl font-bold text-navy-900">
                {formatCurrency(
                  totalRevenue.average
                )}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-xs text-green-700">
                Paid Orders
              </p>

              <p className="mt-1 text-2xl font-bold text-green-900">
                {paidOrders}
              </p>

              <p className="mt-1 text-xs text-green-700">
                {formatCurrency(
                  paidRevenue.total
                )}{" "}
                order value
              </p>
            </div>

            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-xs text-red-700">
                Refunded Value
              </p>

              <p className="mt-1 text-2xl font-bold text-red-900">
                {formatCurrency(
                  refundedRevenue.total
                )}
              </p>

              <p className="mt-1 text-xs text-red-700">
                {refundedOrders} refunded orders
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-yellow-100 bg-yellow-50 p-4">
            <p className="text-xs leading-5 text-yellow-800">
              <strong>Note:</strong> Partially paid
              orders are shown using their full order
              total. The current database does not
              store the exact amount already collected.
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================
          QUOTE MANAGEMENT
      ================================================== */}

      <div className="mt-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-600">
            Quote Management
          </p>

          <h2 className="mt-1 font-display text-xl font-bold text-navy-900">
            Quote Status Overview
          </h2>

          <p className="mt-1 text-sm text-steel-500">
            Track every quote through the complete
            fabrication workflow.
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

      {/* ==================================================
          ORDER ANALYTICS
      ================================================== */}

      <div className="mt-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-600">
            Order Management
          </p>

          <h2 className="mt-1 font-display text-xl font-bold text-navy-900">
            Order Status Overview
          </h2>

          <p className="mt-1 text-sm text-steel-500">
            Track orders from confirmation to delivery.
          </p>
        </div>

        {/* Order Status Cards */}

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Pending */}

          <div className="rounded-xl border border-steel-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-yellow-50 p-2">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>

              <span className="text-2xl font-bold text-navy-900">
                {pendingOrders}
              </span>
            </div>

            <p className="mt-4 text-sm font-semibold text-navy-900">
              Pending
            </p>

            <p className="mt-1 text-xs text-steel-500">
              Orders awaiting confirmation
            </p>
          </div>

          {/* Confirmed */}

          <div className="rounded-xl border border-steel-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-blue-50 p-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>

              <span className="text-2xl font-bold text-navy-900">
                {confirmedOrders}
              </span>
            </div>

            <p className="mt-4 text-sm font-semibold text-navy-900">
              Confirmed
            </p>

            <p className="mt-1 text-xs text-steel-500">
              Confirmed customer orders
            </p>
          </div>

          {/* Production */}

          <div className="rounded-xl border border-steel-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-purple-50 p-2">
                <Wrench className="h-5 w-5 text-purple-600" />
              </div>

              <span className="text-2xl font-bold text-navy-900">
                {productionOrders}
              </span>
            </div>

            <p className="mt-4 text-sm font-semibold text-navy-900">
              In Production
            </p>

            <p className="mt-1 text-xs text-steel-500">
              Orders currently being fabricated
            </p>
          </div>

          {/* Ready */}

          <div className="rounded-xl border border-steel-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-green-50 p-2">
                <Package className="h-5 w-5 text-green-600" />
              </div>

              <span className="text-2xl font-bold text-navy-900">
                {readyOrders}
              </span>
            </div>

            <p className="mt-4 text-sm font-semibold text-navy-900">
              Ready
            </p>

            <p className="mt-1 text-xs text-steel-500">
              Orders ready for delivery
            </p>
          </div>

          {/* Delivered */}

          <div className="rounded-xl border border-steel-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-emerald-50 p-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>

              <span className="text-2xl font-bold text-navy-900">
                {deliveredOrders}
              </span>
            </div>

            <p className="mt-4 text-sm font-semibold text-navy-900">
              Delivered
            </p>

            <p className="mt-1 text-xs text-steel-500">
              Successfully delivered orders
            </p>
          </div>

          {/* Cancelled */}

          <div className="rounded-xl border border-red-100 bg-red-50 p-5">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-white p-2">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>

              <span className="text-2xl font-bold text-red-900">
                {cancelledOrders}
              </span>
            </div>

            <p className="mt-4 text-sm font-semibold text-red-900">
              Cancelled
            </p>

            <p className="mt-1 text-xs text-red-700">
              Cancelled orders
            </p>
          </div>
        </div>

        {/* Payment Overview */}

        <div className="mt-6 rounded-xl border border-steel-100 bg-white p-6">
          <h3 className="font-display text-base font-semibold text-navy-900">
            Payment Overview
          </h3>

          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {/* Pending */}

            <div className="rounded-lg bg-steel-50 p-4">
              <p className="text-xs text-steel-500">
                Pending
              </p>

              <p className="mt-1 text-2xl font-bold text-navy-900">
                {pendingPayments}
              </p>

              <p className="mt-1 text-xs text-steel-500">
                {formatCurrency(
                  pendingRevenue.total
                )}
              </p>
            </div>

            {/* Partial */}

            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="text-xs text-yellow-700">
                Partially Paid
              </p>

              <p className="mt-1 text-2xl font-bold text-yellow-900">
                {partialPayments}
              </p>

              <p className="mt-1 text-xs text-yellow-700">
                {formatCurrency(
                  partialRevenue.total
                )}
              </p>
            </div>

            {/* Paid */}

            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-xs text-green-700">
                Paid
              </p>

              <p className="mt-1 text-2xl font-bold text-green-900">
                {paidOrders}
              </p>

              <p className="mt-1 text-xs text-green-700">
                {formatCurrency(
                  paidRevenue.total
                )}
              </p>
            </div>

            {/* Refunded */}

            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-xs text-red-700">
                Refunded
              </p>

              <p className="mt-1 text-2xl font-bold text-red-900">
                {refundedOrders}
              </p>

              <p className="mt-1 text-xs text-red-700">
                {formatCurrency(
                  refundedRevenue.total
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          WORKFLOW INFORMATION
      ================================================== */}

      <div className="mt-8 rounded-xl border border-steel-100 bg-white p-6">
        <h2 className="font-display text-base font-semibold text-navy-900">
          Quote Workflow
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-blue-50 px-3 py-1.5 font-medium text-blue-700">
            New
          </span>

          <span className="text-steel-400">
            →
          </span>

          <span className="rounded-full bg-yellow-50 px-3 py-1.5 font-medium text-yellow-700">
            Reviewing
          </span>

          <span className="text-steel-400">
            →
          </span>

          <span className="rounded-full bg-purple-50 px-3 py-1.5 font-medium text-purple-700">
            Quoted
          </span>

          <span className="text-steel-400">
            →
          </span>

          <span className="rounded-full bg-green-50 px-3 py-1.5 font-medium text-green-700">
            Approved
          </span>

          <span className="text-steel-400">
            →
          </span>

          <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700">
            Completed
          </span>

          <span className="text-steel-400">
            or
          </span>

          <span className="rounded-full bg-red-50 px-3 py-1.5 font-medium text-red-700">
            Rejected
          </span>
        </div>
      </div>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <p className="mt-8 text-sm text-steel-500">
        Dashboard statistics update automatically
        when new quotes, messages, orders or
        products are added.
      </p>
    </div>
  );
}