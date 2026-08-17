"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { QUOTE_STATUSES } from "@/app/admin/quotes/constants";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 rounded-md bg-signal-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-signal-600 disabled:opacity-70"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      Update Status
    </button>
  );
}

export default function QuoteStatusForm({
  action,
  currentStatus,
}: {
  action: (formData: FormData) => Promise<void>;
  currentStatus: string;
}) {
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-navy-900">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={currentStatus}
          className="mt-1.5 rounded-md border border-steel-300 bg-white px-3.5 py-2.5 text-sm capitalize focus:border-signal-500"
        >
          {QUOTE_STATUSES.map((status) => (
            <option key={status} value={status} className="capitalize">
              {status.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>
      <SubmitButton />
    </form>
  );
}
