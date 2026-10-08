"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Customer = {
  id: string;
  name: string;
  phone: string | null;
};

type Order = {
  id: string;
  order_number: string;
  customer_id: string | null;
  status: string;
  total: number | null;
  customers:
    | Customer
    | Customer[]
    | null;
};

type Worker = {
  id: string;
  name: string;
  phone: string | null;
  skill: string | null;
  status: string;
};

type Props = {
  orders: Order[];
  workers: Worker[];
};

export default function CreateProductionJobForm({
  orders,
  workers,
}: Props) {
  const router = useRouter();

  const [orderId, setOrderId] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [priority, setPriority] = useState("normal");
  const [startDate, setStartDate] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedOrder = orders.find(
    (order) => order.id === orderId
  );

  const selectedWorker = workers.find(
    (worker) => worker.id === workerId
  );

  const selectedCustomer = selectedOrder
    ? Array.isArray(selectedOrder.customers)
      ? selectedOrder.customers[0]
      : selectedOrder.customers
    : null;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");

    if (!orderId) {
      setErrorMessage("Please select an order.");
      return;
    }

    if (!workerId) {
      setErrorMessage("Please assign a worker.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/production",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            workerId,
            workerName: selectedWorker?.name || "",
            priority,
            startDate: startDate || null,
            expectedDate: expectedDate || null,
            notes: notes.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to create production job."
        );
      }

      router.push(
        `/admin/production/${data.jobId}`
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Create production job error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to create production job."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-6">

        {/* ORDER */}
        <div>
          <label className="text-sm font-medium text-steel-700">
            Order *
          </label>

          <select
            value={orderId}
            onChange={(event) =>
              setOrderId(event.target.value)
            }
            className="mt-2 w-full rounded-xl border border-steel-300 bg-white px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          >
            <option value="">
              Select Order
            </option>

            {orders.map((order) => (
              <option
                key={order.id}
                value={order.id}
              >
                {order.order_number}
                {order.status
                  ? ` — ${order.status}`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        {/* CUSTOMER PREVIEW */}
        {selectedCustomer && (
          <div className="rounded-xl border border-steel-200 bg-steel-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-steel-500">
              Customer
            </p>

            <p className="mt-1 font-semibold text-steel-900">
              {selectedCustomer.name}
            </p>

            {selectedCustomer.phone && (
              <p className="mt-1 text-sm text-steel-600">
                {selectedCustomer.phone}
              </p>
            )}
          </div>
        )}

        {/* WORKER */}
        <div>
          <label className="text-sm font-medium text-steel-700">
            Assign Worker *
          </label>

          <select
            value={workerId}
            onChange={(event) =>
              setWorkerId(event.target.value)
            }
            className="mt-2 w-full rounded-xl border border-steel-300 bg-white px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          >
            <option value="">
              Select Worker
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

          {workers.length === 0 && (
            <p className="mt-2 text-sm text-amber-600">
              No active workers found. Add an active
              worker first.
            </p>
          )}
        </div>

        {/* WORKER PREVIEW */}
        {selectedWorker && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Assigned Worker
            </p>

            <p className="mt-1 font-semibold text-blue-900">
              {selectedWorker.name}
            </p>

            <div className="mt-1 flex flex-wrap gap-3 text-sm text-blue-700">
              {selectedWorker.skill && (
                <span>
                  Skill: {selectedWorker.skill}
                </span>
              )}

              {selectedWorker.phone && (
                <span>
                  Phone: {selectedWorker.phone}
                </span>
              )}
            </div>
          </div>
        )}

        {/* PRIORITY */}
        <div>
          <label className="text-sm font-medium text-steel-700">
            Priority
          </label>

          <select
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value)
            }
            className="mt-2 w-full rounded-xl border border-steel-300 bg-white px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          >
            <option value="low">
              Low
            </option>

            <option value="normal">
              Normal
            </option>

            <option value="high">
              High
            </option>

            <option value="urgent">
              Urgent
            </option>
          </select>
        </div>

        {/* START DATE */}
        <div>
          <label className="text-sm font-medium text-steel-700">
            Start Date
          </label>

          <input
            type="date"
            value={startDate}
            onChange={(event) =>
              setStartDate(event.target.value)
            }
            className="mt-2 w-full rounded-xl border border-steel-300 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          />
        </div>

        {/* EXPECTED DATE */}
        <div>
          <label className="text-sm font-medium text-steel-700">
            Expected Completion Date
          </label>

          <input
            type="date"
            value={expectedDate}
            onChange={(event) =>
              setExpectedDate(event.target.value)
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
            rows={5}
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            placeholder="Add production instructions or notes..."
            className="mt-2 w-full rounded-xl border border-steel-300 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          />
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-col-reverse gap-3 border-t border-steel-100 pt-5 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={() =>
              router.push("/admin/production")
            }
            className="rounded-xl border border-steel-300 px-5 py-3 text-sm font-semibold text-steel-700 hover:bg-steel-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-signal-500 px-5 py-3 text-sm font-semibold text-white hover:bg-signal-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Creating..."
              : "Create Production Job"}
          </button>

        </div>

      </div>
    </form>
  );
}