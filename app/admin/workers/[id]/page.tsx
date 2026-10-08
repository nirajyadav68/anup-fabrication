import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type Props = {
  params: {
    id: string;
  };
};

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

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function formatPriority(priority: string) {
  return (
    priority.charAt(0).toUpperCase() +
    priority.slice(1)
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

export default async function WorkerDetailPage({
  params,
}: Props) {
  const supabase = createClient();

  // ============================================
  // GET WORKER
  // ============================================

  const {
    data: worker,
    error: workerError,
  } = await supabase
    .from("workers")
    .select(`
      id,
      name,
      phone,
      skill,
      status,
      notes,
      created_at
    `)
    .eq("id", params.id)
    .single();

  if (workerError || !worker) {
    console.error(
      "Worker lookup error:",
      workerError
    );

    notFound();
  }

  // ============================================
  // GET PRODUCTION JOBS
  // ============================================

  const {
    data: jobs,
    error: jobsError,
  } = await supabase
    .from("production_jobs")
    .select(`
      id,
      job_number,
      order_id,
      worker_id,
      assigned_worker,
      priority,
      status,
      progress,
      start_date,
      expected_date,
      completed_at,
      created_at,

      customers (
        id,
        name,
        phone
      ),

      orders (
        id,
        order_number
      )
    `)
    .eq("worker_id", worker.id)
    .order("created_at", {
      ascending: false,
    });

  if (jobsError) {
    console.error(
      "Worker jobs error:",
      jobsError
    );
  }

  const workerJobs = jobs ?? [];

  // ============================================
  // STATS
  // ============================================

  const totalJobs = workerJobs.length;

  const pendingJobs = workerJobs.filter(
    (job) => job.status === "pending"
  ).length;

  const inProgressJobs = workerJobs.filter(
    (job) => job.status === "in_progress"
  ).length;

  const onHoldJobs = workerJobs.filter(
    (job) => job.status === "on_hold"
  ).length;

  const qualityCheckJobs = workerJobs.filter(
    (job) => job.status === "quality_check"
  ).length;

  const completedJobs = workerJobs.filter(
    (job) => job.status === "completed"
  ).length;

  const highPriorityJobs = workerJobs.filter(
    (job) =>
      job.priority === "high" ||
      job.priority === "urgent"
  ).length;

  const averageProgress =
    totalJobs > 0
      ? Math.round(
          workerJobs.reduce(
            (sum, job) =>
              sum + Number(job.progress || 0),
            0
          ) / totalJobs
        )
      : 0;

  const activeWorkload =
    pendingJobs +
    inProgressJobs +
    onHoldJobs +
    qualityCheckJobs;

  const workloadLabel =
    activeWorkload >= 5
      ? "Heavy"
      : activeWorkload >= 3
      ? "Medium"
      : activeWorkload >= 1
      ? "Light"
      : "Available";

  const workloadClass =
    activeWorkload >= 5
      ? "bg-red-100 text-red-700"
      : activeWorkload >= 3
      ? "bg-orange-100 text-orange-700"
      : activeWorkload >= 1
      ? "bg-blue-100 text-blue-700"
      : "bg-emerald-100 text-emerald-700";

  return (
    <main className="min-h-screen bg-steel-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =========================================
            HEADER
        ========================================= */}

        <div>
          <Link
            href="/admin/workers"
            className="text-sm font-medium text-steel-500 hover:text-steel-900"
          >
            ← Back to Workers
          </Link>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h1 className="text-3xl font-bold text-steel-900">
                {worker.name}
              </h1>

              <p className="mt-1 text-sm text-steel-500">
                Worker profile, workload and production performance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">

              <span
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  worker.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {worker.status === "active"
                  ? "Active"
                  : "Inactive"}
              </span>

              <span
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${workloadClass}`}
              >
                {workloadLabel} Workload
              </span>

            </div>
          </div>
        </div>

        {/* =========================================
            WORKER PROFILE + PERFORMANCE
        ========================================= */}

        <section className="grid gap-6 lg:grid-cols-3">

          {/* PROFILE */}

          <div className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-steel-100 text-3xl">
              👷
            </div>

            <h2 className="mt-4 text-xl font-bold text-steel-900">
              {worker.name}
            </h2>

            <div className="mt-5 space-y-4">

              {/* PHONE */}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-steel-400">
                  Phone
                </p>

                <p className="mt-1 text-sm text-steel-700">
                  {worker.phone || "Not provided"}
                </p>
              </div>

              {/* SKILL */}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-steel-400">
                  Skill
                </p>

                <p className="mt-1 text-sm text-steel-700">
                  {worker.skill || "General"}
                </p>
              </div>

              {/* JOINED */}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-steel-400">
                  Joined
                </p>

                <p className="mt-1 text-sm text-steel-700">
                  {formatDate(worker.created_at)}
                </p>
              </div>

              {/* NOTES */}

              {worker.notes && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-steel-400">
                    Notes
                  </p>

                  <p className="mt-1 text-sm leading-6 text-steel-700">
                    {worker.notes}
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* PERFORMANCE CARDS */}

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">

            {/* TOTAL */}

            <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-steel-500">
                Total Jobs
              </p>

              <p className="mt-2 text-3xl font-bold text-steel-900">
                {totalJobs}
              </p>

              <p className="mt-1 text-xs text-steel-400">
                All assigned jobs
              </p>
            </div>

            {/* PENDING */}

            <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-steel-500">
                Pending
              </p>

              <p className="mt-2 text-3xl font-bold text-steel-700">
                {pendingJobs}
              </p>
            </div>

            {/* IN PROGRESS */}

            <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-steel-500">
                In Progress
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {inProgressJobs}
              </p>
            </div>

            {/* QUALITY CHECK */}

            <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-steel-500">
                Quality Check
              </p>

              <p className="mt-2 text-3xl font-bold text-purple-600">
                {qualityCheckJobs}
              </p>
            </div>

            {/* COMPLETED */}

            <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-steel-500">
                Completed
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {completedJobs}
              </p>
            </div>

            {/* ON HOLD */}

            <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-steel-500">
                On Hold
              </p>

              <p className="mt-2 text-3xl font-bold text-amber-600">
                {onHoldJobs}
              </p>
            </div>

          </div>
        </section>

        {/* =========================================
            PERFORMANCE OVERVIEW
        ========================================= */}

        <section className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-bold text-steel-900">
                Performance Overview
              </h2>

              <p className="mt-1 text-sm text-steel-500">
                Overall production progress for this worker.
              </p>
            </div>

            <div className="text-right">
              <p className="text-3xl font-bold text-signal-600">
                {averageProgress}%
              </p>

              <p className="text-xs text-steel-500">
                Average Progress
              </p>
            </div>

          </div>

          <div className="mt-5 h-4 overflow-hidden rounded-full bg-steel-100">

            <div
              className="h-full rounded-full bg-signal-500 transition-all"
              style={{
                width: `${averageProgress}%`,
              }}
            />

          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">

            <div className="rounded-xl bg-steel-50 p-4">
              <p className="text-xs text-steel-500">
                Active Workload
              </p>

              <p className="mt-1 text-xl font-bold text-steel-900">
                {activeWorkload}
              </p>
            </div>

            <div className="rounded-xl bg-steel-50 p-4">
              <p className="text-xs text-steel-500">
                High Priority
              </p>

              <p className="mt-1 text-xl font-bold text-orange-600">
                {highPriorityJobs}
              </p>
            </div>

            <div className="rounded-xl bg-steel-50 p-4">
              <p className="text-xs text-steel-500">
                Completed Rate
              </p>

              <p className="mt-1 text-xl font-bold text-emerald-600">
                {totalJobs > 0
                  ? Math.round(
                      (completedJobs /
                        totalJobs) *
                        100
                    )
                  : 0}
                %
              </p>
            </div>

          </div>
        </section>

        {/* =========================================
            JOB HISTORY
        ========================================= */}

        <section className="overflow-hidden rounded-2xl border border-steel-200 bg-white shadow-sm">

          <div className="border-b border-steel-200 px-6 py-5">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-bold text-steel-900">
                  Assigned Production Jobs
                </h2>

                <p className="mt-1 text-sm text-steel-500">
                  Production jobs assigned to this worker.
                </p>
              </div>

              <div className="rounded-lg bg-steel-100 px-3 py-2 text-sm font-semibold text-steel-700">
                {totalJobs} jobs
              </div>

            </div>

          </div>

          {workerJobs.length === 0 ? (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-steel-100 text-2xl">
                📋
              </div>

              <h3 className="mt-4 text-lg font-semibold text-steel-900">
                No assigned jobs
              </h3>

              <p className="mt-1 text-sm text-steel-500">
                No production jobs are currently assigned
                to this worker.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>
                  <tr className="border-b border-steel-200 bg-steel-50">

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-500">
                      Job
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-500">
                      Customer
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-500">
                      Order
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-500">
                      Priority
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-500">
                      Progress
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-500">
                      Expected
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {workerJobs.map((job) => {

                    const customer =
                      Array.isArray(job.customers)
                        ? job.customers[0]
                        : job.customers;

                    const order =
                      Array.isArray(job.orders)
                        ? job.orders[0]
                        : job.orders;

                    return (
                      <tr
                        key={job.id}
                        className="border-b border-steel-100 transition hover:bg-steel-50"
                      >

                        {/* JOB */}

                        <td className="px-6 py-4">

                          <Link
                            href={`/admin/production/${job.id}`}
                            className="font-semibold text-signal-600 hover:text-signal-700"
                          >
                            {job.job_number || "—"}
                          </Link>

                          <p className="mt-1 text-xs text-steel-400">
                            {formatDate(job.created_at)}
                          </p>

                        </td>

                        {/* CUSTOMER */}

                        <td className="px-6 py-4">

                          <p className="font-medium text-steel-900">
                            {customer?.name || "—"}
                          </p>

                          {customer?.phone && (
                            <p className="mt-1 text-xs text-steel-500">
                              {customer.phone}
                            </p>
                          )}

                        </td>

                        {/* ORDER */}

                        <td className="px-6 py-4 text-sm text-steel-700">
                          {order?.order_number || "—"}
                        </td>

                        {/* PRIORITY */}

                        <td className="px-6 py-4">

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClasses(
                              job.priority
                            )}`}
                          >
                            {formatPriority(
                              job.priority
                            )}
                          </span>

                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                              job.status
                            )}`}
                          >
                            {formatStatus(job.status)}
                          </span>

                        </td>

                        {/* PROGRESS */}

                        <td className="px-6 py-4">

                          <div className="w-32">

                            <div className="flex justify-between text-xs">

                              <span className="font-medium text-steel-700">
                                {job.progress}%
                              </span>

                            </div>

                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-steel-100">

                              <div
                                className="h-full rounded-full bg-signal-500 transition-all"
                                style={{
                                  width: `${job.progress}%`,
                                }}
                              />

                            </div>

                          </div>

                        </td>

                        {/* EXPECTED */}

                        <td className="px-6 py-4 text-sm text-steel-700">
                          {formatDate(
                            job.expected_date
                          )}
                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>
    </main>
  );
}