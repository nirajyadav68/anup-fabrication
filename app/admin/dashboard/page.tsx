import type { Metadata } from "next";
import { Package, Wrench, FolderKanban, FileText, ShoppingCart, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/admin/StatCard";
import RealtimeRefresher from "@/components/RealtimeRefresher";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

// `any` here is a deliberate, narrow exception: Supabase's query builder
// generic type is invariant across `.eq()`/`.in()` chains, so a precise
// signature would need to duplicate the entire builder type. Scoped to
// this one internal helper only.
async function getCount(
  supabase: ReturnType<typeof createClient>,
  table: string,
  filter?: (q: any) => any // eslint-disable-line @typescript-eslint/no-explicit-any
) {
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) query = filter(query);
  const { count, error } = await query;
  if (error) {
    console.error(`Dashboard count failed for ${table}:`, error.message);
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
    pendingQuotes,
    totalOrders,
    unreadMessages,
  ] = await Promise.all([
    getCount(supabase, "products"),
    getCount(supabase, "products", (q) => q.eq("is_published", true)),
    getCount(supabase, "projects"),
    getCount(supabase, "quotes"),
    getCount(supabase, "quotes", (q) => q.eq("status", "new")),
    getCount(supabase, "quotes", (q) => q.in("status", ["contacted", "quotation_sent", "negotiation"])),
    getCount(supabase, "orders"),
    getCount(supabase, "contact_messages", (q) => q.eq("is_read", false)),
  ]);

  return (
    <div>
      <RealtimeRefresher tables={["quotes", "contact_messages", "orders", "products"]} />
      <h1 className="font-display text-2xl font-bold text-navy-900">Dashboard</h1>
      <p className="mt-1 text-sm text-steel-500">
        A quick look at products, quotes and messages across the site.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Products" value={totalProducts} icon={Package} />
        <StatCard label="Active Products" value={activeProducts} icon={Package} />
        <StatCard label="Total Projects" value={totalProjects} icon={FolderKanban} />
        <StatCard label="Total Quotes" value={totalQuotes} icon={FileText} />
        <StatCard label="New Quotes" value={newQuotes} icon={Wrench} />
        <StatCard label="Pending Quotes" value={pendingQuotes} icon={FileText} />
        <StatCard label="Total Orders" value={totalOrders} icon={ShoppingCart} />
        <StatCard label="Unread Messages" value={unreadMessages} icon={MessageSquare} />
      </div>

      <p className="mt-8 text-sm text-steel-500">
        Charts (quotes over time, popular services, product categories) arrive once there's
        enough live data flowing through Products, Projects and Quotes management — Phase 3/4.
      </p>
    </div>
  );
}
