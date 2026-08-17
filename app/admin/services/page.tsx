import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DeleteButton from "@/components/admin/DeleteButton";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import { deleteService, toggleServiceEnabled } from "./actions";

export const metadata: Metadata = {
  title: "Services Management",
  robots: { index: false, follow: false },
};

export default async function AdminServicesPage() {
  const supabase = createClient();
  const { data: services, error } = await supabase
    .from("services")
    .select("id, name, slug, short_description, is_enabled, updated_at")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Services Management</h1>
          <p className="mt-1 text-sm text-steel-500">
            These services appear on the public Services page and homepage.
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className="flex items-center gap-1.5 rounded-md bg-signal-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-signal-600"
        >
          <Plus className="h-4 w-4" />
          Add Service
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
          Could not load services: {error.message}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-steel-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-steel-100 bg-steel-50 text-xs uppercase tracking-wide text-steel-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Enabled</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-100">
            {services?.map((service) => (
              <tr key={service.id}>
                <td className="px-4 py-3 font-medium text-navy-900">{service.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-steel-500">{service.slug}</td>
                <td className="px-4 py-3">
                  <ToggleSwitch
                    id={service.id}
                    checked={service.is_enabled}
                    action={toggleServiceEnabled}
                    label={`Toggle ${service.name} enabled`}
                  />
                </td>
                <td className="px-4 py-3 text-steel-500">
                  {new Date(service.updated_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/services/${service.id}/edit`}
                      className="text-signal-600 hover:text-signal-500"
                    >
                      Edit
                    </Link>
                    <DeleteButton action={deleteService} id={service.id} itemLabel={service.name} />
                  </div>
                </td>
              </tr>
            ))}
            {services?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-steel-500">
                  No services yet — add your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
