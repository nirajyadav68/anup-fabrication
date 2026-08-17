"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "@/app/admin/orders/constants";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-1.5 rounded-md bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-800 disabled:opacity-70"
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      Update
    </button>
  );
}

export default function OrderStatusForm({
  action,
  status,
  paymentStatus,
}: {
  action: (formData: FormData) => Promise<void>;
  status: string;
  paymentStatus: string;
}) {
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <select
        name="status"
        defaultValue={status}
        className="rounded-md border border-steel-300 bg-white px-2 py-1.5 text-xs capitalize focus:border-signal-500"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s} className="capitalize">
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      <select
        name="paymentStatus"
        defaultValue={paymentStatus}
        className="rounded-md border border-steel-300 bg-white px-2 py-1.5 text-xs capitalize focus:border-signal-500"
      >
        {PAYMENT_STATUSES.map((s) => (
          <option key={s} value={s} className="capitalize">
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      <SubmitButton />
    </form>
  );
}
