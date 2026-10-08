"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  item: {
    id: string;
    name: string;
    category: string;
    unit: string;
    current_stock: number;
    minimum_stock: number;
    purchase_rate: number;
    selling_rate: number;
    supplier: string | null;
    location: string | null;
    notes: string | null;
    is_active: boolean;
  };
};

const categories = [
  "material",
  "product",
  "hardware",
  "consumable",
  "finishing",
  "other",
];

const units = [
  "kg",
  "piece",
  "meter",
  "running ft",
  "sqft",
  "liter",
  "hour",
  "day",
  "other",
];

export default function EditInventoryForm({ item }: Props) {
  const router = useRouter();

  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [unit, setUnit] = useState(item.unit);
  const [minimumStock, setMinimumStock] = useState(
    String(item.minimum_stock)
  );
  const [purchaseRate, setPurchaseRate] = useState(
    String(item.purchase_rate)
  );
  const [sellingRate, setSellingRate] = useState(
    String(item.selling_rate)
  );
  const [supplier, setSupplier] = useState(
    item.supplier || ""
  );
  const [location, setLocation] = useState(
    item.location || ""
  );
  const [notes, setNotes] = useState(item.notes || "");
  const [isActive, setIsActive] = useState(item.is_active);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    if (!name.trim()) {
      setError("Material name is required.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("inventory_items")
      .update({
        name: name.trim(),
        category,
        unit,
        minimum_stock: Number(minimumStock) || 0,
        purchase_rate: Number(purchaseRate) || 0,
        selling_rate: Number(sellingRate) || 0,
        supplier: supplier.trim() || null,
        location: location.trim() || null,
        notes: notes.trim() || null,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (updateError) {
      console.error(updateError);
      setError(
        updateError.message ||
          "Unable to update material."
      );
      setLoading(false);
      return;
    }

    router.push(`/admin/inventory/${item.id}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-navy-900"
          >
            Material Name *
          </label>

          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-navy-900"
          >
            Category
          </label>

          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-steel-300 bg-white px-3.5 py-2.5 text-sm"
          >
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="unit"
            className="block text-sm font-medium text-navy-900"
          >
            Unit
          </label>

          <select
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-steel-300 bg-white px-3.5 py-2.5 text-sm"
          >
            {units.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="minimumStock"
            className="block text-sm font-medium text-navy-900"
          >
            Minimum Stock
          </label>

          <input
            id="minimumStock"
            type="number"
            min="0"
            step="0.01"
            value={minimumStock}
            onChange={(e) =>
              setMinimumStock(e.target.value)
            }
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="purchaseRate"
            className="block text-sm font-medium text-navy-900"
          >
            Purchase Rate (₹)
          </label>

          <input
            id="purchaseRate"
            type="number"
            min="0"
            step="0.01"
            value={purchaseRate}
            onChange={(e) =>
              setPurchaseRate(e.target.value)
            }
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="sellingRate"
            className="block text-sm font-medium text-navy-900"
          >
            Selling Rate (₹)
          </label>

          <input
            id="sellingRate"
            type="number"
            min="0"
            step="0.01"
            value={sellingRate}
            onChange={(e) =>
              setSellingRate(e.target.value)
            }
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="supplier"
            className="block text-sm font-medium text-navy-900"
          >
            Supplier
          </label>

          <input
            id="supplier"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-navy-900"
          >
            Storage Location
          </label>

          <input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-navy-900"
          >
            Notes
          </label>

          <textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* ACTIVE STATUS */}
      <div className="rounded-lg border border-steel-200 bg-steel-50 p-4">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) =>
              setIsActive(e.target.checked)
            }
            className="h-4 w-4 rounded"
          />

          <span>
            <span className="block text-sm font-semibold text-navy-900">
              Active Material
            </span>

            <span className="block text-xs text-steel-500">
              Inactive materials won't appear in the main inventory list.
            </span>
          </span>
        </label>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-steel-200 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            router.push(`/admin/inventory/${item.id}`)
          }
          className="rounded-md border border-steel-300 px-5 py-2.5 text-sm font-semibold text-navy-900"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-signal-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-signal-600 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}