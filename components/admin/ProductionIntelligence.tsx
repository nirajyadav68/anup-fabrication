"use client";

type Worker = {
  id: string;
  name: string;
  skill: string | null;
  status: string;
};

type ProductionJob = {
  id: string;
  job_number: string | null;
  worker_id: string | null;
  priority: string;
  status: string;
  progress: number;
  expected_date: string | null;
};

type Props = {
  workers: Worker[];
  jobs: ProductionJob[];
};

const priorityOrder: Record<string, number> = {
  urgent: 4,
  high: 3,
  normal: 2,
  low: 1,
};

export default function ProductionIntelligence({
  workers,
  jobs,
}: Props) {
  const activeJobs = jobs.filter(
    (job) => job.status !== "completed"
  );

  const urgentJobs = activeJobs.filter(
    (job) => job.priority === "urgent"
  );

  const highPriorityJobs = activeJobs.filter(
    (job) =>
      job.priority === "urgent" ||
      job.priority === "high"
  );

  const availableWorkers = workers.filter((worker) => {
    if (worker.status !== "active") return false;

    const workerJobs = activeJobs.filter(
      (job) => job.worker_id === worker.id
    );

    return workerJobs.length === 0;
  });

  const overloadedWorkers = workers.filter((worker) => {
    if (worker.status !== "active") return false;

    const workerJobs = activeJobs.filter(
      (job) => job.worker_id === worker.id
    );

    return workerJobs.length >= 5;
  });

  const overallProgress =
    activeJobs.length > 0
      ? Math.round(
          activeJobs.reduce(
            (sum, job) => sum + Number(job.progress || 0),
            0
          ) / activeJobs.length
        )
      : 0;

  const workerWorkload = workers
    .filter((worker) => worker.status === "active")
    .map((worker) => {
      const workerJobs = activeJobs.filter(
        (job) => job.worker_id === worker.id
      );

      const progress =
        workerJobs.length > 0
          ? Math.round(
              workerJobs.reduce(
                (sum, job) =>
                  sum + Number(job.progress || 0),
                0
              ) / workerJobs.length
            )
          : 0;

      return {
        ...worker,
        jobCount: workerJobs.length,
        progress,
      };
    })
    .sort((a, b) => b.jobCount - a.jobCount);

  const upcomingJobs = [...activeJobs]
    .filter((job) => job.expected_date)
    .sort((a, b) => {
      return (
        new Date(a.expected_date as string).getTime() -
        new Date(b.expected_date as string).getTime()
      );
    })
    .slice(0, 5);

  const priorityCounts = {
    urgent: activeJobs.filter(
      (job) => job.priority === "urgent"
    ).length,
    high: activeJobs.filter(
      (job) => job.priority === "high"
    ).length,
    normal: activeJobs.filter(
      (job) => job.priority === "normal"
    ).length,
    low: activeJobs.filter(
      (job) => job.priority === "low"
    ).length,
  };

  const getWorkloadLabel = (count: number) => {
    if (count >= 5) return "Heavy";
    if (count >= 3) return "Medium";
    if (count >= 1) return "Light";
    return "Available";
  };

  const getWorkloadClass = (count: number) => {
    if (count >= 5) {
      return "bg-red-100 text-red-700";
    }

    if (count >= 3) {
      return "bg-yellow-100 text-yellow-700";
    }

    if (count >= 1) {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-green-100 text-green-700";
  };

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <div className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-steel-500">
              Production Intelligence
            </p>

            <h2 className="mt-1 text-2xl font-bold text-steel-900">
              Smart Production Overview
            </h2>

            <p className="mt-1 text-sm text-steel-600">
              Monitor worker workload, priorities and production deadlines.
            </p>
          </div>

          <div className="min-w-[220px]">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-steel-600">
                Overall Progress
              </span>

              <span className="font-bold text-steel-900">
                {overallProgress}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-steel-100">
              <div
                className="h-full rounded-full bg-steel-900 transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-steel-500">
            Active Production
          </p>

          <p className="mt-2 text-3xl font-bold text-steel-900">
            {activeJobs.length}
          </p>
        </div>

        <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-steel-500">
            Available Workers
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {availableWorkers.length}
          </p>
        </div>

        <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-steel-500">
            Overloaded Workers
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {overloadedWorkers.length}
          </p>
        </div>

        <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-steel-500">
            Urgent Jobs
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-600">
            {urgentJobs.length}
          </p>
        </div>
      </div>

      {/* WORKER WORKLOAD */}
      <div className="rounded-2xl border border-steel-200 bg-white shadow-sm">
        <div className="border-b border-steel-200 p-5">
          <h3 className="text-lg font-bold text-steel-900">
            Worker Workload
          </h3>

          <p className="mt-1 text-sm text-steel-500">
            Current workload of active workers.
          </p>
        </div>

        <div className="divide-y divide-steel-100">
          {workerWorkload.length === 0 ? (
            <div className="p-6 text-sm text-steel-500">
              No active workers found.
            </div>
          ) : (
            workerWorkload.map((worker) => (
              <div
                key={worker.id}
                className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-steel-900">
                    {worker.name}
                  </p>

                  <p className="text-sm text-steel-500">
                    {worker.skill || "General fabrication"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-40">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-steel-500">
                        Progress
                      </span>

                      <span className="font-medium text-steel-700">
                        {worker.progress}%
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-steel-100">
                      <div
                        className="h-2 rounded-full bg-steel-800"
                        style={{
                          width: `${worker.progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-lg font-bold text-steel-900">
                      {worker.jobCount}
                    </p>

                    <p className="text-xs text-steel-500">
                      Jobs
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getWorkloadClass(
                      worker.jobCount
                    )}`}
                  >
                    {getWorkloadLabel(worker.jobCount)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PRIORITY + DEADLINES */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-steel-900">
            Priority Overview
          </h3>

          <div className="mt-5 space-y-4">
            {(
              [
                ["Urgent", priorityCounts.urgent, "bg-red-500"],
                ["High", priorityCounts.high, "bg-orange-500"],
                ["Normal", priorityCounts.normal, "bg-blue-500"],
                ["Low", priorityCounts.low, "bg-green-500"],
              ] as const
            ).map(([label, count, bar]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-steel-700">
                    {label}
                  </span>

                  <span className="font-semibold text-steel-900">
                    {count}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-steel-100">
                  <div
                    className={`h-2 rounded-full ${bar}`}
                    style={{
                      width: `${
                        activeJobs.length > 0
                          ? Math.max(
                              (count / activeJobs.length) * 100,
                              count > 0 ? 5 : 0
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl bg-steel-50 p-4">
            <p className="text-sm text-steel-500">
              High Priority Jobs
            </p>

            <p className="mt-1 text-2xl font-bold text-steel-900">
              {highPriorityJobs.length}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-steel-200 bg-white shadow-sm">
          <div className="border-b border-steel-200 p-5">
            <h3 className="text-lg font-bold text-steel-900">
              Upcoming Production Deadlines
            </h3>

            <p className="mt-1 text-sm text-steel-500">
              Next scheduled production jobs.
            </p>
          </div>

          {upcomingJobs.length === 0 ? (
            <div className="p-6 text-sm text-steel-500">
              No upcoming deadlines.
            </div>
          ) : (
            <div className="divide-y divide-steel-100">
              {upcomingJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div>
                    <p className="font-semibold text-steel-900">
                      {job.job_number || "Production Job"}
                    </p>

                    <p className="text-xs text-steel-500">
                      Due{" "}
                      {job.expected_date
                        ? new Date(
                            job.expected_date
                          ).toLocaleDateString("en-IN")
                        : "-"}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="rounded-full bg-steel-100 px-2 py-1 text-xs font-semibold uppercase text-steel-700">
                      {job.priority}
                    </span>

                    <p className="mt-1 text-xs text-steel-500">
                      {job.progress}% complete
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}