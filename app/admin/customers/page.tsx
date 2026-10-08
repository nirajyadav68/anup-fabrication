import Link from "next/link";

import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  FileText,
  ShoppingCart,
  IndianRupee,
  Clock3,
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

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
};

type Quote = {
  id: string;
  customer_id: string | null;
  estimated_price: number | null;
  status: string;
};

type Order = {
  id: string;
  customer_id: string | null;
  status: string;
  payment_status: string;
  total: number | null;
};

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function getCustomerOrders(
  orders: Order[],
  customerId: string
) {
  return orders.filter(
    (order) => order.customer_id === customerId
  );
}

function getCustomerQuotes(
  quotes: Quote[],
  customerId: string
) {
  return quotes.filter(
    (quote) => quote.customer_id === customerId
  );
}

export default async function AdminCustomersPage() {
  const supabase = createClient();

  // =====================================================
  // CUSTOMERS
  // =====================================================

  const {
    data: customers,
    error: customersError,
  } = await supabase
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

  // =====================================================
  // QUOTES
  // =====================================================

  const {
    data: quotes,
    error: quotesError,
  } = await supabase
    .from("quotes")
    .select(`
      id,
      customer_id,
      estimated_price,
      status
    `);

  // =====================================================
  // ORDERS
  // =====================================================

  const {
    data: orders,
    error: ordersError,
  } = await supabase
    .from("orders")
    .select(`
      id,
      customer_id,
      status,
      payment_status,
      total
    `);

  const customerList: Customer[] = customers ?? [];
  const quoteList: Quote[] = quotes ?? [];
  const orderList: Order[] = orders ?? [];

  const error =
    customersError ||
    quotesError ||
    ordersError;

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalCustomers = customerList.length;

  const customersWithPhone =
    customerList.filter(
      (customer) => Boolean(customer.phone)
    ).length;

  const customersWithEmail =
    customerList.filter(
      (customer) => Boolean(customer.email)
    ).length;

  const totalQuotes = quoteList.length;

  const totalOrders = orderList.length;

  const totalBusinessValue = orderList.reduce(
    (total, order) =>
      total + Number(order.total || 0),
    0
  );

  const pendingPayment = orderList
    .filter(
      (order) =>
        order.payment_status === "pending" ||
        order.payment_status === "partially_paid"
    )
    .reduce(
      (total, order) =>
        total + Number(order.total || 0),
      0
    );

  // =====================================================
  // CUSTOMER ACTIVITY
  // =====================================================

  const activeCustomerIds = new Set<string>();

  quoteList.forEach((quote) => {
    if (
      quote.customer_id &&
      ["new", "reviewing", "quoted", "approved"].includes(
        quote.status
      )
    ) {
      activeCustomerIds.add(quote.customer_id);
    }
  });

  orderList.forEach((order) => {
    if (
      order.customer_id &&
      !["cancelled", "delivered"].includes(order.status)
    ) {
      activeCustomerIds.add(order.customer_id);
    }
  });

  const activeCustomers = activeCustomerIds.size;

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-600">
            Customer Management
          </p>

          <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">
            Customers
          </h1>

          <p className="mt-1 text-sm text-steel-500">
            Manage customers, quotes, orders and business
            activity from one place.
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-signal-50">
          <Users className="h-6 w-6 text-signal-600" />
        </div>
      </div>

      {/* =================================================
          KPI CARDS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* TOTAL CUSTOMERS */}

        <div className="rounded-xl border border-steel-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-steel-500">
              Total Customers
            </p>

            <Users className="h-5 w-5 text-signal-600" />
          </div>

          <p className="mt-2 text-3xl font-bold text-navy-900">
            {totalCustomers}
          </p>

          <p className="mt-1 text-xs text-steel-400">
            {activeCustomers} active
          </p>
        </div>

        {/* TOTAL QUOTES */}

        <div className="rounded-xl border border-steel-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-steel-500">
              Total Quotes
            </p>

            <FileText className="h-5 w-5 text-blue-600" />
          </div>

          <p className="mt-2 text-3xl font-bold text-navy-900">
            {totalQuotes}
          </p>

          <p className="mt-1 text-xs text-steel-400">
            Customer quote requests
          </p>
        </div>

        {/* TOTAL ORDERS */}

        <div className="rounded-xl border border-steel-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-steel-500">
              Total Orders
            </p>

            <ShoppingCart className="h-5 w-5 text-purple-600" />
          </div>

          <p className="mt-2 text-3xl font-bold text-navy-900">
            {totalOrders}
          </p>

          <p className="mt-1 text-xs text-steel-400">
            Converted customer orders
          </p>
        </div>

        {/* BUSINESS VALUE */}

        <div className="rounded-xl border border-steel-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-steel-500">
              Business Value
            </p>

            <IndianRupee className="h-5 w-5 text-emerald-600" />
          </div>

          <p className="mt-2 text-2xl font-bold text-navy-900">
            {formatCurrency(totalBusinessValue)}
          </p>

          <p className="mt-1 text-xs text-steel-400">
            From customer orders
          </p>
        </div>
      </div>

      {/* =================================================
          SECONDARY STATS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* PHONE */}

        <div className="rounded-xl border border-steel-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Phone className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-steel-400">
                Contactable
              </p>

              <p className="text-xl font-bold text-navy-900">
                {customersWithPhone}
              </p>

              <p className="text-xs text-steel-500">
                Customers with phone
              </p>
            </div>
          </div>
        </div>

        {/* EMAIL */}

        <div className="rounded-xl border border-steel-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
              <Mail className="h-5 w-5 text-purple-600" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-steel-400">
                Email Reach
              </p>

              <p className="text-xl font-bold text-navy-900">
                {customersWithEmail}
              </p>

              <p className="text-xs text-steel-500">
                Customers with email
              </p>
            </div>
          </div>
        </div>

        {/* PAYMENT */}

        <div className="rounded-xl border border-steel-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <Clock3 className="h-5 w-5 text-amber-600" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-steel-400">
                Pending Payment
              </p>

              <p className="text-xl font-bold text-navy-900">
                {formatCurrency(pendingPayment)}
              </p>

              <p className="text-xs text-steel-500">
                Pending / partially paid orders
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          DIRECTORY
      ================================================= */}

      <div className="overflow-hidden rounded-xl border border-steel-100 bg-white">

        {/* DIRECTORY HEADER */}

        <div className="border-b border-steel-100 px-5 py-4">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-steel-400" />

              <div>
                <h2 className="font-semibold text-navy-900">
                  Customer Directory
                </h2>

                <p className="text-xs text-steel-400">
                  {customerList.length} customer
                  {customerList.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="rounded-md bg-steel-50 px-3 py-2 text-xs text-steel-500">
              Customer CRM
            </div>
          </div>
        </div>

        {/* ERROR */}

        {error ? (
          <div className="p-6">
            <p className="rounded-md bg-red-50 p-4 text-sm text-red-700">
              Could not load customer data:{" "}
              {error.message}
            </p>
          </div>
        ) : customerList.length === 0 ? (

          /* EMPTY STATE */

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

          /* CUSTOMER TABLE */

          <div className="overflow-x-auto">

            <table className="min-w-[1200px] w-full">

              <thead>
                <tr className="border-b border-steel-100 bg-steel-50 text-left">

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-steel-500">
                    Customer
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-steel-500">
                    Contact
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-steel-500">
                    Activity
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-steel-500">
                    Orders
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-steel-500">
                    Business Value
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-steel-500">
                    Location
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-steel-500">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {customerList.map((customer) => {

                  const customerQuotes =
                    getCustomerQuotes(
                      quoteList,
                      customer.id
                    );

                  const customerOrders =
                    getCustomerOrders(
                      orderList,
                      customer.id
                    );

                  const customerValue =
                    customerOrders.reduce(
                      (total, order) =>
                        total +
                        Number(order.total || 0),
                      0
                    );

                  const pendingOrders =
                    customerOrders.filter(
                      (order) =>
                        order.payment_status ===
                          "pending" ||
                        order.payment_status ===
                          "partially_paid"
                    ).length;

                  return (
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
                            WhatsApp:{" "}
                            {customer.whatsapp}
                          </div>
                        )}

                      </td>

                      {/* ACTIVITY */}

                      <td className="px-5 py-4">

                        <div className="flex flex-wrap gap-2">

                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                            <FileText className="h-3 w-3" />
                            {customerQuotes.length}{" "}
                            quote
                            {customerQuotes.length ===
                            1
                              ? ""
                              : "s"}
                          </span>

                          {customerOrders.length >
                            0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                              <ShoppingCart className="h-3 w-3" />
                              {customerOrders.length}{" "}
                              order
                              {customerOrders.length ===
                              1
                                ? ""
                                : "s"}
                            </span>
                          )}

                        </div>

                        {pendingOrders > 0 && (
                          <p className="mt-1 text-xs text-amber-600">
                            {pendingOrders} payment
                            pending
                          </p>
                        )}

                      </td>

                      {/* ORDERS */}

                      <td className="px-5 py-4">

                        {customerOrders.length >
                        0 ? (
                          <div>
                            <p className="text-sm font-semibold text-navy-900">
                              {customerOrders.length}
                            </p>

                            <p className="text-xs text-steel-400">
                              Total orders
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-steel-400">
                            No orders
                          </span>
                        )}

                      </td>

                      {/* BUSINESS VALUE */}

                      <td className="px-5 py-4">

                        {customerValue > 0 ? (
                          <div className="flex items-center gap-1 text-sm font-semibold text-emerald-700">
                            <IndianRupee className="h-3.5 w-3.5" />
                            {customerValue.toLocaleString(
                              "en-IN"
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-steel-400">
                            —
                          </span>
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