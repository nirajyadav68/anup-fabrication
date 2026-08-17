import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/admin/DeleteButton";
import OrderStatusForm from "@/components/admin/OrderStatusForm";
import { updateOrderStatus, deleteOrder } from "./actions";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

export default async function AdminOrdersPage() {
  const supabase = createClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_number, status, payment_status, total, created_at, customers(name, phone)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Orders</h1>
          <p className="mt-1 text-sm text-steel-500">Orders and fabrication inquiries being fulfilled.</p>
        </div>
        <Link
          href="/admin/orders/new"
          className="flex items-center gap-1.5 rounded-md bg-signal-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-signal-600"
        >
          <Plus className="h-4 w-4" />
          Add Order
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
          Could not load orders: {error.message}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {orders?.map((order) => {
          const boundUpdate = updateOrderStatus.bind(null, order.id);
          const customer = order.customers as any;
          return (
            <div key={order.id} className="rounded-lg border border-steel-100 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-navy-900">{order.order_number}</p>
                  <p className="mt-0.5 text-sm text-steel-500">
                    {customer?.name ?? "Unknown customer"} {customer?.phone ? `· ${customer.phone}` : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-steel-400">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  {order.total !== null && (
                    <p className="font-mono text-sm font-semibold text-navy-900">₹{order.total}</p>
                  )}
                  <DeleteButton action={deleteOrder} id={order.id} itemLabel={order.order_number} />
                </div>
              </div>
              <div className="mt-3">
                <OrderStatusForm action={boundUpdate} status={order.status} paymentStatus={order.payment_status} />
              </div>
            </div>
          );
        })}

        {orders?.length === 0 && (
          <div className="rounded-lg border border-dashed border-steel-300 bg-white p-10 text-center text-steel-500">
            No orders yet.
          </div>
        )}
      </div>
    </div>
  );
}
