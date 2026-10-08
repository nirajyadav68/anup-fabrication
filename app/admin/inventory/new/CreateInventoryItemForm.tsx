"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

export default function CreateInventoryItemForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("material");
  const [unit, setUnit] = useState("kg");
  const [currentStock, setCurrentStock] = useState("0");
  const [minimumStock, setMinimumStock] = useState("0");
  const [purchaseRate, setPurchaseRate] = useState("");
  const [sellingRate, setSellingRate] = useState("");
  const [supplier, setSupplier] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

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

    const { data: item, error: itemError } = await supabase
      .from("inventory_items")
      .insert({
        name: name.trim(),
        category,
        unit,
        current_stock: Number(currentStock) || 0,
        minimum_stock: Number(minimumStock) || 0,
        purchase_rate: Number(purchaseRate) || 0,
        selling_rate: Number(sellingRate) || 0,
        supplier: supplier.trim() || null,
        location: location.trim() || null,
        notes: notes.trim() || null,
      })
      .select("id")
      .single();

    if (itemError || !item) {
      console.error(itemError);

      setError(
        itemError?.message ||
          "Unable to create inventory item."
      );

      setLoading(false);
      return;
    }

    // Record opening stock as a transaction.
    const openingStock = Number(currentStock) || 0;

    if (openingStock > 0) {
      const { error: transactionError } = await supabase
        .from("inventory_transactions")
        .insert({
          inventory_item_id: item.id,
          transaction_type: "stock_in",
          quantity: openingStock,
          rate: Number(purchaseRate) || 0,
          reference_type: "opening_stock",
          notes: "Opening stock",
        });

      if (transactionError) {
        console.error(transactionError);

        // Item was created successfully, so don't block the user.
      }
    }

    router.push("/admin/inventory");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* BASIC INFORMATION */}
      <div>
        <h2 className="font-display text-lg font-semibold text-navy-900">
          Basic Information
        </h2>

        <p className="mt-1 text-sm text-steel-500">
          Enter the material details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* NAME */}
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
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="e.g. MS Square Pipe 40x40"
            className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm outline-none focus:border-signal-500"
            required
          />
        </div>

        {/* CATEGORY */}
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
            onChange={(event) =>
              setCategory(event.target.value)
            }
            className="mt-1.5 w-full rounded-md border border-steel-300 bg-white px-3.5 py-2.5 text-sm"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item.charAt(0).toUpperCase() +
                  item.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* UNIT */}
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
            onChange={(event) =>
              setUnit(event.target.value)
            }
            className="mt-1.5 w-full rounded-md border border-steel-300 bg-white px-3.5 py-2.5 text-sm"
          >
            {units.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* STOCK */}
      <div className="border-t border-steel-200 pt-6">
        <h2 className="font-display text-lg font-semibold text-navy-900">
          Stock
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="currentStock"
              className="block text-sm font-medium text-navy-900"
            >
              Opening Stock
            </label>

            <input
              id="currentStock"
              type="number"
              min="0"
              step="0.01"
              value={currentStock}
              onChange={(event) =>
                setCurrentStock(event.target.value)
              }
              className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="minimumStock"
              className="block text-sm font-medium text-navy-900"
            >
              Minimum Stock Alert
            </label>

            <input
              id="minimumStock"
              type="number"
              min="0"
              step="0.01"
              value={minimumStock}
              onChange={(event) =>
                setMinimumStock(event.target.value)
              }
              className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm"
            />

            <p className="mt-1 text-xs text-steel-500">
              Low-stock warning starts at this quantity.
            </p>
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div className="border-t border-steel-200 pt-6">
        <h2 className="font-display text-lg font-semibold text-navy-900">
          Pricing
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
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
              onChange={(event) =>
                setPurchaseRate(event.target.value)
              }
              placeholder="e.g. 85"
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
              onChange={(event) =>
                setSellingRate(event.target.value)
              }
              placeholder="e.g. 110"
              className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>
      </div>

      {/* SUPPLIER */}
      <div className="border-t border-steel-200 pt-6">
        <h2 className="font-display text-lg font-semibold text-navy-900">
          Supplier & Location
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
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
              onChange={(event) =>
                setSupplier(event.target.value)
              }
              placeholder="Supplier name"
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
              onChange={(event) =>
                setLocation(event.target.value)
              }
              placeholder="e.g. Main Workshop"
              className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>
      </div>

      {/* NOTES */}
      <div>
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
          onChange={(event) =>
            setNotes(event.target.value)
          }
          placeholder="Additional material information..."
          className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm"
        />
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex flex-col-reverse gap-3 border-t border-steel-200 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-steel-300 px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-steel-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-signal-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-signal-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Add Material"}
        </button>
      </div>
    </form>
  );
}