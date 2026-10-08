import Link from "next/link";
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Customers",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const supabase = createClient();

  const { data: customers, error } = await supabase
    .from("customers")
    .select(`
      id,
      name,
      phone,
      whatsapp,
      email,
      city,
      address,
      created_at,
      updated_at
    `)
    .order("updated_at", {
      ascending: false,
    });

  const customerList = customers ?? [];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-600">
            Customer Management
          </p>

          <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">
            Customers
          </h1>

          <p className="mt-1 text-sm text-steel-500">
            Customer records created automatically from quote requests.
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-signal-50">
          <Users className="h-6 w-6 text-signal-600" />
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-steel-100 bg-white p-5">
          <p className="text-sm text-steel-500">
            Total Customers
          </p>

          <p className="mt-1 text-3xl font-bold text-navy-900">
            {customerList.length}
          </p>
        </div>

        <div className="rounded-xl border border-steel-100 bg-white p-5">
          <p className="text-sm text-steel-500">
            With Phone
          </p>

          <p className="mt-1 text-3xl font-bold text-navy-900">
            {
              customerList.filter(
                (customer) => Boolean(customer.phone)
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-steel-100 bg-white p-5">
          <p className="text-sm text-steel-500">
            With Email
          </p>

          <p className="mt-1 text-3xl font-bold text-navy-900">
            {
              customerList.filter(
                (customer) => Boolean(customer.email)
              ).length
            }
          </p>
        </div>
      </div>

      {/* CUSTOMER DIRECTORY */}
      <div className="overflow-hidden rounded-xl border border-steel-100 bg-white">
        <div className="border-b border-steel-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-steel-400" />

            <h2 className="font-semibold text-navy-900">
              Customer Directory
            </h2>
          </div>
        </div>

        {error ? (
          <div className="p-6">
            <p className="rounded-md bg-red-50 p-4 text-sm text-red-700">
              Could not load customers: {error.message}
            </p>
          </div>
        ) : customerList.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-steel-300" />

            <h3 className="mt-4 font-semibold text-navy-900">
              No customers yet
            </h3>

            <p className="mt-1 text-sm text-steel-500">
              Customers will automatically appear here when
              they submit a quote.
            </p>

            <Link
              href="/quote"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-signal-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-signal-600"
            >
              View Quote Form
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[950px] w-full">
              <thead>
                <tr className="border-b border-steel-100 bg-steel-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-steel-500">
                    Customer
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-steel-500">
                    Contact
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-steel-500">
                    Location
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-steel-500">
                    Added
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-steel-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {customerList.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-steel-100 last:border-0 hover:bg-steel-50/50"
                  >
                    {/* CUSTOMER */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-navy-900">
                        {customer.name}
                      </div>

                      {customer.email && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-steel-500">
                          <Mail className="h-3.5 w-3.5" />
                          {customer.email}
                        </div>
                      )}
                    </td>

                    {/* CONTACT */}
                    <td className="px-5 py-4">
                      {customer.phone ? (
                        <div className="flex items-center gap-1.5 text-sm text-steel-600">
                          <Phone className="h-4 w-4" />
                          {customer.phone}
                        </div>
                      ) : (
                        <span className="text-sm text-steel-400">
                          No phone
                        </span>
                      )}

                      {customer.whatsapp && (
                        <div className="mt-1 text-xs text-green-600">
                          WhatsApp: {customer.whatsapp}
                        </div>
                      )}
                    </td>

                    {/* LOCATION */}
                    <td className="px-5 py-4">
                      {customer.city ? (
                        <div className="flex items-center gap-1.5 text-sm text-steel-600">
                          <MapPin className="h-4 w-4" />
                          {customer.city}
                        </div>
                      ) : (
                        <span className="text-sm text-steel-400">
                          Not provided
                        </span>
                      )}
                    </td>

                    {/* DATE */}
                    <td className="px-5 py-4 text-sm text-steel-500">
                      {new Date(
                        customer.created_at
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* ACTION */}
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-steel-200 px-3 py-2 text-sm font-medium text-navy-900 hover:bg-steel-50"
                      >
                        View
                        <ArrowRight className="h-4 w-4" />
                      </Link>
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