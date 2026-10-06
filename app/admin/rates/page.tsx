import { createClient } from "@/lib/supabase/server";
import {
  addMaterialRate,
  updateMaterialRate,
  deleteMaterialRate,
} from "./actions";

export const metadata = {
  title: "Material Rates",
};

const units = [
  "sqft",
  "kg",
  "meter",
  "running ft",
  "piece",
  "hour",
  "day",
  "liter",
];

const categories = [
  "material",
  "product",
  "service",
  "finishing",
  "labour",
  "other",
];

export default async function AdminRatesPage() {
  const supabase = await createClient();

  const { data: rates, error } = await supabase
    .from("material_rates")
    .select("id, name, category, rate, unit, updated_at")
    .order("category")
    .order("name");

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h1 className="font-semibold text-red-800">
          Could not load material rates
        </h1>

        <p className="mt-2 text-sm text-red-600">
          {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">
          Material Rates
        </h1>

        <p className="mt-1 text-sm text-steel-500">
          Manage materials, products, services, rates and pricing units.
        </p>
      </div>

      {/* Add New Item */}
      <section className="rounded-lg border border-steel-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-navy-900">
          Add New Item
        </h2>

        <p className="mt-1 text-sm text-steel-500">
          Add a new material, product, service or labour rate.
        </p>

        <form
          action={addMaterialRate}
          className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-5"
        >
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-900">
              Item Name
            </label>

            <input
              name="name"
              type="text"
              placeholder="e.g. MS Pipe"
              required
              className="w-full rounded-md border border-steel-300 px-3 py-2"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-900">
              Category
            </label>

            <select
              name="category"
              defaultValue="material"
              required
              className="w-full rounded-md border border-steel-300 px-3 py-2"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Rate */}
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-900">
              Rate
            </label>

            <div className="flex">
              <span className="flex items-center rounded-l-md border border-r-0 border-steel-300 bg-steel-50 px-3">
                ₹
              </span>

              <input
                name="rate"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                required
                className="w-full rounded-r-md border border-steel-300 px-3 py-2"
              />
            </div>
          </div>

          {/* Unit */}
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-900">
              Unit
            </label>

            <select
              name="unit"
              defaultValue="sqft"
              required
              className="w-full rounded-md border border-steel-300 px-3 py-2"
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          {/* Add */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-md bg-signal-500 px-4 py-2 font-semibold text-white hover:bg-signal-600"
            >
              + Add Item
            </button>
          </div>
        </form>
      </section>

      {/* Existing Items */}
      <section className="overflow-hidden rounded-lg border border-steel-200 bg-white">
        <div className="border-b border-steel-200 p-6">
          <h2 className="text-lg font-semibold text-navy-900">
            Existing Items
          </h2>

          <p className="mt-1 text-sm text-steel-500">
            Update or delete existing pricing items.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-steel-200 bg-steel-50">
              <tr>
                <th className="px-5 py-3 font-semibold">Item</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Rate</th>
                <th className="px-5 py-3 font-semibold">Unit</th>
                <th className="px-5 py-3 font-semibold">Updated</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rates?.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-steel-100 last:border-0"
                >
                  {/* Edit Form */}
                  <td colSpan={5} className="p-0">
                    <form
                      action={updateMaterialRate.bind(null, item.id)}
                      className="grid grid-cols-5 items-center"
                    >
                      {/* Name */}
                      <div className="px-5 py-4">
                        <input
                          name="name"
                          type="text"
                          defaultValue={item.name}
                          required
                          className="w-full rounded-md border border-steel-300 px-3 py-2"
                        />
                      </div>

                      {/* Category */}
                      <div className="px-5 py-4">
                        <select
                          name="category"
                          defaultValue={item.category}
                          required
                          className="w-full rounded-md border border-steel-300 px-3 py-2"
                        >
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category.charAt(0).toUpperCase() +
                                category.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Rate */}
                      <div className="px-5 py-4">
                        <div className="flex items-center">
                          <span className="mr-1">₹</span>

                          <input
                            name="rate"
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue={item.rate}
                            required
                            className="w-full rounded-md border border-steel-300 px-3 py-2"
                          />
                        </div>
                      </div>

                      {/* Unit */}
                      <div className="px-5 py-4">
                        <select
                          name="unit"
                          defaultValue={item.unit}
                          required
                          className="w-full rounded-md border border-steel-300 px-3 py-2"
                        >
                          {units.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Updated */}
                      <div className="px-5 py-4 text-steel-500">
                        {new Date(item.updated_at).toLocaleDateString(
                          "en-IN"
                        )}
                      </div>

                      {/* Update Button */}
                      <div className="px-5 py-4">
                        <button
                          type="submit"
                          className="rounded-md bg-signal-500 px-4 py-2 font-semibold text-white hover:bg-signal-600"
                        >
                          Update
                        </button>
                      </div>
                    </form>
                  </td>

                  {/* Delete */}
                  <td className="px-5 py-4">
                    <form
                      action={deleteMaterialRate.bind(null, item.id)}
                    >
                      <button
                        type="submit"
                        className="rounded-md border border-red-300 px-4 py-2 font-semibold text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {(!rates || rates.length === 0) && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-steel-500"
                  >
                    No pricing items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}