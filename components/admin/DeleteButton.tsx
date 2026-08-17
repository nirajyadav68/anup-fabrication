"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteButtonProps {
  action: (id: string) => Promise<void>;
  id: string;
  itemLabel: string;
}

export default function DeleteButton({ action, id, itemLabel }: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="text-xs text-steel-500">Delete {itemLabel}?</span>
        <button
          type="button"
          disabled={deleting}
          onClick={async () => {
            setDeleting(true);
            await action(id);
            setDeleting(false);
          }}
          className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-70"
        >
          {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirm"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded border border-steel-300 px-2 py-1 text-xs text-steel-600 hover:bg-steel-50"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={`Delete ${itemLabel}`}
      className="text-steel-500 hover:text-red-600"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
