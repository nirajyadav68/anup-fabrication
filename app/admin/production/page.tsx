import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import ProductionDirectory from "@/components/admin/ProductionDirectory";
import ProductionIntelligence from "@/components/admin/ProductionIntelligence";

export default async function ProductionPage() {
  const supabase = createClient();

  // ============================================
  // PRODUCTION JOBS
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
        phone
      ),

      orders (
        id,
        order_number
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  // ============================================
  // WORKERS
  // ============================================

  const {
    data: workers,
    error: workersError,
  } = await supabase
    .from("workers")
    .select(`
      id,
      name,
      skill,
      status
    `)
    .order("name", {
      ascending: true,
    });

  if (jobsError) {
    console.error(
      "Production jobs error:",
      jobsError
    );
  }

  if (workersError) {
    console.error(
      "Workers error:",
      workersError
    );
  }

  const productionJobs = jobs ?? [];
  const workerList = workers ?? [];

  // ============================================
  // SUMMARY
  // ============================================

  const totalJobs = productionJobs.length;

  const pendingJobs = productionJobs.filter(
    (job) => job.status === "pending"
  ).length;

  const inProgressJobs = productionJobs.filter(
    (job) => job.status === "in_progress"
  ).length;

  const qualityCheckJobs = productionJobs.filter(
    (job) => job.status === "quality_check"
  ).length;

  const completedJobs = productionJobs.filter(
    (job) => job.status === "completed"
  ).length;

  return (
    <main className="min-h-screen bg-steel-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <Link
              href="/admin/dashboard"
              className="text-sm font-medium text-steel-500 hover:text-steel-900"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-2 text-3xl font-bold text-steel-900">
              Production Management
            </h1>

            <p className="mt-1 text-sm text-steel-500">
              Manage fabrication jobs, workers, progress and production deadlines.
            </p>
          </div>

          <Link
            href="/admin/production/new"
            className="inline-flex items-center justify-center rounded-xl bg-signal-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-signal-600"
          >
            + Create Production Job
          </Link>

        </div>

        {/* =========================================
            SUMMARY
        ========================================= */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-steel-500">
              Total Jobs
            </p>

            <p className="mt-2 text-3xl font-bold text-steel-900">
              {totalJobs}
            </p>
          </div>

          <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-steel-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-steel-700">
              {pendingJobs}
            </p>
          </div>

          <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-steel-500">
              In Progress
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {inProgressJobs}
            </p>
          </div>

          <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-steel-500">
              Quality Check
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-600">
              {qualityCheckJobs}
            </p>
          </div>

          <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-steel-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {completedJobs}
            </p>
          </div>

        </section>

        {/* =========================================
            PRODUCTION INTELLIGENCE
        ========================================= */}

        <ProductionIntelligence
          workers={workerList}
          jobs={productionJobs.map((job) => ({
            id: job.id,
            job_number: job.job_number,
            worker_id: job.worker_id,
            priority: job.priority,
            status: job.status,
            progress: job.progress,
            expected_date: job.expected_date,
          }))}
        />

        {/* =========================================
            PRODUCTION DIRECTORY
        ========================================= */}

        <ProductionDirectory
          jobs={productionJobs}
        />

      </div>
    </main>
  );
}