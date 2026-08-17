"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createOrder } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 rounded-md bg-signal-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-signal-600 disabled:opacity-70"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? "Creating..." : "Create Order"}
    </button>
  );
}

export default function NewOrderPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    try {
      await createOrder(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div>
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-steel-500 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-navy-900">Add Order</h1>
      <p className="mt-1 text-sm text-steel-500">
        For custom fabrication, orders are quotation-based — online payment is optional, not required.
      </p>

      <form action={handleSubmit} className="mt-6 max-w-xl space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-navy-900">
              Customer Name
            </label>
            <input
              id="customerName"
              name="customerName"
              required
              className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
            />
          </div>
          <div>
            <label htmlFor="customerPhone" className="block text-sm font-medium text-navy-900">
              Customer Phone
            </label>
            <input
              id="customerPhone"
              name="customerPhone"
              required
              className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-navy-900">
            Order Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-navy-900">
              Quantity
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              defaultValue={1}
              className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
            />
          </div>
          <div>
            <label htmlFor="total" className="block text-sm font-medium text-navy-900">
              Total (₹) <span className="text-steel-500">(optional)</span>
            </label>
            <input
              id="total"
              name="total"
              type="number"
              min="0"
              step="0.01"
              className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm focus:border-signal-500"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}
