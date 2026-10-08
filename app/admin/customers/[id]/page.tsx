import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  FileText,
  CheckCircle2,
  Clock3,
  ShoppingCart,
  IndianRupee,
  Factory,
  CreditCard,
  CircleDot,
} from "lucide-react";
import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import CustomerEditForm from "./CustomerEditForm";
import ConvertQuoteToOrder from "./ConvertQuoteToOrder";

export const metadata: Metadata = {
  title: "Customer Details",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

type Props = {
  params: {
    id: string;
  };
};

type Activity = {
  id: string;
  activity_type: string;
  title: string;
  description: string | null;
  created_at: string;
  quote_id: string | null;
  order_id: string | null;
  production_job_id: string | null;
};

export default async function CustomerDetailPage({
  params,
}: Props) {
  const supabase = createClient();

  const customerId = params?.id;

  if (!customerId) {
    return (
      <div className="p-6">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 text-sm text-steel-600 hover:text-navy-900"
        >
          <ArrowLeft size={16} />
          Back to Customers
        </Link>

        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6">
          <h1 className="text-xl font-bold text-red-700">
            Customer ID missing
          </h1>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // CUSTOMER
  // --------------------------------------------------

  const {
    data: customer,
    error: customerError,
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
      notes,
      created_at,
      updated_at
    `)
    .eq("id", customerId)
    .maybeSingle();

  if (customerError || !customer) {
    console.error("Customer detail error:", customerError);

    return (
      <div className="p-6">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 text-sm text-steel-600 hover:text-navy-900"
        >
          <ArrowLeft size={16} />
          Back to Customers
        </Link>

        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-8">
          <h1 className="text-2xl font-bold text-red-700">
            Customer not found
          </h1>

          <p className="mt-2 text-sm text-red-600">
            This customer does not exist or could not be loaded.
          </p>

          <p className="mt-4 break-all text-xs text-red-500">
            Customer ID: {customerId}
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // QUOTES
  // --------------------------------------------------

  const {
    data: quotesData,
    error: quotesError,
  } = await supabase
    .from("quotes")
    .select(`
      id,
      quote_number,
      service_type,
      product_or_project,
      material,
      estimated_price,
      status,
      created_at
    `)
    .eq("customer_id", customer.id)
    .order("created_at", {
      ascending: false,
    });

  if (quotesError) {
    console.error("Customer quotes error:", quotesError);
  }

  const quotes = quotesData ?? [];

  // --------------------------------------------------
  // ORDERS
  // --------------------------------------------------

  const {
    data: ordersData,
    error: ordersError,
  } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      quote_id,
      status,
      payment_status,
      total,
      notes,
      created_at,
      updated_at
    `)
    .eq("customer_id", customer.id)
    .order("created_at", {
      ascending: false,
    });

  if (ordersError) {
    console.error("Customer orders error:", ordersError);
  }

  const orders = ordersData ?? [];

  // --------------------------------------------------
  // ACTIVITIES
  // --------------------------------------------------

  const {
    data: activitiesData,
    error: activitiesError,
  } = await supabase
    .from("customer_activities")
    .select(`
      id,
      activity_type,
      title,
      description,
      created_at,
      quote_id,
      order_id,
      production_job_id
    `)
    .eq("customer_id", customer.id)
    .order("created_at", {
      ascending: false,
    });

  if (activitiesError) {
    console.error(
      "Customer activities error:",
      activitiesError
    );
  }

  const activities: Activity[] = activitiesData ?? [];

  // --------------------------------------------------
  // STATISTICS
  // --------------------------------------------------

  const totalQuotes = quotes.length;

  const approvedQuotes = quotes.filter(
    (quote) => quote.status === "approved"
  ).length;

  const completedQuotes = quotes.filter(
    (quote) => quote.status === "completed"
  ).length;

  const pendingQuotes = quotes.filter((quote) =>
    ["new", "reviewing", "quoted"].includes(
      quote.status
    )
  ).length;

  const totalBusinessValue = quotes
    .filter((quote) =>
      ["approved", "completed"].includes(
        quote.status
      )
    )
    .reduce(
      (total, quote) =>
        total + Number(
          quote.estimated_price || 0
        ),
      0
    );

  const totalOrders = orders.length;

  const completedOrders = orders.filter(
    (order) =>
      order.status === "delivered"
  ).length;

  const activeOrders = orders.filter(
    (order) =>
      [
        "pending",
        "confirmed",
        "in_production",
        "ready",
      ].includes(order.status)
  ).length;

  const totalOrderValue = orders.reduce(
    (total, order) =>
      total + Number(order.total || 0),
    0
  );

  const paidOrders = orders.filter(
    (order) =>
      order.payment_status === "paid"
  );

  const paidAmount = paidOrders.reduce(
    (total, order) =>
      total + Number(order.total || 0),
    0
  );

  const pendingPayment = orders
    .filter(
      (order) =>
        ["pending", "partially_paid"].includes(
          order.payment_status
        )
    )
    .reduce(
      (total, order) =>
        total + Number(order.total || 0),
      0
    );

  // --------------------------------------------------
  // TIMELINE FALLBACK
  // --------------------------------------------------
  // If activities are not yet being created automatically,
  // show existing customer events as a useful timeline.

  const timelineActivities: Activity[] = [
    ...activities,
    ...quotes.map((quote) => ({
      id: `quote-${quote.id}`,
      activity_type: "quote",
      title: `Quote ${quote.quote_number || "created"}`,
      description:
        quote.product_or_project ||
        quote.service_type ||
        "Quote request created",
      created_at: quote.created_at,
      quote_id: quote.id,
      order_id: null,
      production_job_id: null,
    })),
    ...orders.map((order) => ({
      id: `order-${order.id}`,
      activity_type: "order",
      title: `Order ${order.order_number}`,
      description:
        `Order status: ${String(
          order.status || "pending"
        ).replaceAll("_", " ")}`,
      created_at: order.created_at,
      quote_id: order.quote_id,
      order_id: order.id,
      production_job_id: null,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
    .slice(0, 20);

  // --------------------------------------------------
  // ACTIVITY ICON
  // --------------------------------------------------

  function getActivityIcon(
    activityType: string
  ) {
    switch (activityType) {
      case "quote":
        return (
          <FileText
            size={17}
            className="text-orange-600"
          />
        );

      case "order":
        return (
          <ShoppingCart
            size={17}
            className="text-blue-600"
          />
        );

      case "production":
        return (
          <Factory
            size={17}
            className="text-purple-600"
          />
        );

      case "payment":
        return (
          <CreditCard
            size={17}
            className="text-green-600"
          />
        );

      case "completed":
        return (
          <CheckCircle2
            size={17}
            className="text-green-600"
          />
        );

      default:
        return (
          <CircleDot
            size={17}
            className="text-steel-500"
          />
        );
    }
  }

  return (
    <div className="space-y-6">

      {/* BACK */}

      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-2 text-sm font-medium text-steel-600 hover:text-navy-900"
      >
        <ArrowLeft size={16} />
        Back to Customers
      </Link>

      {/* HEADER */}

      <div className="rounded-xl border border-steel-100 bg-white p-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
              Customer Profile
            </p>

            <h1 className="mt-2 text-3xl font-bold text-navy-900">
              {customer.name}
            </h1>

            <p className="mt-2 text-sm text-steel-500">
              Customer since{" "}
              {new Date(
                customer.created_at
              ).toLocaleDateString("en-IN")}
            </p>
          </div>

          {/* CUSTOMER ACTIONS */}

          <div className="flex flex-wrap items-start gap-3">
            <CustomerEditForm
              customer={{
                id: customer.id,
                name: customer.name,
                phone: customer.phone,
                whatsapp: customer.whatsapp,
                email: customer.email,
                city: customer.city,
                address: customer.address,
                notes: customer.notes,
              }}
            />

            {customer.phone && (
              <a
                href={`tel:${customer.phone}`}
                className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
              >
                <Phone size={16} />
                Call
              </a>
            )}

            {customer.whatsapp && (
              <a
                href={`https://wa.me/${customer.whatsapp.replace(
                  /\D/g,
                  ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            )}

            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                className="inline-flex items-center gap-2 rounded-lg border border-steel-200 bg-white px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-steel-50"
              >
                <Mail size={16} />
                Email
              </a>
            )}
          </div>
        </div>
      </div>

      {/* CUSTOMER INFORMATION */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* CONTACT */}

        <div className="rounded-xl border border-steel-100 bg-white p-6">
          <h2 className="text-lg font-bold text-navy-900">
            Contact Information
          </h2>

          <div className="mt-5 space-y-4">

            <div className="flex items-center gap-3">
              <Phone
                size={18}
                className="text-orange-500"
              />

              <div>
                <p className="text-xs text-steel-500">
                  Phone
                </p>

                <p className="font-medium text-navy-900">
                  {customer.phone ||
                    "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MessageCircle
                size={18}
                className="text-green-500"
              />

              <div>
                <p className="text-xs text-steel-500">
                  WhatsApp
                </p>

                <p className="font-medium text-navy-900">
                  {customer.whatsapp ||
                    "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail
                size={18}
                className="text-orange-500"
              />

              <div>
                <p className="text-xs text-steel-500">
                  Email
                </p>

                <p className="font-medium text-navy-900">
                  {customer.email ||
                    "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin
                size={18}
                className="text-orange-500"
              />

              <div>
                <p className="text-xs text-steel-500">
                  Location
                </p>

                <p className="font-medium text-navy-900">
                  {customer.city ||
                    "Not provided"}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-2 gap-4">

          <div className="rounded-xl border border-steel-100 bg-white p-5">
            <FileText
              className="text-orange-500"
              size={22}
            />

            <p className="mt-3 text-sm text-steel-500">
              Total Quotes
            </p>

            <p className="text-2xl font-bold text-navy-900">
              {totalQuotes}
            </p>
          </div>

          <div className="rounded-xl border border-steel-100 bg-white p-5">
            <ShoppingCart
              className="text-blue-500"
              size={22}
            />

            <p className="mt-3 text-sm text-steel-500">
              Total Orders
            </p>

            <p className="text-2xl font-bold text-navy-900">
              {totalOrders}
            </p>
          </div>

          <div className="rounded-xl border border-steel-100 bg-white p-5">
            <Clock3
              className="text-blue-500"
              size={22}
            />

            <p className="mt-3 text-sm text-steel-500">
              Active Orders
            </p>

            <p className="text-2xl font-bold text-navy-900">
              {activeOrders}
            </p>
          </div>

          <div className="rounded-xl border border-steel-100 bg-white p-5">
            <CheckCircle2
              className="text-green-500"
              size={22}
            />

            <p className="mt-3 text-sm text-steel-500">
              Completed Orders
            </p>

            <p className="text-2xl font-bold text-navy-900">
              {completedOrders}
            </p>
          </div>

        </div>
      </div>

      {/* BUSINESS SUMMARY */}

      <div className="grid gap-4 md:grid-cols-3">

        <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-sm font-medium text-orange-700">
            Quote Business Value
          </p>

          <p className="mt-1 text-2xl font-bold text-navy-900">
            ₹
            {totalBusinessValue.toLocaleString(
              "en-IN"
            )}
          </p>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <p className="text-sm font-medium text-green-700">
            Order Value
          </p>

          <p className="mt-1 text-2xl font-bold text-navy-900">
            ₹
            {totalOrderValue.toLocaleString(
              "en-IN"
            )}
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-medium text-red-700">
            Pending Payment
          </p>

          <p className="mt-1 text-2xl font-bold text-navy-900">
            ₹
            {pendingPayment.toLocaleString(
              "en-IN"
            )}
          </p>

          <p className="mt-1 text-xs text-red-600">
            Paid: ₹
            {paidAmount.toLocaleString(
              "en-IN"
            )}
          </p>
        </div>

      </div>

      {/* ACTIVITY TIMELINE */}

      <div className="rounded-xl border border-steel-100 bg-white">

        <div className="border-b border-steel-100 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-navy-900">
                Customer Activity
              </h2>

              <p className="mt-1 text-sm text-steel-500">
                Complete customer activity timeline.
              </p>
            </div>

            <span className="rounded-full bg-steel-100 px-3 py-1 text-xs font-semibold text-steel-700">
              {timelineActivities.length} activities
            </span>
          </div>
        </div>

        {timelineActivities.length === 0 ? (
          <div className="p-10 text-center">
            <Clock3
              size={40}
              className="mx-auto text-steel-300"
            />

            <p className="mt-3 font-medium text-navy-900">
              No activity yet
            </p>

            <p className="mt-1 text-sm text-steel-500">
              Customer activity will appear here.
            </p>
          </div>
        ) : (
          <div className="p-6">

            <div className="relative space-y-0">

              {timelineActivities.map(
                (activity, index) => (
                  <div
                    key={activity.id}
                    className="relative flex gap-4 pb-7 last:pb-0"
                  >

                    {/* LINE */}

                    {index !==
                      timelineActivities.length - 1 && (
                      <div className="absolute left-[17px] top-9 h-full w-px bg-steel-200" />
                    )}

                    {/* ICON */}

                    <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-steel-200 bg-white">
                      {getActivityIcon(
                        activity.activity_type
                      )}
                    </div>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1 rounded-lg border border-steel-100 bg-steel-50 p-4">

                      <div className="flex flex-col justify-between gap-2 sm:flex-row">

                        <div>
                          <p className="font-semibold text-navy-900">
                            {activity.title}
                          </p>

                          {activity.description && (
                            <p className="mt-1 text-sm text-steel-600">
                              {activity.description}
                            </p>
                          )}
                        </div>

                        <span className="shrink-0 text-xs text-steel-500">
                          {new Date(
                            activity.created_at
                          ).toLocaleString(
                            "en-IN",
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }
                          )}
                        </span>

                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">

                        {activity.quote_id && (
                          <Link
                            href={`/admin/quotes/${activity.quote_id}`}
                            className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                          >
                            View Quote →
                          </Link>
                        )}

                        {activity.order_id && (
                          <Link
                            href={`/admin/orders/${activity.order_id}`}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            View Order →
                          </Link>
                        )}

                        {activity.production_job_id && (
                          <Link
                            href={`/admin/production/${activity.production_job_id}`}
                            className="text-xs font-semibold text-purple-600 hover:text-purple-700"
                          >
                            View Production →
                          </Link>
                        )}

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>

          </div>
        )}

      </div>

      {/* ADDRESS */}

      {(customer.address ||
        customer.city) && (
        <div className="rounded-xl border border-steel-100 bg-white p-6">
          <h2 className="text-lg font-bold text-navy-900">
            Address
          </h2>

          <p className="mt-3 text-sm leading-6 text-steel-600">
            {customer.address || ""}
            {customer.address &&
            customer.city
              ? ", "
              : ""}
            {customer.city || ""}
          </p>
        </div>
      )}

      {/* ORDER HISTORY */}

      <div className="overflow-hidden rounded-xl border border-steel-100 bg-white">

        <div className="border-b border-steel-100 p-6">
          <h2 className="text-lg font-bold text-navy-900">
            Order History
          </h2>

          <p className="mt-1 text-sm text-steel-500">
            Orders associated with this customer.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="p-10 text-center">
            <ShoppingCart
              size={40}
              className="mx-auto text-steel-300"
            />

            <p className="mt-3 font-medium text-navy-900">
              No orders found
            </p>

            <p className="mt-1 text-sm text-steel-500">
              Orders created for this customer
              will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="border-b border-steel-100 bg-steel-50">
                <tr>
                  <th className="px-5 py-3">
                    Order
                  </th>

                  <th className="px-5 py-3">
                    Status
                  </th>

                  <th className="px-5 py-3">
                    Payment
                  </th>

                  <th className="px-5 py-3">
                    Amount
                  </th>

                  <th className="px-5 py-3">
                    Date
                  </th>

                  <th className="px-5 py-3">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-steel-100">

                {orders.map((order) => (
                  <tr key={order.id}>

                    <td className="px-5 py-4 font-medium text-navy-900">
                      {order.order_number}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                        {String(
                          order.status || "pending"
                        ).replaceAll(
                          "_",
                          " "
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          order.payment_status ===
                          "paid"
                            ? "bg-green-50 text-green-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {String(
                          order.payment_status ||
                            "pending"
                        ).replaceAll(
                          "_",
                          " "
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-medium text-navy-900">
                      {order.total !== null &&
                      order.total !== undefined
                        ? `₹${Number(
                            order.total
                          ).toLocaleString(
                            "en-IN"
                          )}`
                        : "—"}
                    </td>

                    <td className="px-5 py-4 text-steel-600">
                      {new Date(
                        order.created_at
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-orange-600 hover:text-orange-700"
                      >
                        View Order
                      </Link>
                    </td>

                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* QUOTE HISTORY */}

      <div className="overflow-hidden rounded-xl border border-steel-100 bg-white">

        <div className="border-b border-steel-100 p-6">
          <h2 className="text-lg font-bold text-navy-900">
            Quote History
          </h2>

          <p className="mt-1 text-sm text-steel-500">
            Quotes associated with this customer.
          </p>
        </div>

        {quotes.length === 0 ? (
          <div className="p-10 text-center">
            <FileText
              size={40}
              className="mx-auto text-steel-300"
            />

            <p className="mt-3 font-medium text-navy-900">
              No quotes found
            </p>

            <p className="mt-1 text-sm text-steel-500">
              This customer does not have any
              linked quote requests yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="border-b border-steel-100 bg-steel-50">
                <tr>
                  <th className="px-5 py-3">
                    Quote
                  </th>

                  <th className="px-5 py-3">
                    Project
                  </th>

                  <th className="px-5 py-3">
                    Material
                  </th>

                  <th className="px-5 py-3">
                    Status
                  </th>

                  <th className="px-5 py-3">
                    Amount
                  </th>

                  <th className="px-5 py-3">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-steel-100">

                {quotes.map((quote) => (
                  <tr key={quote.id}>

                    <td className="px-5 py-4 font-medium text-navy-900">
                      {quote.quote_number || "—"}
                    </td>

                    <td className="px-5 py-4 text-steel-600">
                      {quote.product_or_project ||
                        "—"}
                    </td>

                    <td className="px-5 py-4 text-steel-600">
                      {quote.material || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-steel-100 px-3 py-1 text-xs font-semibold capitalize text-steel-700">
                        {quote.status || "new"}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-medium text-navy-900">
                      {quote.estimated_price !==
                        null &&
                      quote.estimated_price !==
                        undefined
                        ? `₹${Number(
                            quote.estimated_price
                          ).toLocaleString(
                            "en-IN"
                          )}`
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col items-start gap-2">

                        <Link
                          href={`/admin/quotes/${quote.id}`}
                          className="font-semibold text-orange-600 hover:text-orange-700"
                        >
                          View Quote
                        </Link>

                        {quote.status ===
                          "approved" && (
                          <ConvertQuoteToOrder
                            quoteId={quote.id}
                            quoteNumber={
                              quote.quote_number
                            }
                            customerId={
                              customer.id
                            }
                            status={
                              quote.status
                            }
                          />
                        )}

                      </div>
                    </td>

                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* NOTES */}

      {customer.notes && (
        <div className="rounded-xl border border-steel-100 bg-white p-6">
          <h2 className="text-lg font-bold text-navy-900">
            Customer Notes
          </h2>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-steel-600">
            {customer.notes}
          </p>
        </div>
      )}

    </div>
  );
}