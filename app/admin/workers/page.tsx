import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

function statusClasses(status: string) {
  return status === "active"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-slate-100 text-slate-600";
}

function getWorkloadClasses(totalJobs: number) {
  if (totalJobs >= 5) {
    return "bg-red-100 text-red-700";
  }

  if (totalJobs >= 3) {
    return "bg-orange-100 text-orange-700";
  }

  if (totalJobs >= 1) {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-slate-100 text-slate-600";
}

function getWorkloadLabel(totalJobs: number) {
  if (totalJobs >= 5) return "Heavy";
  if (totalJobs >= 3) return "Medium";
  if (totalJobs >= 1) return "Light";
  return "Available";
}

export default async function WorkersPage() {
  const supabase = createClient();

  // WORKERS
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
      status,
      notes,
      created_at
    `)
    .order("created_at", {
      ascending: false,
    });

  // PRODUCTION JOBS
  const {
    data: productionJobs,
    error: jobsError,
  } = await supabase
    .from("production_jobs")
    .select(`
      id,
      worker_id,
      assigned_worker,
      status,
      progress
    `);

  if (workersError) {
    console.error("Workers error:", workersError);
  }

  if (jobsError) {
    console.error("Production jobs error:", jobsError);
  }

  const workerList = workers ?? [];
  const jobList = productionJobs ?? [];

  // SUMMARY
  const totalWorkers = workerList.length;

  const activeWorkers = workerList.filter(
    (worker) => worker.status === "active"
  ).length;

  const inactiveWorkers = workerList.filter(
    (worker) => worker.status === "inactive"
  ).length;

  const totalJobs = jobList.length;

  const activeJobs = jobList.filter(
    (job) =>
      job.status === "in_progress"
  ).length;

  const completedJobs = jobList.filter(
    (job) =>
      job.status === "completed"
  ).length;

  return (
    <main className="min-h-screen bg-steel-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <Link
              href="/admin/dashboard"
              className="text-sm font-medium text-steel-500 hover:text-steel-900"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-2 text-3xl font-bold text-steel-900">
              Worker Management
            </h1>

            <p className="mt-1 text-sm text-steel-500">
              Manage fabrication workers, skills and production workload.
            </p>
          </div>

          <Link
            href="/admin/workers/new"
            className="inline-flex items-center justify-center rounded-xl bg-signal-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-signal-600"
          >
            + Add Worker
          </Link>

        </div>

        {/* SUMMARY */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          {/* TOTAL WORKERS */}

          <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-steel-500">
              Total Workers
            </p>

            <p className="mt-2 text-3xl font-bold text-steel-900">
              {totalWorkers}
            </p>
          </div>

          {/* ACTIVE */}

          <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-steel-500">
              Active
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {activeWorkers}
            </p>
          </div>

          {/* INACTIVE */}

          <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-steel-500">
              Inactive
            </p>

            <p className="mt-2 text-3xl font-bold text-steel-600">
              {inactiveWorkers}
            </p>
          </div>

          {/* ACTIVE JOBS */}

          <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-steel-500">
              Jobs In Progress
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {activeJobs}
            </p>
          </div>

          {/* COMPLETED */}

          <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-steel-500">
              Completed Jobs
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {completedJobs}
            </p>
          </div>

        </section>

        {/* WORKER TABLE */}

        <section className="overflow-hidden rounded-2xl border border-steel-200 bg-white shadow-sm">

          <div className="border-b border-steel-200 px-6 py-5">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-bold text-steel-900">
                  Workers & Workload
                </h2>

                <p className="mt-1 text-sm text-steel-500">
                  View workers and their current production assignments.
                </p>
              </div>

              <div className="rounded-lg bg-steel-100 px-3 py-2 text-sm font-semibold text-steel-700">
                {totalJobs} total production jobs
              </div>

            </div>

          </div>

          {workerList.length === 0 ? (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-steel-100 text-2xl">
                👷
              </div>

              <h3 className="mt-4 text-lg font-semibold text-steel-900">
                No workers yet
              </h3>

              <p className="mt-1 text-sm text-steel-500">
                Add your first worker to start managing production assignments.
              </p>

              <Link
                href="/admin/workers/new"
                className="mt-5 inline-flex rounded-lg bg-signal-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-signal-600"
              >
                Add First Worker
              </Link>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>
                  <tr className="border-b border-steel-200 bg-steel-50">

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-500">
                      Worker
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-500">
                      Phone
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-500">
                      Skill
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-steel-500">
                      Jobs
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-500">
                      Workload
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-steel-500">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {workerList.map((worker) => {

                    const workerJobs = jobList.filter(
                      (job) =>
                        job.worker_id === worker.id
                    );

                    const assignedJobs =
                      workerJobs.length;

                    const inProgress =
                      workerJobs.filter(
                        (job) =>
                          job.status === "in_progress"
                      ).length;

                    const qualityCheck =
                      workerJobs.filter(
                        (job) =>
                          job.status === "quality_check"
                      ).length;

                    const completed =
                      workerJobs.filter(
                        (job) =>
                          job.status === "completed"
                      ).length;

                    const averageProgress =
                      assignedJobs > 0
                        ? Math.round(
                            workerJobs.reduce(
                              (sum, job) =>
                                sum +
                                Number(
                                  job.progress || 0
                                ),
                              0
                            ) / assignedJobs
                          )
                        : 0;

                    return (
                      <tr
                        key={worker.id}
                        className="border-b border-steel-100 transition hover:bg-steel-50"
                      >

                        {/* WORKER */}

                        <td className="px-6 py-4">

                          <p className="font-semibold text-steel-900">
                            {worker.name}
                          </p>

                          {worker.notes && (
                            <p className="mt-1 max-w-xs truncate text-xs text-steel-500">
                              {worker.notes}
                            </p>
                          )}

                        </td>

                        {/* PHONE */}

                        <td className="px-6 py-4 text-sm text-steel-700">
                          {worker.phone || "—"}
                        </td>

                        {/* SKILL */}

                        <td className="px-6 py-4">

                          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            {worker.skill || "General"}
                          </span>

                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                              worker.status
                            )}`}
                          >
                            {worker.status === "active"
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </td>

                        {/* JOB COUNT */}

                        <td className="px-6 py-4 text-center">

                          <span className="inline-flex min-w-9 items-center justify-center rounded-full bg-steel-100 px-2.5 py-1 text-sm font-bold text-steel-800">
                            {assignedJobs}
                          </span>

                        </td>

                        {/* WORKLOAD */}

                        <td className="px-6 py-4">

                          <div className="min-w-[180px]">

                            <div className="flex items-center justify-between">

                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getWorkloadClasses(
                                  assignedJobs
                                )}`}
                              >
                                {getWorkloadLabel(
                                  assignedJobs
                                )}
                              </span>

                              <span className="text-xs font-semibold text-steel-500">
                                {averageProgress}%
                              </span>

                            </div>

                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-steel-100">

                              <div
                                className="h-full rounded-full bg-signal-500 transition-all"
                                style={{
                                  width: `${averageProgress}%`,
                                }}
                              />

                            </div>

                            <div className="mt-2 flex gap-3 text-[11px] text-steel-500">

                              <span>
                                🔵 {inProgress} active
                              </span>

                              <span>
                                🟣 {qualityCheck} QC
                              </span>

                              <span>
                                ✅ {completed} done
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* ACTION */}

                        <td className="px-6 py-4 text-right">

                          <Link
                            href={`/admin/workers/${worker.id}`}
                            className="text-sm font-semibold text-signal-600 hover:text-signal-700"
                          >
                            View →
                          </Link>

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