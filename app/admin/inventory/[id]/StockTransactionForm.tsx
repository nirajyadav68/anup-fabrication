"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  itemId: string;
  unit: string;
  type: "stock_in" | "stock_out";
  defaultRate: number;
  maxQuantity?: number;
};

export default function StockTransactionForm({
  itemId,
  unit,
  type,
  defaultRate,
  maxQuantity,
}: Props) {
  const router = useRouter();

  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState(
    defaultRate ? String(defaultRate) : ""
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isStockIn = type === "stock_in";

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    const amount = Number(quantity);

    if (!amount || amount <= 0) {
      setError("Enter a valid quantity.");
      return;
    }

    if (
      !isStockIn &&
      maxQuantity !== undefined &&
      amount > maxQuantity
    ) {
      setError(
        `Only ${maxQuantity} ${unit} is currently available.`
      );
      return;
    }

    setLoading(true);

    const supabase = createClient();

    // Get current stock.
    const { data: item, error: itemError } =
      await supabase
        .from("inventory_items")
        .select("current_stock")
        .eq("id", itemId)
        .single();

    if (itemError || !item) {
      setError("Unable to read current stock.");
      setLoading(false);
      return;
    }

    const currentStock = Number(item.current_stock);

    const newStock = isStockIn
      ? currentStock + amount
      : currentStock - amount;

    if (newStock < 0) {
      setError("Stock cannot become negative.");
      setLoading(false);
      return;
    }

    // Update inventory.
    const { error: updateError } = await supabase
      .from("inventory_items")
      .update({
        current_stock: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId);

    if (updateError) {
      console.error(updateError);

      setError(
        updateError.message ||
          "Unable to update inventory."
      );

      setLoading(false);
      return;
    }

    // Record transaction.
    const { error: transactionError } =
      await supabase
        .from("inventory_transactions")
        .insert({
          inventory_item_id: itemId,
          transaction_type: type,
          quantity: amount,
          rate: Number(rate) || null,
          reference_type: isStockIn
            ? "purchase"
            : "manual_issue",
          notes: notes.trim() || null,
        });

    if (transactionError) {
      console.error(transactionError);

      setError(
        "Stock updated, but transaction history could not be saved."
      );

      setLoading(false);
      router.refresh();
      return;
    }

    setQuantity("");
    setNotes("");

    router.refresh();
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label
          htmlFor={`${type}-quantity`}
          className="block text-sm font-medium text-navy-900"
        >
          Quantity ({unit})
        </label>

        <input
          id={`${type}-quantity`}
          type="number"
          min="0.01"
          step="0.01"
          value={quantity}
          onChange={(event) =>
            setQuantity(event.target.value)
          }
          placeholder="Enter quantity"
          className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm"
          required
        />

        {!isStockIn &&
          maxQuantity !== undefined && (
            <p className="mt-1 text-xs text-steel-500">
              Available: {maxQuantity} {unit}
            </p>
          )}
      </div>

      <div>
        <label
          htmlFor={`${type}-rate`}
          className="block text-sm font-medium text-navy-900"
        >
          Rate (₹)
        </label>

        <input
          id={`${type}-rate`}
          type="number"
          min="0"
          step="0.01"
          value={rate}
          onChange={(event) =>
            setRate(event.target.value)
          }
          className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm"
        />
      </div>

      <div>
        <label
          htmlFor={`${type}-notes`}
          className="block text-sm font-medium text-navy-900"
        >
          Notes
        </label>

        <textarea
          id={`${type}-notes`}
          rows={3}
          value={notes}
          onChange={(event) =>
            setNotes(event.target.value)
          }
          placeholder={
            isStockIn
              ? "e.g. Purchased from supplier"
              : "e.g. Used for gate fabrication"
          }
          className="mt-1.5 w-full rounded-md border border-steel-300 px-3.5 py-2.5 text-sm"
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full rounded-md px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
          isStockIn
            ? "bg-green-600 hover:bg-green-700"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {loading
          ? "Updating..."
          : isStockIn
            ? "Add Stock"
            : "Remove Stock"}
      </button>
    </form>
  );
}