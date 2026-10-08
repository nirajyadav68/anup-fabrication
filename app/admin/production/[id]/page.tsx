import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import ProductionUpdateForm from "./ProductionUpdateForm";

function formatStatus(status: string) {
  return status
    .replace(/\_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatPriority(priority: string) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function statusClasses(status: string) {
  switch (status) {
    case "in_progress":
      return "bg-blue-100 text-blue-700";

    case "quality_check":
      return "bg-purple-100 text-purple-700";

    case "completed":
      return "bg-emerald-100 text-emerald-700";

    case "on_hold":
      return "bg-amber-100 text-amber-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function priorityClasses(priority: string) {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-700";

    case "high":
      return "bg-orange-100 text-orange-700";

    case "normal":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

type PageProps = {
  params: {
    id: string;
  };
};

export default async function ProductionJobDetailPage({
  params,
}: PageProps) {
  const supabase = createClient();

  const {
    data: job,
    error,
  } = await supabase
    .from("production_jobs")
    .select(`
      id,
      job_number,
      order_id,
      customer_id,

      worker_id,
      assigned_worker,

      priority,
      status,
      progress,
      start_date,
      expected_date,
      completed_at,
      notes,
      created_at,
      updated_at,

      workers (
        id,
        name,
        phone,
        skill,
        status
      ),

      customers (
        id,
        name,
        phone,
        whatsapp,
        email,
        city,
        address
      ),

      orders (
        id,
        order_number,
        status,
        payment_status,
        total
      )
    `)
    .eq("id", params.id)
    .single();

  if (error || !job) {
    console.error("Production job lookup error:", error);
    notFound();
  }

  const customer = Array.isArray(job.customers)
    ? job.customers[0]
    : job.customers;

  const order = Array.isArray(job.orders)
    ? job.orders[0]
    : job.orders;

  const worker = Array.isArray(job.workers)
    ? job.workers[0]
    : job.workers;

  return (
    <main className="min-h-screen bg-steel-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/admin/production"
              className="text-sm font-medium text-steel-500 hover:text-steel-900"
            >
              ← Back to Production
            </Link>

            <h1 className="mt-2 text-3xl font-bold text-steel-900">
              {job.job_number}
            </h1>

            <p className="mt-1 text-sm text-steel-500">
              Created {formatDateTime(job.created_at)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${statusClasses(
                job.status
              )}`}
            >
              {formatStatus(job.status)}
            </span>

            <span
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${priorityClasses(
                job.priority
              )}`}
            >
              {formatPriority(job.priority)}
            </span>
          </div>
        </div>

        {/* PROGRESS */}
        <section className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-steel-900">
                Production Progress
              </h2>

              <p className="mt-1 text-sm text-steel-500">
                Current fabrication progress.
              </p>
            </div>

            <p className="text-3xl font-bold text-signal-600">
              {job.progress}%
            </p>
          </div>

          <div className="mt-5 h-4 overflow-hidden rounded-full bg-steel-100">
            <div
              className="h-full rounded-full bg-signal-500 transition-all"
              style={{
                width: `${job.progress}%`,
              }}
            />
          </div>

          <div className="mt-2 flex justify-between text-xs text-steel-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </section>

        {/* CUSTOMER + ORDER */}
        <section className="grid gap-6 lg:grid-cols-2">

          {/* CUSTOMER */}
          <div className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-steel-900">
                Customer
              </h2>

              {customer?.id && (
                <Link
                  href={`/admin/customers/${customer.id}`}
                  className="text-sm font-semibold text-signal-600 hover:text-signal-700"
                >
                  View Customer
                </Link>
              )}
            </div>

            {customer ? (
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                    Name
                  </p>

                  <p className="mt-1 font-semibold text-steel-900">
                    {customer.name}
                  </p>
                </div>

                {customer.phone && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                      Phone
                    </p>

                    <p className="mt-1 text-steel-700">
                      {customer.phone}
                    </p>
                  </div>
                )}

                {customer.whatsapp && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                      WhatsApp
                    </p>

                    <p className="mt-1 text-steel-700">
                      {customer.whatsapp}
                    </p>
                  </div>
                )}

                {customer.email && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                      Email
                    </p>

                    <p className="mt-1 break-all text-steel-700">
                      {customer.email}
                    </p>
                  </div>
                )}

                {customer.city && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                      City
                    </p>

                    <p className="mt-1 text-steel-700">
                      {customer.city}
                    </p>
                  </div>
                )}

                {customer.address && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                      Address
                    </p>

                    <p className="mt-1 whitespace-pre-line text-steel-700">
                      {customer.address}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-5 text-sm text-steel-500">
                Customer information unavailable.
              </p>
            )}
          </div>

          {/* ORDER */}
          <div className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-steel-900">
                Order
              </h2>

              {order?.id && (
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="text-sm font-semibold text-signal-600 hover:text-signal-700"
                >
                  View Order
                </Link>
              )}
            </div>

            {order ? (
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                    Order Number
                  </p>

                  <p className="mt-1 font-semibold text-steel-900">
                    {order.order_number}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                    Order Status
                  </p>

                  <p className="mt-1 text-steel-700">
                    {formatStatus(order.status)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                    Payment Status
                  </p>

                  <p className="mt-1 text-steel-700">
                    {formatStatus(order.payment_status)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                    Order Total
                  </p>

                  <p className="mt-1 font-semibold text-steel-900">
                    ₹
                    {Number(order.total ?? 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm text-steel-500">
                Order information unavailable.
              </p>
            )}
          </div>
        </section>

        {/* PRODUCTION INFORMATION */}
        <section className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-steel-900">
            Production Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {/* WORKER */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                Assigned Worker
              </p>

              <p className="mt-1 font-semibold text-steel-900">
                {worker?.name ||
                  job.assigned_worker ||
                  "Not assigned"}
              </p>

              {worker?.skill && (
                <p className="mt-1 text-sm text-steel-500">
                  {worker.skill}
                </p>
              )}

              {worker?.phone && (
                <p className="mt-1 text-sm text-steel-500">
                  {worker.phone}
                </p>
              )}
            </div>

            {/* PRIORITY */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                Priority
              </p>

              <span
                className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClasses(
                  job.priority
                )}`}
              >
                {formatPriority(job.priority)}
              </span>
            </div>

            {/* START DATE */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                Start Date
              </p>

              <p className="mt-1 text-steel-700">
                {formatDate(job.start_date)}
              </p>
            </div>

            {/* EXPECTED DATE */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                Expected Completion
              </p>

              <p className="mt-1 text-steel-700">
                {formatDate(job.expected_date)}
              </p>
            </div>
          </div>
        </section>

        {/* NOTES */}
        <section className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-steel-900">
            Production Notes
          </h2>

          <p className="mt-4 whitespace-pre-line text-sm leading-6 text-steel-700">
            {job.notes || "No production notes added."}
          </p>
        </section>

        {/* PRODUCTION UPDATE */}
        <section className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-steel-900">
              Production Updates
            </h2>

            <p className="mt-1 text-sm text-steel-500">
              Update fabrication status, progress, worker and completion date.
            </p>
          </div>

          <div className="mt-6 max-w-2xl">
            <ProductionUpdateForm
              jobId={job.id}
              status={job.status}
              progress={job.progress}
              workerId={job.worker_id}
              assignedWorker={job.assigned_worker}
              expectedDate={job.expected_date}
              notes={job.notes}
            />
          </div>
        </section>

        {/* TIMELINE */}
        <section className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-steel-900">
            Job Timeline
          </h2>

          <div className="mt-5 space-y-4">

            {/* CREATED */}
            <div className="flex gap-3">
              <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-signal-500" />

              <div>
                <p className="font-medium text-steel-900">
                  Job Created
                </p>

                <p className="text-sm text-steel-500">
                  {formatDateTime(job.created_at)}
                </p>
              </div>
            </div>

            {/* UPDATED */}
            <div className="flex gap-3">
              <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-steel-300" />

              <div>
                <p className="font-medium text-steel-900">
                  Last Updated
                </p>

                <p className="text-sm text-steel-500">
                  {formatDateTime(job.updated_at)}
                </p>
              </div>
            </div>

            {/* COMPLETED */}
            {job.completed_at && (
              <div className="flex gap-3">
                <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-emerald-500" />

                <div>
                  <p className="font-medium text-steel-900">
                    Production Completed
                  </p>

                  <p className="text-sm text-steel-500">
                    {formatDateTime(job.completed_at)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}