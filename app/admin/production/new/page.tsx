import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import CreateProductionJobForm from "./CreateProductionJobForm";

export default async function NewProductionJobPage() {
  const supabase = createClient();

  const {
    data: orders,
    error: ordersError,
  } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      customer_id,
      status,
      total,
      customers (
        id,
        name,
        phone
      )
    `)
    .not("status", "eq", "cancelled")
    .order("created_at", {
      ascending: false,
    });

  if (ordersError) {
    console.error(
      "Production orders error:",
      ordersError
    );
  }

  const {
    data: workers,
    error: workersError,
  } = await supabase
    .from("workers")
    .select(`
      id,
      name,
      phone,
      skill,
      status
    `)
    .eq("status", "active")
    .order("name", {
      ascending: true,
    });

  if (workersError) {
    console.error(
      "Workers error:",
      workersError
    );
  }

  return (
    <main className="min-h-screen bg-steel-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">

        <div>
          <Link
            href="/admin/production"
            className="text-sm font-medium text-steel-500 hover:text-steel-900"
          >
            ← Back to Production
          </Link>

          <h1 className="mt-2 text-3xl font-bold text-steel-900">
            Create Production Job
          </h1>

          <p className="mt-1 text-sm text-steel-500">
            Create a fabrication job and assign it to a worker.
          </p>
        </div>

        <CreateProductionJobForm
          orders={orders ?? []}
          workers={workers ?? []}
        />

      </div>
    </main>
  );
}