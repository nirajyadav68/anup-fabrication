import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Customers",
  robots: { index: false, follow: false },
};

export default async function AdminCustomersPage() {
  const supabase = createClient();
  const { data: customers, error } = await supabase
    .from("customers")
    .select("id, name, phone, whatsapp, email, city, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-900">Customers</h1>
      <p className="mt-1 text-sm text-steel-500">
        Customer records, created automatically from quote requests and orders.
      </p>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
          Could not load customers: {error.message}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-steel-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-steel-100 bg-steel-50 text-xs uppercase tracking-wide text-steel-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-100">
            {customers?.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium text-navy-900">{c.name}</td>
                <td className="px-4 py-3 text-steel-500">{c.phone}</td>
                <td className="px-4 py-3 text-steel-500">{c.email ?? "—"}</td>
                <td className="px-4 py-3 text-steel-500">{c.city ?? "—"}</td>
                <td className="px-4 py-3 text-steel-500">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {customers?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-steel-500">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
