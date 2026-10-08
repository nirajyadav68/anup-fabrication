"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Search, X } from "lucide-react";
import DeleteButton from "@/components/admin/DeleteButton";
import OrderStatusForm from "@/components/admin/OrderStatusForm";

type Customer = {
  name?: string | null;
  phone?: string | null;
};

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number | null;
  created_at: string;
  customers: Customer | Customer[] | null;
};

type Props = {
  orders: Order[];

  deleteAction: (
    id: string
  ) => Promise<void>;

  updateStatusAction: (
    id: string,
    formData: FormData
  ) => Promise<void>;
};

const ORDER_STATUSES = [
  "all",
  "pending",
  "confirmed",
  "in_production",
  "ready",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES = [
  "all",
  "pending",
  "partially_paid",
  "paid",
  "refunded",
];

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

export default function OrderDirectory({
  orders,
  deleteAction,
  updateStatusAction,
}: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [paymentFilter, setPaymentFilter] =
    useState("all");

  const [sortBy, setSortBy] =
    useState("newest");

  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  const filteredOrders = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    const result = orders.filter((order) => {
      const customer = Array.isArray(
        order.customers
      )
        ? order.customers[0]
        : order.customers;

      const customerName =
        customer?.name?.toLowerCase() || "";

      const customerPhone =
        customer?.phone?.toLowerCase() || "";

      const orderNumber =
        order.order_number.toLowerCase();

      const matchesSearch =
        !searchValue ||
        orderNumber.includes(searchValue) ||
        customerName.includes(searchValue) ||
        customerPhone.includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        order.status === statusFilter;

      const matchesPayment =
        paymentFilter === "all" ||
        order.payment_status === paymentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment
      );
    });

    result.sort((a, b) => {
      if (sortBy === "oldest") {
        return (
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
        );
      }

      if (sortBy === "newest") {
        return (
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );
      }

      if (sortBy === "amount-high") {
        return (
          Number(b.total || 0) -
          Number(a.total || 0)
        );
      }

      if (sortBy === "amount-low") {
        return (
          Number(a.total || 0) -
          Number(b.total || 0)
        );
      }

      if (sortBy === "order-az") {
        return a.order_number.localeCompare(
          b.order_number
        );
      }

      return 0;
    });

    return result;
  }, [
    orders,
    search,
    statusFilter,
    paymentFilter,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredOrders.length /
        ITEMS_PER_PAGE
    )
  );

  const safePage = Math.min(
    page,
    totalPages
  );

  const startIndex =
    (safePage - 1) * ITEMS_PER_PAGE;

  const visibleOrders =
    filteredOrders.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setSortBy("newest");
    setPage(1);
  }

  return (
    <div className="mt-6">

      {/* =========================
          FILTER BAR
      ========================== */}
      <div className="rounded-xl border border-steel-100 bg-white p-4 shadow-sm">

        <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">

          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value
                );
                setPage(1);
              }}
              placeholder="Search order, customer or phone..."
              className="w-full rounded-lg border border-steel-200 bg-white py-2.5 pl-9 pr-3 text-sm text-steel-900 outline-none transition placeholder:text-steel-400 focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            />
          </div>

          {/* Order Status */}
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(
                event.target.value
              );
              setPage(1);
            }}
            className="rounded-lg border border-steel-200 bg-white px-3 py-2.5 text-sm text-steel-700 outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          >
            {ORDER_STATUSES.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status === "all"
                    ? "All Order Status"
                    : formatStatus(status)}
                </option>
              )
            )}
          </select>

          {/* Payment Status */}
          <select
            value={paymentFilter}
            onChange={(event) => {
              setPaymentFilter(
                event.target.value
              );
              setPage(1);
            }}
            className="rounded-lg border border-steel-200 bg-white px-3 py-2.5 text-sm text-steel-700 outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          >
            {PAYMENT_STATUSES.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status === "all"
                    ? "All Payments"
                    : formatStatus(status)}
                </option>
              )
            )}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(event) => {
              setSortBy(
                event.target.value
              );
              setPage(1);
            }}
            className="rounded-lg border border-steel-200 bg-white px-3 py-2.5 text-sm text-steel-700 outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          >
            <option value="newest">
              Newest First
            </option>

            <option value="oldest">
              Oldest First
            </option>

            <option value="amount-high">
              Highest Amount
            </option>

            <option value="amount-low">
              Lowest Amount
            </option>

            <option value="order-az">
              Order A-Z
            </option>
          </select>

          {/* Clear */}
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-steel-200 px-4 py-2.5 text-sm font-semibold text-steel-600 transition hover:bg-steel-50"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        </div>

        {/* Result Count */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-steel-500">
          <span>
            Showing{" "}
            <strong className="text-steel-700">
              {filteredOrders.length}
            </strong>{" "}
            of{" "}
            <strong className="text-steel-700">
              {orders.length}
            </strong>{" "}
            orders
          </span>

          {filteredOrders.length > 0 && (
            <span>
              Page {safePage} of{" "}
              {totalPages}
            </span>
          )}
        </div>
      </div>

      {/* =========================
          ORDERS
      ========================== */}
      <div className="mt-4 space-y-3">

        {visibleOrders.map((order) => {
          const customer =
            Array.isArray(
              order.customers
            )
              ? order.customers[0]
              : order.customers;

          const boundUpdate =
            updateStatusAction.bind(
              null,
              order.id
            );

          return (
            <div
              key={order.id}
              className="rounded-lg border border-steel-100 bg-white p-5"
            >

              {/* Order Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">

                <div>
                  <p className="font-mono text-sm font-semibold text-navy-900">
                    {order.order_number}
                  </p>

                  <p className="mt-0.5 text-sm text-steel-500">
                    {customer?.name ??
                      "Unknown customer"}

                    {customer?.phone
                      ? ` · ${customer.phone}`
                      : ""}
                  </p>

                  <p className="mt-0.5 text-xs text-steel-400">
                    {new Date(
                      order.created_at
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </p>
                </div>

                {/* Amount + Actions */}
                <div className="flex flex-wrap items-center gap-2">

                  {order.total !== null && (
                    <p className="mr-2 font-mono text-sm font-semibold text-navy-900">
                      ₹
                      {Number(
                        order.total
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  )}

                  {/* View */}
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-steel-200 px-3 py-2 text-sm font-semibold text-steel-700 transition hover:bg-steel-50"
                  >
                    <Eye className="h-4 w-4" />
                    View Order
                  </Link>

                  {/* Delete */}
                  <DeleteButton
                    action={deleteAction}
                    id={order.id}
                    itemLabel={
                      order.order_number
                    }
                  />
                </div>
              </div>

              {/* Status */}
              <div className="mt-3">
                <OrderStatusForm
                  action={boundUpdate}
                  status={order.status}
                  paymentStatus={
                    order.payment_status
                  }
                />
              </div>
            </div>
          );
        })}

        {/* No Orders */}
        {visibleOrders.length === 0 && (
          <div className="rounded-lg border border-dashed border-steel-300 bg-white p-10 text-center">

            <p className="font-semibold text-steel-700">
              No orders found
            </p>

            <p className="mt-1 text-sm text-steel-500">
              Try changing your search or
              filters.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 rounded-lg bg-signal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-signal-600"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* =========================
          PAGINATION
      ========================== */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">

          <button
            type="button"
            disabled={safePage === 1}
            onClick={() =>
              setPage((current) =>
                Math.max(
                  1,
                  current - 1
                )
              )
            }
            className="rounded-lg border border-steel-200 px-4 py-2 text-sm font-semibold text-steel-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          {Array.from(
            {
              length: totalPages,
            },
            (_, index) =>
              index + 1
          ).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() =>
                setPage(pageNumber)
              }
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                safePage === pageNumber
                  ? "bg-signal-500 text-white"
                  : "border border-steel-200 text-steel-700 hover:bg-steel-50"
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            disabled={
              safePage === totalPages
            }
            onClick={() =>
              setPage((current) =>
                Math.min(
                  totalPages,
                  current + 1
                )
              )
            }
            className="rounded-lg border border-steel-200 px-4 py-2 text-sm font-semibold text-steel-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}