"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { createClient } from "@/lib/supabase/client";
import { updateProductionJob } from "./actions";

type Worker = {
  id: string;
  name: string;
  phone: string | null;
  skill: string | null;
  status: string;
};

type Props = {
  jobId: string;
  status: string;
  progress: number;
  workerId: string | null;
  assignedWorker: string | null;
  expectedDate: string | null;
  notes: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-signal-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-signal-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Updating..." : "Update Production Job"}
    </button>
  );
}

export default function ProductionUpdateForm({
  jobId,
  status: initialStatus,
  progress: initialProgress,
  workerId: initialWorkerId,
  assignedWorker: initialWorker,
  expectedDate: initialExpectedDate,
  notes: initialNotes,
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [progress, setProgress] = useState(initialProgress);

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workerId, setWorkerId] = useState(
    initialWorkerId || ""
  );

  const [loadingWorkers, setLoadingWorkers] = useState(true);

  useEffect(() => {
    async function loadWorkers() {
      try {
        const supabase = createClient();

        const { data, error } = await supabase
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

        if (error) {
          console.error(
            "Workers loading error:",
            error
          );
          return;
        }

        setWorkers(data ?? []);
      } catch (error) {
        console.error(
          "Workers loading error:",
          error
        );
      } finally {
        setLoadingWorkers(false);
      }
    }

    loadWorkers();
  }, []);

  return (
    <form
      action={async (formData) => {
        await updateProductionJob(
          jobId,
          formData
        );
      }}
      className="space-y-5"
    >
      {/* STATUS */}

      <div>
        <label className="text-sm font-medium text-steel-700">
          Production Status
        </label>

        <select
          name="status"
          value={status}
          onChange={(event) => {
            const nextStatus =
              event.target.value;

            setStatus(nextStatus);

            if (
              nextStatus === "completed"
            ) {
              setProgress(100);
            }
          }}
          className="mt-2 w-full rounded-xl border border-steel-300 bg-white px-4 py-3 text-sm text-steel-900 outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
        >
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

      {/* PROGRESS */}

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-steel-700">
            Progress
          </label>

          <span className="text-sm font-bold text-signal-600">
            {progress}%
          </span>
        </div>

        <input
          name="progress"
          type="range"
          min="0"
          max="100"
          step="5"
          value={progress}
          onChange={(event) =>
            setProgress(
              Number(event.target.value)
            )
          }
          className="mt-3 w-full"
        />

        <div className="mt-2 h-3 overflow-hidden rounded-full bg-steel-100">
          <div
            className="h-full rounded-full bg-signal-500 transition-all"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* WORKER */}

      <div>
        <label className="text-sm font-medium text-steel-700">
          Assigned Worker
        </label>

        <select
          name="workerId"
          value={workerId}
          onChange={(event) =>
            setWorkerId(event.target.value)
          }
          disabled={loadingWorkers}
          required
          className="mt-2 w-full rounded-xl border border-steel-300 bg-white px-4 py-3 text-sm text-steel-900 outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100 disabled:cursor-not-allowed disabled:bg-steel-50"
        >
          <option value="">
            {loadingWorkers
              ? "Loading workers..."
              : "Select Worker"}
          </option>

          {workers.map((worker) => (
            <option
              key={worker.id}
              value={worker.id}
            >
              {worker.name}
              {worker.skill
                ? ` — ${worker.skill}`
                : ""}
            </option>
          ))}
        </select>

        {/* Selected Worker Info */}

        {workerId && (
          <div className="mt-3 rounded-xl border border-steel-200 bg-steel-50 p-4">
            {(() => {
              const selectedWorker =
                workers.find(
                  (worker) =>
                    worker.id === workerId
                );

              if (!selectedWorker) {
                return (
                  <p className="text-sm text-steel-500">
                    Current worker:
                    {" "}
                    {initialWorker ||
                      "Unknown"}
                  </p>
                );
              }

              return (
                <div>
                  <p className="font-semibold text-steel-900">
                    {selectedWorker.name}
                  </p>

                  {selectedWorker.skill && (
                    <p className="mt-1 text-sm text-steel-500">
                      Skill:{" "}
                      {selectedWorker.skill}
                    </p>
                  )}

                  {selectedWorker.phone && (
                    <p className="mt-1 text-sm text-steel-500">
                      Phone:{" "}
                      {selectedWorker.phone}
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        <p className="mt-2 text-xs text-steel-400">
          Select an active worker from the Workers
          management list.
        </p>
      </div>

      {/* EXPECTED DATE */}

      <div>
        <label className="text-sm font-medium text-steel-700">
          Expected Completion Date
        </label>

        <input
          name="expectedDate"
          type="date"
          defaultValue={
            initialExpectedDate || ""
          }
          className="mt-2 w-full rounded-xl border border-steel-300 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
        />
      </div>

      {/* NOTES */}

      <div>
        <label className="text-sm font-medium text-steel-700">
          Production Notes
        </label>

        <textarea
          name="notes"
          rows={5}
          defaultValue={
            initialNotes || ""
          }
          placeholder="Add production updates..."
          className="mt-2 w-full rounded-xl border border-steel-300 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
        />
      </div>

      {/* SUBMIT */}

      <div className="flex justify-end border-t border-steel-100 pt-5">
        <SubmitButton />
      </div>
    </form>
  );
}