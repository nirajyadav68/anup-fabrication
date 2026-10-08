import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import OrderStatusForm from "./OrderStatusForm";
import InvoicePDF from "@/components/admin/InvoicePDF";
import WhatsAppInvoiceButton from "@/components/admin/WhatsAppInvoiceButton";
import PaymentUpdateForm from "@/components/admin/PaymentUpdateForm";

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatCurrency(
  value: number | null | undefined
) {
  if (value === null || value === undefined) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusClasses(status: string) {
  switch (status) {
    case "delivered":
    case "paid":
      return "bg-emerald-100 text-emerald-700";

    case "cancelled":
    case "refunded":
      return "bg-red-100 text-red-700";

    case "in_production":
      return "bg-blue-100 text-blue-700";

    case "ready":
      return "bg-purple-100 text-purple-700";

    case "confirmed":
    case "partially_paid":
      return "bg-amber-100 text-amber-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

type PageProps = {
  params: {
    id: string;
  };
};

export default async function OrderDetailPage({
  params,
}: PageProps) {
  const supabase = createClient();

  const {
    data: order,
    error,
  } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      customer_id,
      quote_id,
      status,
      payment_status,
      paid_amount,
      payment_method,
      payment_notes,
      paid_at,
      total,
      notes,
      created_at,
      updated_at,

      customers (
        id,
        name,
        phone,
        whatsapp,
        email,
        city,
        address
      ),

      quotes (
        id,
        quote_number,
        customer_name,
        service_type,
        product_or_project,
        material,
        approximate_size,
        quantity,
        estimated_price,
        budget,
        description,
        status,
        created_at
      )
    `)
    .eq("id", params.id)
    .single();

  if (error || !order) {
    console.error("Order lookup error:", error);
    notFound();
  }

  const {
    data: items,
    error: itemsError,
  } = await supabase
    .from("order_items")
    .select(`
      id,
      description,
      quantity,
      unit_price,
      total_price,
      created_at
    `)
    .eq("order_id", order.id)
    .order("created_at", {
      ascending: true,
    });

  if (itemsError) {
    console.error(
      "Order items lookup error:",
      itemsError
    );
  }

  const customer = Array.isArray(order.customers)
    ? order.customers[0]
    : order.customers;

  const quote = Array.isArray(order.quotes)
    ? order.quotes[0]
    : order.quotes;

  const orderTotal = Number(order.total ?? 0);
  const paidAmount = Number(
    order.paid_amount ?? 0
  );

  const remainingAmount = Math.max(
    orderTotal - paidAmount,
    0
  );

  return (
    <main className="min-h-screen bg-steel-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-steel-500 hover:text-steel-900"
            >
              ← Back to Orders
            </Link>

            <h1 className="mt-2 text-2xl font-bold text-steel-900">
              {order.order_number}
            </h1>

            <p className="mt-1 text-sm text-steel-500">
              Created {formatDate(order.created_at)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">

            {/* DOWNLOAD INVOICE */}

            <InvoicePDF
              invoice={{
                orderNumber: order.order_number,
                createdAt: order.created_at,

                customerName:
                  customer?.name ?? "Customer",

                phone:
                  customer?.phone ?? null,

                email:
                  customer?.email ?? null,

                city:
                  customer?.city ?? null,

                address:
                  customer?.address ?? null,

                items: (items ?? []).map(
                  (item) => ({
                    id: item.id,
                    description:
                      item.description,
                    quantity:
                      item.quantity,
                    unitPrice:
                      item.unit_price,
                    totalPrice:
                      item.total_price,
                  })
                ),

                total: order.total,

                paymentStatus:
                  order.payment_status,

                status: order.status,

                notes: order.notes,
              }}
            />

            {/* WHATSAPP INVOICE */}

            <WhatsAppInvoiceButton
              phone={
                customer?.phone ?? null
              }
              whatsapp={
                customer?.whatsapp ?? null
              }
              orderNumber={
                order.order_number
              }
              customerName={
                customer?.name ?? "Customer"
              }
              amount={order.total}
            />

            {/* ORDER STATUS */}

            <span
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${statusClasses(
                order.status
              )}`}
            >
              {formatStatus(order.status)}
            </span>

            {/* PAYMENT STATUS */}

            <span
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${statusClasses(
                order.payment_status
              )}`}
            >
              Payment:{" "}
              {formatStatus(
                order.payment_status
              )}
            </span>
          </div>
        </div>

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <section className="grid gap-4 md:grid-cols-4">

          {/* Total */}

          <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-steel-500">
              Order Total
            </p>

            <p className="mt-2 text-2xl font-bold text-steel-900">
              {formatCurrency(order.total)}
            </p>
          </div>

          {/* Paid */}

          <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-steel-500">
              Paid Amount
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {formatCurrency(paidAmount)}
            </p>
          </div>

          {/* Remaining */}

          <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-steel-500">
              Remaining
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-600">
              {formatCurrency(remainingAmount)}
            </p>
          </div>

          {/* Payment Status */}

          <div className="rounded-2xl border border-steel-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-steel-500">
              Payment Status
            </p>

            <p className="mt-2 text-lg font-semibold text-steel-900">
              {formatStatus(
                order.payment_status
              )}
            </p>
          </div>
        </section>

        {/* ==================================================
            PAYMENT MANAGEMENT
        ================================================== */}

        <section className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-steel-900">
              Payment Management
            </h2>

            <p className="mt-1 text-sm text-steel-500">
              Record customer payments and track
              the remaining balance.
            </p>
          </div>

          <PaymentUpdateForm
            orderId={order.id}
            total={orderTotal}
            paidAmount={paidAmount}
            paymentStatus={
              order.payment_status
            }
            paymentMethod={
              order.payment_method
            }
            paymentNotes={
              order.payment_notes
            }
          />
        </section>

        {/* ==================================================
            CUSTOMER + QUOTE
        ================================================== */}

        <section className="grid gap-6 lg:grid-cols-2">

          {/* CUSTOMER */}

          <div className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <h2 className="text-lg font-bold text-steel-900">
                Customer
              </h2>

              {customer?.id && (
                <Link
                  href={`/admin/customers/${customer.id}`}
                  className="text-sm font-semibold text-signal-600 hover:text-signal-700"
                >
                  View Customer
                </Link>
              )}

            </div>

            {customer ? (
              <div className="mt-5 space-y-4">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                    Name
                  </p>

                  <p className="mt-1 font-semibold text-steel-900">
                    {customer.name}
                  </p>
                </div>

                {customer.phone && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                      Phone
                    </p>

                    <p className="mt-1 text-steel-700">
                      {customer.phone}
                    </p>
                  </div>
                )}

                {customer.whatsapp && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                      WhatsApp
                    </p>

                    <p className="mt-1 text-steel-700">
                      {customer.whatsapp}
                    </p>
                  </div>
                )}

                {customer.email && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                      Email
                    </p>

                    <p className="mt-1 break-all text-steel-700">
                      {customer.email}
                    </p>
                  </div>
                )}

                {customer.city && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                      City
                    </p>

                    <p className="mt-1 text-steel-700">
                      {customer.city}
                    </p>
                  </div>
                )}

                {customer.address && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                      Address
                    </p>

                    <p className="mt-1 whitespace-pre-line text-steel-700">
                      {customer.address}
                    </p>
                  </div>
                )}

              </div>
            ) : (
              <p className="mt-5 text-sm text-steel-500">
                Customer information not available.
              </p>
            )}

          </div>

          {/* SOURCE QUOTE */}

          <div className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <h2 className="text-lg font-bold text-steel-900">
                Source Quote
              </h2>

              {quote?.id && (
                <Link
                  href={`/admin/quotes/${quote.id}`}
                  className="text-sm font-semibold text-signal-600 hover:text-signal-700"
                >
                  View Quote
                </Link>
              )}

            </div>

            {quote ? (
              <div className="mt-5 space-y-4">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                    Quote Number
                  </p>

                  <p className="mt-1 font-semibold text-steel-900">
                    {quote.quote_number}
                  </p>
                </div>

                {quote.product_or_project && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                      Project
                    </p>

                    <p className="mt-1 text-steel-700">
                      {quote.product_or_project}
                    </p>
                  </div>
                )}

                {quote.service_type && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                      Service
                    </p>

                    <p className="mt-1 text-steel-700">
                      {quote.service_type}
                    </p>
                  </div>
                )}

                {quote.material && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                      Material
                    </p>

                    <p className="mt-1 text-steel-700">
                      {quote.material}
                    </p>
                  </div>
                )}

                {quote.approximate_size && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                      Size
                    </p>

                    <p className="mt-1 text-steel-700">
                      {quote.approximate_size}
                    </p>
                  </div>
                )}

                {quote.description && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                      Description
                    </p>

                    <p className="mt-1 whitespace-pre-line text-steel-700">
                      {quote.description}
                    </p>
                  </div>
                )}

              </div>
            ) : (
              <p className="mt-5 text-sm text-steel-500">
                Source quote not available.
              </p>
            )}

          </div>

        </section>

        {/* ==================================================
            ORDER ITEMS
        ================================================== */}

        <section className="rounded-2xl border border-steel-200 bg-white shadow-sm">

          <div className="border-b border-steel-200 px-6 py-5">
            <h2 className="text-lg font-bold text-steel-900">
              Order Items
            </h2>
          </div>

          {items && items.length > 0 ? (
            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>
                  <tr className="border-b border-steel-200 bg-steel-50">

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-steel-500">
                      Description
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-steel-500">
                      Quantity
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-steel-500">
                      Unit Price
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-steel-500">
                      Total
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-steel-100 last:border-0"
                    >

                      <td className="px-6 py-4 text-sm text-steel-800">
                        {item.description}
                      </td>

                      <td className="px-6 py-4 text-right text-sm text-steel-700">
                        {item.quantity}
                      </td>

                      <td className="px-6 py-4 text-right text-sm text-steel-700">
                        {formatCurrency(
                          item.unit_price
                        )}
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-semibold text-steel-900">
                        {formatCurrency(
                          item.total_price
                        )}
                      </td>

                    </tr>
                  ))}

                </tbody>

                <tfoot>

                  <tr>

                    <td
                      colSpan={3}
                      className="px-6 py-5 text-right font-semibold text-steel-700"
                    >
                      Order Total
                    </td>

                    <td className="px-6 py-5 text-right text-lg font-bold text-steel-900">
                      {formatCurrency(
                        order.total
                      )}
                    </td>

                  </tr>

                </tfoot>

              </table>

            </div>
          ) : (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-steel-500">
                No order items found.
              </p>
            </div>
          )}

        </section>

        {/* ==================================================
            PAYMENT DETAILS
        ================================================== */}

        <section className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-steel-900">
            Payment Details
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                Paid Amount
              </p>

              <p className="mt-1 font-semibold text-steel-900">
                {formatCurrency(paidAmount)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                Remaining
              </p>

              <p className="mt-1 font-semibold text-steel-900">
                {formatCurrency(
                  remainingAmount
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                Payment Method
              </p>

              <p className="mt-1 font-semibold text-steel-900">
                {order.payment_method
                  ? formatStatus(
                      order.payment_method
                    )
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                Paid At
              </p>

              <p className="mt-1 text-sm text-steel-700">
                {order.paid_at
                  ? formatDate(order.paid_at)
                  : "—"}
              </p>
            </div>

          </div>

          {order.payment_notes && (
            <div className="mt-5 border-t border-steel-100 pt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                Payment Notes
              </p>

              <p className="mt-1 whitespace-pre-line text-sm leading-6 text-steel-700">
                {order.payment_notes}
              </p>
            </div>
          )}

        </section>

        {/* ==================================================
            ORDER INFORMATION
        ================================================== */}

        <section className="grid gap-6 lg:grid-cols-2">

          <div className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-bold text-steel-900">
              Order Information
            </h2>

            <div className="mt-5 space-y-4">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                  Order ID
                </p>

                <p className="mt-1 break-all text-sm text-steel-700">
                  {order.id}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                  Created
                </p>

                <p className="mt-1 text-sm text-steel-700">
                  {formatDate(order.created_at)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-steel-400">
                  Last Updated
                </p>

                <p className="mt-1 text-sm text-steel-700">
                  {formatDate(order.updated_at)}
                </p>
              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-bold text-steel-900">
              Notes
            </h2>

            <p className="mt-5 whitespace-pre-line text-sm leading-6 text-steel-700">
              {order.notes ||
                "No notes added to this order."}
            </p>

          </div>

        </section>

        {/* ==================================================
            ORDER STATUS
        ================================================== */}

        <section className="rounded-2xl border border-steel-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-steel-900">
            Update Order
          </h2>

          <p className="mt-1 text-sm text-steel-500">
            Manage order progress and payment status.
          </p>

          <div className="mt-6 max-w-xl">

            <OrderStatusForm
              orderId={order.id}
              currentStatus={order.status}
              currentPaymentStatus={
                order.payment_status
              }
            />

          </div>

        </section>

      </div>
    </main>
  );
}