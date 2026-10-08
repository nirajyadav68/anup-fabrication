import Link from "next/link";
import CreateInventoryItemForm from "./CreateInventoryItemForm";

export default function NewInventoryItemPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* HEADER */}
      <div>
        <Link
          href="/admin/inventory"
          className="text-sm font-medium text-signal-600 hover:text-signal-700"
        >
          ← Back to Inventory
        </Link>

        <h1 className="mt-3 font-display text-2xl font-bold text-navy-900">
          Add Material
        </h1>

        <p className="mt-1 text-sm text-steel-500">
          Add a fabrication material and its opening stock.
        </p>
      </div>

      {/* FORM */}
      <div className="rounded-xl border border-steel-200 bg-white p-6 shadow-sm">
        <CreateInventoryItemForm />
      </div>
    </div>
  );
}