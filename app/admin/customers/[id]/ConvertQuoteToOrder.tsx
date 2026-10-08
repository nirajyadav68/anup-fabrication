"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  quoteId: string;
  quoteNumber: string;
  customerId: string;
  status: string;
};

export default function ConvertQuoteToOrder({
  quoteId,
  quoteNumber,
  customerId,
  status,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleConvert() {
    if (status !== "approved") {
      setMessage(
        "Only approved quotes can be converted into an order."
      );
      return;
    }

    const confirmed = window.confirm(
      `Convert ${quoteNumber} into an order?`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/orders/from-quote",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quoteId,
            customerId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to create order."
        );
      }

      setMessage(
        `Order ${data.orderNumber} created successfully.`
      );

      router.refresh();

      setTimeout(() => {
        router.push("/admin/orders");
      }, 700);
    } catch (error) {
      console.error(
        "Convert quote error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to create order."
      );
    } finally {
      setLoading(false);
    }
  }

  if (status !== "approved") {
    return null;
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleConvert}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-signal-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-signal-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Creating Order..."
          : "Convert to Order"}
      </button>

      {message && (
        <p className="mt-2 max-w-xs text-xs text-steel-600">
          {message}
        </p>
      )}
    </div>
  );
}