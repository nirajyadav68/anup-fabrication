import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import OrderDirectory from "@/components/admin/OrderDirectory";
import {
  updateOrderStatus,
  deleteOrder,
} from "./actions";

export const metadata: Metadata = {
  title: "Orders",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminOrdersPage() {
  const supabase = createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, payment_status, total, created_at, customers(name, phone)"
    )
    .order("created_at", {
      ascending: false,
    });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">
            Orders
          </h1>

          <p className="mt-1 text-sm text-steel-500">
            Orders and fabrication inquiries being fulfilled.
          </p>
        </div>

        <Link
          href="/admin/orders/new"
          className="flex items-center gap-1.5 rounded-md bg-signal-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-signal-600"
        >
          <Plus className="h-4 w-4" />
          Add Order
        </Link>
      </div>

      {/* Database Error */}
      {error ? (
        <p className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
          Could not load orders: {error.message}
        </p>
      ) : (
        <OrderDirectory
          orders={orders ?? []}
          deleteAction={deleteOrder}
          updateStatusAction={updateOrderStatus}
        />
      )}
    </div>
  );
}