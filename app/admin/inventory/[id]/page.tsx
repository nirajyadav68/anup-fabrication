import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import StockTransactionForm from "./StockTransactionForm";

export const dynamic = "force-dynamic";

type Props = {
  params: {
    id: string;
  };
};

export default async function InventoryDetailPage({
  params,
}: Props) {
  const supabase = createClient();

  const { data: item, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !item) {
    notFound();
  }

  const { data: transactions } = await supabase
    .from("inventory_transactions")
    .select("*")
    .eq("inventory_item_id", params.id)
    .order("created_at", { ascending: false });

  const stock = Number(item.current_stock);
  const minimumStock = Number(item.minimum_stock);
  const purchaseRate = Number(item.purchase_rate);
  const sellingRate = Number(item.selling_rate);

  const inventoryValue = stock * purchaseRate;

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= minimumStock;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <Link
          href="/admin/inventory"
          className="text-sm font-medium text-signal-600 hover:text-signal-700"
        >
          ← Back to Inventory
        </Link>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-navy-900">
              {item.name}
            </h1>

            <p className="mt-1 text-sm text-steel-500">
              {item.category} · {item.unit}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/inventory/${item.id}/edit`}
              className="w-fit rounded-md border border-steel-300 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-steel-50"
            >
              Edit Material
            </Link>

            {isOutOfStock ? (
              <span className="w-fit rounded-full bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-700">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="w-fit rounded-full bg-yellow-100 px-3 py-1.5 text-sm font-semibold text-yellow-700">
                Low Stock
              </span>
            ) : (
              <span className="w-fit rounded-full bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-700">
                In Stock
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-steel-200 bg-white p-5">
          <p className="text-sm text-steel-500">Current Stock</p>

          <p className="mt-2 text-3xl font-bold text-navy-900">
            {stock.toLocaleString("en-IN")}
          </p>

          <p className="mt-1 text-xs text-steel-500">{item.unit}</p>
        </div>

        <div className="rounded-xl border border-steel-200 bg-white p-5">
          <p className="text-sm text-steel-500">Minimum Stock</p>

          <p className="mt-2 text-3xl font-bold text-navy-900">
            {minimumStock.toLocaleString("en-IN")}
          </p>

          <p className="mt-1 text-xs text-steel-500">
            Alert threshold
          </p>
        </div>

        <div className="rounded-xl border border-steel-200 bg-white p-5">
          <p className="text-sm text-steel-500">Purchase Rate</p>

          <p className="mt-2 text-3xl font-bold text-navy-900">
            ₹{purchaseRate.toLocaleString("en-IN")}
          </p>

          <p className="mt-1 text-xs text-steel-500">
            Per {item.unit}
          </p>
        </div>

        <div className="rounded-xl border border-steel-200 bg-white p-5">
          <p className="text-sm text-steel-500">Stock Value</p>

          <p className="mt-2 text-3xl font-bold text-navy-900">
            ₹{inventoryValue.toLocaleString("en-IN")}
          </p>

          <p className="mt-1 text-xs text-steel-500">
            At purchase rate
          </p>
        </div>
      </div>

      {/* STOCK ACTIONS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-steel-200 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-navy-900">
            Stock In
          </h2>

          <p className="mt-1 text-sm text-steel-500">
            Add purchased or received material.
          </p>

          <div className="mt-5">
            <StockTransactionForm
              itemId={item.id}
              unit={item.unit}
              type="stock_in"
              defaultRate={purchaseRate}
            />
          </div>
        </div>

        <div className="rounded-xl border border-steel-200 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-navy-900">
            Stock Out
          </h2>

          <p className="mt-1 text-sm text-steel-500">
            Record material used or issued.
          </p>

          <div className="mt-5">
            <StockTransactionForm
              itemId={item.id}
              unit={item.unit}
              type="stock_out"
              defaultRate={sellingRate}
              maxQuantity={stock}
            />
          </div>
        </div>
      </div>

      {/* DETAILS */}
      <div className="rounded-xl border border-steel-200 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-navy-900">
          Material Details
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-steel-500">
              Category
            </p>
            <p className="mt-1 font-medium text-navy-900">
              {item.category}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-steel-500">
              Unit
            </p>
            <p className="mt-1 font-medium text-navy-900">
              {item.unit}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-steel-500">
              Selling Rate
            </p>
            <p className="mt-1 font-medium text-navy-900">
              ₹{sellingRate.toLocaleString("en-IN")}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-steel-500">
              Supplier
            </p>
            <p className="mt-1 font-medium text-navy-900">
              {item.supplier || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-steel-500">
              Storage Location
            </p>
            <p className="mt-1 font-medium text-navy-900">
              {item.location || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-steel-500">
              Notes
            </p>
            <p className="mt-1 font-medium text-navy-900">
              {item.notes || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* TRANSACTION HISTORY */}
      <div className="overflow-hidden rounded-xl border border-steel-200 bg-white">
        <div className="border-b border-steel-200 px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-navy-900">
            Stock Movement History
          </h2>

          <p className="mt-1 text-sm text-steel-500">
            All stock-in and stock-out transactions.
          </p>
        </div>

        {!transactions || transactions.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-steel-500">
            No stock transactions yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-steel-50">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-navy-900">
                    Date
                  </th>

                  <th className="px-5 py-3 text-left font-semibold text-navy-900">
                    Type
                  </th>

                  <th className="px-5 py-3 text-right font-semibold text-navy-900">
                    Quantity
                  </th>

                  <th className="px-5 py-3 text-right font-semibold text-navy-900">
                    Rate
                  </th>

                  <th className="px-5 py-3 text-left font-semibold text-navy-900">
                    Reference
                  </th>

                  <th className="px-5 py-3 text-left font-semibold text-navy-900">
                    Notes
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-steel-100">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-5 py-4 text-steel-600">
                      {new Date(
                        transaction.created_at
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4">
                      {transaction.transaction_type === "stock_in" ? (
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                          Stock In
                        </span>
                      ) : transaction.transaction_type === "stock_out" ? (
                        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                          Stock Out
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700">
                          Adjustment
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right font-semibold text-navy-900">
                      {Number(transaction.quantity).toLocaleString(
                        "en-IN"
                      )}{" "}
                      {item.unit}
                    </td>

                    <td className="px-5 py-4 text-right text-steel-600">
                      {transaction.rate
                        ? `₹${Number(
                            transaction.rate
                          ).toLocaleString("en-IN")}`
                        : "—"}
                    </td>

                    <td className="px-5 py-4 text-steel-600">
                      {transaction.reference_type || "—"}
                    </td>

                    <td className="px-5 py-4 text-steel-600">
                      {transaction.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}