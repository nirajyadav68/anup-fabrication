"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  orderId: string;
  total: number;
  paidAmount: number;
  paymentStatus: string;
  paymentMethod?: string | null;
  paymentNotes?: string | null;
};

const METHODS = [
  {
    value: "cash",
    label: "Cash",
  },
  {
    value: "upi",
    label: "UPI",
  },
  {
    value: "bank_transfer",
    label: "Bank Transfer",
  },
  {
    value: "card",
    label: "Card",
  },
  {
    value: "cheque",
    label: "Cheque",
  },
  {
    value: "other",
    label: "Other",
  },
];

export default function PaymentUpdateForm({
  orderId,
  total,
  paidAmount,
  paymentStatus,
  paymentMethod,
  paymentNotes,
}: Props) {
  const router = useRouter();

  const [amount, setAmount] = useState(
    String(paidAmount ?? 0)
  );

  const [method, setMethod] = useState(
    paymentMethod ?? ""
  );

  const [notes, setNotes] = useState(
    paymentNotes ?? ""
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const currentPaid = Number(amount) || 0;

  const remaining = Math.max(
    total - currentPaid,
    0
  );

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/payment`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paidAmount: currentPaid,
            paymentMethod: method || null,
            paymentNotes: notes || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update payment."
        );
      }

      setMessage(
        "Payment updated successfully."
      );

      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to update payment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Payment Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-steel-200 bg-steel-50 p-4">
          <p className="text-xs font-medium text-steel-500">
            Order Total
          </p>

          <p className="mt-1 text-xl font-bold text-steel-900">
            ₹{total.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="rounded-xl border border-steel-200 bg-steel-50 p-4">
          <p className="text-xs font-medium text-steel-500">
            Paid Amount
          </p>

          <p className="mt-1 text-xl font-bold text-steel-900">
            ₹
            {currentPaid.toLocaleString(
              "en-IN"
            )}
          </p>
        </div>

        <div className="rounded-xl border border-steel-200 bg-steel-50 p-4">
          <p className="text-xs font-medium text-steel-500">
            Remaining
          </p>

          <p className="mt-1 text-xl font-bold text-steel-900">
            ₹
            {remaining.toLocaleString(
              "en-IN"
            )}
          </p>
        </div>
      </div>

      {/* Paid Amount */}
      <div>
        <label className="mb-2 block text-sm font-medium text-steel-700">
          Paid Amount
        </label>

        <input
          type="number"
          min="0"
          max={total}
          step="0.01"
          value={amount}
          onChange={(event) =>
            setAmount(event.target.value)
          }
          className="w-full rounded-lg border border-steel-300 px-3 py-2.5 text-sm outline-none focus:border-signal-500"
          placeholder="Enter paid amount"
        />
      </div>

      {/* Payment Method */}
      <div>
        <label className="mb-2 block text-sm font-medium text-steel-700">
          Payment Method
        </label>

        <select
          value={method}
          onChange={(event) =>
            setMethod(event.target.value)
          }
          className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-signal-500"
        >
          <option value="">
            Select payment method
          </option>

          {METHODS.map((item) => (
            <option
              key={item.value}
              value={item.value}
            >
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* Payment Notes */}
      <div>
        <label className="mb-2 block text-sm font-medium text-steel-700">
          Payment Notes
        </label>

        <textarea
          value={notes}
          onChange={(event) =>
            setNotes(event.target.value)
          }
          rows={3}
          className="w-full rounded-lg border border-steel-300 px-3 py-2.5 text-sm outline-none focus:border-signal-500"
          placeholder="Example: Advance payment received through UPI"
        />
      </div>

      {/* Current Status */}
      <div className="rounded-lg bg-steel-50 p-3">
        <p className="text-xs text-steel-500">
          Payment Status
        </p>

        <p className="mt-1 text-sm font-semibold text-steel-900">
          {paymentStatus
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) =>
              char.toUpperCase()
            )}
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex rounded-lg bg-signal-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-signal-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Updating..."
          : "Update Payment"}
      </button>

      {message && (
        <p className="text-sm text-steel-600">
          {message}
        </p>
      )}
    </form>
  );
}