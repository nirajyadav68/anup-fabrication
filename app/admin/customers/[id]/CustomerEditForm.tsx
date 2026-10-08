"use client";

import { useState } from "react";
import { updateCustomer } from "./actions";

type CustomerEditFormProps = {
  customer: {
    id: string;
    name: string;
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    city: string | null;
    address: string | null;
    notes: string | null;
  };
};

export default function CustomerEditForm({
  customer,
}: CustomerEditFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsPending(true);
    setMessage("");

    try {
      const formData = new FormData(event.currentTarget);

      await updateCustomer(customer.id, formData);

      setMessage("Customer updated successfully.");
      setOpen(false);
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to update customer."
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div>
      {/* Edit Button */}
      <button
        type="button"
        onClick={() => {
          setMessage("");
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-steel-200 bg-white px-4 py-2 text-sm font-semibold text-navy-900 transition hover:bg-steel-50"
      >
        ✏️ Edit Customer
      </button>

      {/* Success / Error Message */}
      {message && (
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {/* Edit Form */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-steel-100 p-6">
              <div>
                <h2 className="text-xl font-bold text-navy-900">
                  Edit Customer
                </h2>

                <p className="mt-1 text-sm text-steel-500">
                  Update customer information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-xl text-steel-500 hover:bg-steel-100 hover:text-navy-900"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-navy-900">
                  Name *
                </label>

                <input
                  name="name"
                  defaultValue={customer.name}
                  required
                  className="w-full rounded-lg border border-steel-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="Customer name"
                />
              </div>

              {/* Phone + WhatsApp */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-navy-900">
                    Phone
                  </label>

                  <input
                    name="phone"
                    type="tel"
                    defaultValue={customer.phone || ""}
                    className="w-full rounded-lg border border-steel-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-navy-900">
                    WhatsApp
                  </label>

                  <input
                    name="whatsapp"
                    type="tel"
                    defaultValue={customer.whatsapp || ""}
                    className="w-full rounded-lg border border-steel-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    placeholder="WhatsApp number"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-navy-900">
                  Email
                </label>

                <input
                  name="email"
                  type="email"
                  defaultValue={customer.email || ""}
                  className="w-full rounded-lg border border-steel-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="customer@example.com"
                />
              </div>

              {/* City */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-navy-900">
                  City
                </label>

                <input
                  name="city"
                  defaultValue={customer.city || ""}
                  className="w-full rounded-lg border border-steel-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="City"
                />
              </div>

              {/* Address */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-navy-900">
                  Address
                </label>

                <textarea
                  name="address"
                  defaultValue={customer.address || ""}
                  rows={3}
                  className="w-full rounded-lg border border-steel-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="Full address"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-navy-900">
                  Notes
                </label>

                <textarea
                  name="notes"
                  defaultValue={customer.notes || ""}
                  rows={4}
                  className="w-full rounded-lg border border-steel-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="Customer notes"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-steel-100 pt-5">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="rounded-lg border border-steel-200 px-5 py-2.5 text-sm font-semibold text-steel-700 hover:bg-steel-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
