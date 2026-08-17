import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
}

export default function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-steel-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-steel-500">{label}</p>
        <Icon className="h-5 w-5 text-signal-500" aria-hidden="true" />
      </div>
      <p className="mt-2 font-display text-3xl font-bold text-navy-900">{value}</p>
    </div>
  );
}
