"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  unit: string;
  current_stock: number;
  purchase_rate: number;
};

type MaterialUsage = {
  id: string;
  inventory_item_id: string;
  quantity: number;
  unit: string;
  rate: number | null;
  notes: string | null;
  created_at: string;
  inventory_items?: {
    name: string;
  }[] | null;
};

type Props = {
  productionJobId: string;
};

export default function ProductionMaterialUsage({
  productionJobId,
}: Props) {
  const supabase = createClient();

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(
    []
  );

  const [usageHistory, setUsageHistory] = useState<MaterialUsage[]>(
    []
  );

  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedItem = inventoryItems.find(
    (item) => item.id === selectedItemId
  );

  async function loadData() {
    setLoading(true);
    setError("");

    const [inventoryResult, usageResult] = await Promise.all([
      supabase
        .from("inventory_items")
        .select(
          "id,name,category,unit,current_stock,purchase_rate"
        )
        .eq("is_active", true)
        .order("name", { ascending: true }),

      supabase
        .from("production_material_usage")
        .select(`
          id,
          inventory_item_id,
          quantity,
          unit,
          rate,
          notes,
          created_at,
          inventory_items (
            name
          )
        `)
        .eq("production_job_id", productionJobId)
        .order("created_at", { ascending: false }),
    ]);

    if (inventoryResult.error) {
      setError(
        inventoryResult.error.message ||
          "Unable to load inventory."
      );
    }

    if (usageResult.error) {
      setError(
        usageResult.error.message ||
          "Unable to load material usage."
      );
    }

    setInventoryItems(
      (inventoryResult.data ?? []) as InventoryItem[]
    );

    setUsageHistory(
      (usageResult.data ?? []) as MaterialUsage[]
    );

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [productionJobId]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedItemId) {
      setError("Please select a material.");
      return;
    }

    const amount = Number(quantity);

    if (!amount || amount <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    if (!selectedItem) {
      setError("Selected material was not found.");
      return;
    }

    if (amount > Number(selectedItem.current_stock)) {
      setError(
        `Insufficient stock. Available stock: ${selectedItem.current_stock} ${selectedItem.unit}.`
      );
      return;
    }

    setSaving(true);

    const { error: rpcError } = await supabase.rpc(
      "record_production_material_usage",
      {
        p_production_job_id: productionJobId,
        p_inventory_item_id: selectedItemId,
        p_quantity: amount,
        p_notes: notes.trim() || null,
      }
    );

    if (rpcError) {
      setError(
        rpcError.message ||
          "Unable to record material usage."
      );

      setSaving(false);
      return;
    }

    setSuccess(
      `${selectedItem.name} (${amount} ${selectedItem.unit}) added successfully.`
    );

    setSelectedItemId("");
    setQuantity("");
    setNotes("");

    await loadData();

    setSaving(false);
  }

  return (
    <section className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-steel-900">
          Materials Used
        </h2>

        <p className="mt-1 text-sm text-steel-500">
          Record materials consumed during production.
          Stock will be automatically deducted.
        </p>
      </div>

      {/* ADD MATERIAL FORM */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-xl border border-steel-200 bg-steel-50 p-5"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* MATERIAL */}
          <div>
            <label
              htmlFor="material"
              className="mb-1.5 block text-sm font-semibold text-steel-900"
            >
              Material
            </label>

            <select
              id="material"
              value={selectedItemId}
              onChange={(event) => {
                setSelectedItemId(event.target.value);
                setError("");
                setSuccess("");
              }}
              disabled={saving || loading}
              className="w-full rounded-md border border-steel-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            >
              <option value="">
                Select material
              </option>

              {inventoryItems.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name} —{" "}
                  {Number(
                    item.current_stock
                  ).toLocaleString("en-IN")}{" "}
                  {item.unit} available
                </option>
              ))}
            </select>

            {selectedItem && (
              <p className="mt-1.5 text-xs text-steel-500">
                Available:{" "}
                <span className="font-semibold">
                  {Number(
                    selectedItem.current_stock
                  ).toLocaleString("en-IN")}{" "}
                  {selectedItem.unit}
                </span>
              </p>
            )}
          </div>

          {/* QUANTITY */}
          <div>
            <label
              htmlFor="quantity"
              className="mb-1.5 block text-sm font-semibold text-steel-900"
            >
              Quantity
            </label>

            <div className="flex">
              <input
                id="quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={quantity}
                onChange={(event) =>
                  setQuantity(event.target.value)
                }
                disabled={saving}
                placeholder="Enter quantity"
                className="min-w-0 flex-1 rounded-l-md border border-steel-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
              />

              <div className="flex min-w-[70px] items-center justify-center rounded-r-md border border-l-0 border-steel-300 bg-steel-100 px-3 text-sm font-medium text-steel-600">
                {selectedItem?.unit || "Unit"}
              </div>
            </div>
          </div>

          {/* RATE */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-steel-900">
              Purchase Rate
            </label>

            <div className="rounded-md border border-steel-300 bg-white px-3 py-2.5 text-sm text-steel-700">
              {selectedItem
                ? `₹${Number(
                    selectedItem.purchase_rate
                  ).toLocaleString("en-IN")} / ${
                    selectedItem.unit
                  }`
                : "Select material first"}
            </div>
          </div>

          {/* NOTES */}
          <div>
            <label
              htmlFor="material-notes"
              className="mb-1.5 block text-sm font-semibold text-steel-900"
            >
              Notes
            </label>

            <input
              id="material-notes"
              type="text"
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              disabled={saving}
              placeholder="Optional notes"
              className="w-full rounded-md border border-steel-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            />
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* SUBMIT */}
        <div className="mt-5">
          <button
            type="submit"
            disabled={saving || loading}
            className="rounded-md bg-signal-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-signal-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Recording..."
              : "Add Material Used"}
          </button>
        </div>
      </form>

      {/* HISTORY */}
      <div className="mt-6">
        <h3 className="text-base font-semibold text-steel-900">
          Material Usage History
        </h3>

        {loading ? (
          <div className="mt-4 rounded-lg border border-steel-200 px-4 py-8 text-center text-sm text-steel-500">
            Loading material usage...
          </div>
        ) : usageHistory.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-steel-300 px-4 py-8 text-center text-sm text-steel-500">
            No materials have been recorded for this
            production job yet.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-steel-200">
            <table className="min-w-full text-sm">
              <thead className="bg-steel-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-steel-900">
                    Material
                  </th>

                  <th className="px-4 py-3 text-right font-semibold text-steel-900">
                    Quantity
                  </th>

                  <th className="px-4 py-3 text-right font-semibold text-steel-900">
                    Rate
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-steel-900">
                    Notes
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-steel-900">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-steel-100">
                {usageHistory.map((usage) => {
                  const materialName =
                    usage.inventory_items?.[0]?.name;

                  return (
                    <tr key={usage.id}>
                      <td className="px-4 py-3 font-medium text-steel-900">
                        {materialName || "Unknown Material"}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold text-steel-900">
                        {Number(
                          usage.quantity
                        ).toLocaleString("en-IN")}{" "}
                        {usage.unit}
                      </td>

                      <td className="px-4 py-3 text-right text-steel-600">
                        {usage.rate !== null
                          ? `₹${Number(
                              usage.rate
                            ).toLocaleString("en-IN")}`
                          : "—"}
                      </td>

                      <td className="px-4 py-3 text-steel-600">
                        {usage.notes || "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-steel-600">
                        {new Date(
                          usage.created_at
                        ).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}