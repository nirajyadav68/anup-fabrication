import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-50 text-blue-700",
  contacted: "bg-amber-50 text-amber-700",
  quotation_sent: "bg-purple-50 text-purple-700",
  negotiation: "bg-orange-50 text-orange-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  completed: "bg-steel-100 text-steel-700",
  pending: "bg-blue-50 text-blue-700",
  confirmed: "bg-amber-50 text-amber-700",
  in_production: "bg-purple-50 text-purple-700",
  ready: "bg-orange-50 text-orange-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
  paid: "bg-green-50 text-green-700",
  partially_paid: "bg-amber-50 text-amber-700",
  refunded: "bg-steel-100 text-steel-700",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        STATUS_STYLES[status] ?? "bg-steel-100 text-steel-700"
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
