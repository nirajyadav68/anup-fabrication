import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type InventoryItem = {
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
  is_active: boolean;
};

function getStockStatus(item: InventoryItem) {
  if (item.current_stock <= 0) {
    return {
      label: "Out of Stock",
      className: "bg-red-100 text-red-700",
    };
  }

  if (item.current_stock <= item.minimum_stock) {
    return {
      label: "Low Stock",
      className: "bg-yellow-100 text-yellow-700",
    };
  }

  return {
    label: "In Stock",
    className: "bg-green-100 text-green-700",
  };
}

export default async function InventoryPage() {
  const supabase = createClient();

  const { data: items, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  const inventoryItems = (items ?? []) as InventoryItem[];

  const totalItems = inventoryItems.length;

  const lowStockItems = inventoryItems.filter(
    (item) =>
      item.current_stock > 0 &&
      item.current_stock <= item.minimum_stock
  ).length;

  const outOfStockItems = inventoryItems.filter(
    (item) => item.current_stock <= 0
  ).length;

  const totalInventoryValue = inventoryItems.reduce(
    (total, item) =>
      total +
      Number(item.current_stock) * Number(item.purchase_rate),
    0
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-signal-600">
            Inventory Management
          </p>

          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900">
            Material Inventory
          </h1>

          <p className="mt-1 text-sm text-steel-500">
            Manage fabrication materials, stock levels and inventory value.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/inventory/new"
            className="rounded-md bg-signal-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-signal-600"
          >
            + Add Material
          </Link>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load inventory.
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-steel-200 bg-white p-5">
          <p className="text-sm text-steel-500">Total Materials</p>
          <p className="mt-2 text-2xl font-bold text-navy-900">
            {totalItems}
          </p>
        </div>

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
          <p className="text-sm text-yellow-700">Low Stock</p>
          <p className="mt-2 text-2xl font-bold text-yellow-800">
            {lowStockItems}
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-600">Out of Stock</p>
          <p className="mt-2 text-2xl font-bold text-red-700">
            {outOfStockItems}
          </p>
        </div>

        <div className="rounded-xl border border-steel-200 bg-white p-5">
          <p className="text-sm text-steel-500">Inventory Value</p>
          <p className="mt-2 text-2xl font-bold text-navy-900">
            ₹{totalInventoryValue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* INVENTORY TABLE */}
      <div className="overflow-hidden rounded-xl border border-steel-200 bg-white">
        <div className="border-b border-steel-200 px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-navy-900">
            Materials
          </h2>

          <p className="mt-1 text-sm text-steel-500">
            Current stock and pricing information.
          </p>
        </div>

        {inventoryItems.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="font-medium text-navy-900">
              No inventory items found.
            </p>

            <p className="mt-1 text-sm text-steel-500">
              Add your first fabrication material to start tracking stock.
            </p>

            <Link
              href="/admin/inventory/new"
              className="mt-4 inline-block rounded-md bg-signal-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Add Material
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-steel-50">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-navy-900">
                    Material
                  </th>

                  <th className="px-5 py-3 text-left font-semibold text-navy-900">
                    Category
                  </th>

                  <th className="px-5 py-3 text-right font-semibold text-navy-900">
                    Stock
                  </th>

                  <th className="px-5 py-3 text-right font-semibold text-navy-900">
                    Purchase Rate
                  </th>

                  <th className="px-5 py-3 text-right font-semibold text-navy-900">
                    Selling Rate
                  </th>

                  <th className="px-5 py-3 text-center font-semibold text-navy-900">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right font-semibold text-navy-900">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-steel-100">
                {inventoryItems.map((item) => {
                  const status = getStockStatus(item);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-steel-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-navy-900">
                          {item.name}
                        </div>

                        {item.supplier && (
                          <div className="mt-1 text-xs text-steel-500">
                            Supplier: {item.supplier}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 capitalize text-steel-600">
                        {item.category}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span className="font-semibold text-navy-900">
                          {Number(item.current_stock).toLocaleString(
                            "en-IN"
                          )}
                        </span>

                        <span className="ml-1 text-xs text-steel-500">
                          {item.unit}
                        </span>

                        <div className="text-xs text-steel-400">
                          Min: {item.minimum_stock}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right text-steel-600">
                        ₹
                        {Number(item.purchase_rate).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-5 py-4 text-right text-steel-600">
                        ₹
                        {Number(item.selling_rate).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/inventory/${item.id}`}
                          className="font-semibold text-signal-600 hover:text-signal-700"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}