"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Worker = {
  id: string;
  name: string;
  phone: string | null;
  skill: string | null;
  status: string;
};

type ProductionJob = {
  id: string;
  job_number: string | null;
  worker_id: string | null;
  assigned_worker: string | null;
  priority: string;
  status: string;
  progress: number;
  expected_date: string | null;
  created_at: string;

  workers:
    | Worker
    | Worker[]
    | null;

  customers:
    | {
        id: string;
        name: string;
        phone: string | null;
      }
    | {
        id: string;
        name: string;
        phone: string | null;
      }[]
    | null;

  orders:
    | {
        id: string;
        order_number: string;
      }
    | {
        id: string;
        order_number: string;
      }[]
    | null;
};

type Props = {
  jobs: ProductionJob[];
};

function formatStatus(status: string) {
  return status
    .replace(/\_/g, " ")
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

export default function ProductionDirectory({
  jobs,
}: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = jobs.filter((job) => {
      const customer = Array.isArray(job.customers)
        ? job.customers[0]
        : job.customers;

      const order = Array.isArray(job.orders)
        ? job.orders[0]
        : job.orders;

      const worker = Array.isArray(job.workers)
        ? job.workers[0]
        : job.workers;

      const matchesSearch =
        !query ||
        job.job_number
          ?.toLowerCase()
          .includes(query) ||
        worker?.name
          ?.toLowerCase()
          .includes(query) ||
        worker?.skill
          ?.toLowerCase()
          .includes(query) ||
        job.assigned_worker
          ?.toLowerCase()
          .includes(query) ||
        customer?.name
          ?.toLowerCase()
          .includes(query) ||
        customer?.phone
          ?.toLowerCase()
          .includes(query) ||
        order?.order_number
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        status === "all" ||
        job.status === status;

      const matchesPriority =
        priority === "all" ||
        job.priority === priority;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });

    return [...result].sort((a, b) => {
      if (sortBy === "oldest") {
        return (
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
        );
      }

      if (sortBy === "progress-low") {
        return a.progress - b.progress;
      }

      if (sortBy === "progress-high") {
        return b.progress - a.progress;
      }

      if (sortBy === "priority") {
        const priorityOrder: Record<
          string,
          number
        > = {
          urgent: 1,
          high: 2,
          normal: 3,
          low: 4,
        };

        return (
          (priorityOrder[a.priority] || 5) -
          (priorityOrder[b.priority] || 5)
        );
      }

      if (sortBy === "expected") {
        if (!a.expected_date) return 1;
        if (!b.expected_date) return -1;

        return (
          new Date(a.expected_date).getTime() -
          new Date(b.expected_date).getTime()
        );
      }

      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    });
  }, [
    jobs,
    search,
    status,
    priority,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setPriority("all");
    setSortBy("latest");
  };

  const hasFilters =
    search ||
    status !== "all" ||
    priority !== "all" ||
    sortBy !== "latest";

  return (
    <section className="overflow-hidden rounded-2xl border border-steel-200 bg-white shadow-sm">

      {/* HEADER */}

      <div className="border-b border-steel-200 px-6 py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h2 className="text-lg font-bold text-steel-900">
              Production Jobs
            </h2>

            <p className="mt-1 text-sm text-steel-500">
              Search and manage fabrication work.
            </p>
          </div>

          <div className="rounded-lg bg-steel-100 px-3 py-2 text-sm font-semibold text-steel-700">
            {filteredJobs.length} of {jobs.length} jobs
          </div>

        </div>

        {/* FILTERS */}

        <div className="mt-5 grid gap-3 lg:grid-cols-4">

          {/* SEARCH */}

          <div className="lg:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-steel-500">
              Search
            </label>

            <div className="relative mt-2">
              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Job, customer, worker or order..."
                className="w-full rounded-xl border border-steel-300 bg-white px-4 py-3 pr-10 text-sm text-steel-900 outline-none transition focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-steel-400">
                🔎
              </span>
            </div>
          </div>

          {/* STATUS */}

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-steel-500">
              Status
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-steel-300 bg-white px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            >
              <option value="all">
                All Statuses
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="in_progress">
                In Progress
              </option>

              <option value="on_hold">
                On Hold
              </option>

              <option value="quality_check">
                Quality Check
              </option>

              <option value="completed">
                Completed
              </option>
            </select>
          </div>

          {/* PRIORITY */}

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-steel-500">
              Priority
            </label>

            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-steel-300 bg-white px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            >
              <option value="all">
                All Priorities
              </option>

              <option value="urgent">
                Urgent
              </option>

              <option value="high">
                High
              </option>

              <option value="normal">
                Normal
              </option>

              <option value="low">
                Low
              </option>
            </select>
          </div>
        </div>

        {/* SORT */}

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-steel-600">
              Sort:
            </label>

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
              className="rounded-lg border border-steel-300 bg-white px-3 py-2 text-sm outline-none focus:border-signal-500"
            >
              <option value="latest">
                Latest Created
              </option>

              <option value="oldest">
                Oldest Created
              </option>

              <option value="priority">
                Highest Priority
              </option>

              <option value="expected">
                Expected Date
              </option>

              <option value="progress-low">
                Lowest Progress
              </option>

              <option value="progress-high">
                Highest Progress
              </option>
            </select>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-semibold text-signal-600 hover:text-signal-700"
            >
              Clear Filters
            </button>
          )}

        </div>
      </div>

      {/* EMPTY */}

      {filteredJobs.length === 0 ? (
        <div className="px-6 py-16 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-steel-100 text-2xl">
            🔍
          </div>

          <h3 className="mt-4 text-lg font-semibold text-steel-900">
            No matching production jobs
          </h3>

          <p className="mt-1 text-sm text-steel-500">
            Try changing your search or filters.
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-lg bg-signal-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-signal-600"
            >
              Clear Filters
            </button>
          )}

        </div>
      ) : (

        /* TABLE */

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
                  Worker
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

              {filteredJobs.map((job) => {
                const customer =
                  Array.isArray(job.customers)
                    ? job.customers[0]
                    : job.customers;

                const order =
                  Array.isArray(job.orders)
                    ? job.orders[0]
                    : job.orders;

                const worker =
                  Array.isArray(job.workers)
                    ? job.workers[0]
                    : job.workers;

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

                    {/* WORKER */}

                    <td className="px-6 py-4">
                      {worker ? (
                        <>
                          <p className="font-medium text-steel-900">
                            {worker.name}
                          </p>

                          {worker.skill && (
                            <p className="mt-1 text-xs text-steel-500">
                              {worker.skill}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-steel-500">
                          {job.assigned_worker ||
                            "Not assigned"}
                        </p>
                      )}
                    </td>

                    {/* PRIORITY */}

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClasses(
                          job.priority
                        )}`}
                      >
                        {formatPriority(job.priority)}
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

                        <div className="flex items-center justify-between text-xs">
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
                      {formatDate(job.expected_date)}
                    </td>

                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}