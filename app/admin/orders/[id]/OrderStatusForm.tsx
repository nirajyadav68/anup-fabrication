"use client";

import { useState, useTransition } from "react";
import {
  updateOrderStatus,
  updatePaymentStatus,
} from "./actions";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "in_production",
  "ready",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES = [
  "pending",
  "partially_paid",
  "paid",
  "refunded",
];

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

type Props = {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
};

export default function OrderStatusForm({
  orderId,
  currentStatus,
  currentPaymentStatus,
}: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(
    currentPaymentStatus
  );

  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(
    newStatus: string
  ) {
    setStatus(newStatus);
    setMessage("");

    startTransition(async () => {
      try {
        await updateOrderStatus(
          orderId,
          newStatus
        );

        setMessage(
          "Order status updated successfully."
        );
      } catch (error) {
        console.error(error);

        setStatus(currentStatus);

        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to update order status."
        );
      }
    });
  }

  function handlePaymentChange(
    newPaymentStatus: string
  ) {
    setPaymentStatus(newPaymentStatus);
    setMessage("");

    startTransition(async () => {
      try {
        await updatePaymentStatus(
          orderId,
          newPaymentStatus
        );

        setMessage(
          "Payment status updated successfully."
        );
      } catch (error) {
        console.error(error);

        setPaymentStatus(
          currentPaymentStatus
        );

        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to update payment status."
        );
      }
    });
  }

  return (
    <div className="space-y-6">

      {/* Order Status */}
      <div>
        <label
          htmlFor="order-status"
          className="block text-sm font-semibold text-steel-700"
        >
          Order Status
        </label>

        <select
          id="order-status"
          value={status}
          disabled={isPending}
          onChange={(event) =>
            handleStatusChange(
              event.target.value
            )
          }
          className="mt-2 w-full rounded-xl border border-steel-300 bg-white px-4 py-3 text-sm text-steel-900 outline-none transition focus:border-signal-500 focus:ring-2 focus:ring-signal-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {ORDER_STATUSES.map(
            (orderStatus) => (
              <option
                key={orderStatus}
                value={orderStatus}
              >
                {formatStatus(orderStatus)}
              </option>
            )
          )}
        </select>
      </div>

      {/* Payment Status */}
      <div>
        <label
          htmlFor="payment-status"
          className="block text-sm font-semibold text-steel-700"
        >
          Payment Status
        </label>

        <select
          id="payment-status"
          value={paymentStatus}
          disabled={isPending}
          onChange={(event) =>
            handlePaymentChange(
              event.target.value
            )
          }
          className="mt-2 w-full rounded-xl border border-steel-300 bg-white px-4 py-3 text-sm text-steel-900 outline-none transition focus:border-signal-500 focus:ring-2 focus:ring-signal-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {PAYMENT_STATUSES.map(
            (paymentStatusOption) => (
              <option
                key={paymentStatusOption}
                value={paymentStatusOption}
              >
                {formatStatus(
                  paymentStatusOption
                )}
              </option>
            )
          )}
        </select>
      </div>

      {/* Loading */}
      {isPending && (
        <p className="text-sm text-steel-500">
          Updating...
        </p>
      )}

      {/* Message */}
      {message && (
        <p className="rounded-lg bg-steel-50 px-3 py-2 text-sm text-steel-700">
          {message}
        </p>
      )}

    </div>
  );
}