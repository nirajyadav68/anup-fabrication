"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  action: (id: string, next: boolean) => Promise<void>;
  label: string;
}

export default function ToggleSwitch({ id, checked, action, label }: ToggleSwitchProps) {
  const [isChecked, setIsChecked] = useState(checked);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      aria-label={label}
      disabled={isPending}
      onClick={() => {
        const next = !isChecked;
        setIsChecked(next);
        startTransition(async () => {
          await action(id, next);
        });
      }}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-60",
        isChecked ? "bg-signal-500" : "bg-steel-300"
      )}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
          isChecked ? "translate-x-[18px]" : "translate-x-1"
        )}
      />
    </button>
  );
}
