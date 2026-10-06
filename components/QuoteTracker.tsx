"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  IndianRupee,
} from "lucide-react";

type Quote = {
  quote_number: string;
  customer_name: string;
  service_type: string | null;
  product_or_project: string | null;
  material: string | null;
  width: number | null;
  height: number | null;
  finish: string | null;
  estimated_price: number | null;
  status: string;
  created_at: string;
};

const statusSteps = [
  "new",
  "reviewing",
  "quoted",
  "approved",
  "completed",
];

const statusLabels: Record<string, string> = {
  new: "New",
  reviewing: "Reviewing",
  quoted: "Quoted",
  approved: "Approved",
  completed: "Completed",
  rejected: "Rejected",
};

export default function QuoteTracker() {
  const [quoteNumber, setQuoteNumber] = useState("");
  const [phone, setPhone] = useState("");

  const [quote, setQuote] = useState<Quote | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [responseLoading, setResponseLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setQuote(null);

    if (!quoteNumber.trim() || !phone.trim()) {
      setError(
        "Please enter both quote number and phone number."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/track-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteNumber: quoteNumber.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Quote not found.");
        return;
      }

      setQuote(data.quote);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCustomerResponse(
    responseType: "approved" | "changes_requested"
  ) {
    if (!quote) return;

    const message =
      responseType === "approved"
        ? "Are you sure you want to approve this quote?"
        : "Do you want to request changes to this quote?";

    const confirmed = window.confirm(message);

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setResponseLoading(true);

    try {
      const response = await fetch(
        "/api/track-quote/response",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quoteNumber: quote.quote_number,
            phone,
            response: responseType,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Could not update the quote."
        );
        return;
      }

      setQuote((current) =>
        current
          ? {
              ...current,
              status: data.status,
            }
          : current
      );

      setSuccess(
        responseType === "approved"
          ? "Quote approved successfully. Thank you!"
          : "Your request for changes has been sent to Anup Fabrication."
      );
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setResponseLoading(false);
    }
  }

  function getStatusIcon(status: string) {
    if (
      status === "completed" ||
      status === "approved"
    ) {
      return (
        <CheckCircle className="h-5 w-5 text-green-600" />
      );
    }

    if (status === "rejected") {
      return (
        <XCircle className="h-5 w-5 text-red-600" />
      );
    }

    if (status === "new") {
      return (
        <FileText className="h-5 w-5 text-blue-600" />
      );
    }

    return (
      <Clock className="h-5 w-5 text-yellow-600" />
    );
  }

  const currentStep = quote
    ? statusSteps.indexOf(quote.status)
    : -1;

  return (
    <div>
      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="quoteNumber"
            className="block text-sm font-medium text-navy-900"
          >
            Quote Number
          </label>

          <input
            id="quoteNumber"
            type="text"
            value={quoteNumber}
            onChange={(e) =>
              setQuoteNumber(e.target.value)
            }
            placeholder="Example: ANQ-2026-001"
            className="mt-2 w-full rounded-lg border border-steel-200 px-4 py-3 text-sm outline-none transition focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-navy-900"
          >
            Phone Number
          </label>

          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            placeholder="Enter the phone used for your quote"
            className="mt-2 w-full rounded-lg border border-steel-200 px-4 py-3 text-sm outline-none transition focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-navy-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Search className="h-4 w-4" />

          {loading
            ? "Checking..."
            : "Track Quote"}
        </button>
      </form>

      {/* Result */}
      {quote && (
        <div className="mt-8 border-t border-steel-100 pt-8">
          {/* Quote Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-steel-500">
                Quote Number
              </p>

              <h2 className="mt-1 font-mono text-xl font-bold text-navy-900">
                {quote.quote_number}
              </h2>

              <p className="mt-1 text-sm text-steel-500">
                {quote.customer_name}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-signal-50 px-4 py-2">
              {getStatusIcon(quote.status)}

              <span className="text-sm font-semibold text-navy-900">
                {statusLabels[quote.status] ||
                  quote.status}
              </span>
            </div>
          </div>

          {/* Status Progress */}
          {quote.status !== "rejected" && (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                {statusSteps.map(
                  (step, index) => {
                    const completed =
                      index <= currentStep;

                    return (
                      <div
                        key={step}
                        className="flex flex-1 items-center"
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                              completed
                                ? "bg-navy-900 text-white"
                                : "bg-steel-100 text-steel-400"
                            }`}
                          >
                            {index + 1}
                          </div>

                          <span className="mt-2 text-[10px] font-medium text-steel-500 sm:text-xs">
                            {statusLabels[step]}
                          </span>
                        </div>

                        {index <
                          statusSteps.length - 1 && (
                          <div
                            className={`mx-2 h-0.5 flex-1 ${
                              index < currentStep
                                ? "bg-navy-900"
                                : "bg-steel-100"
                            }`}
                          />
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Customer Actions */}
          {quote.status === "quoted" && (
            <div className="mt-8 rounded-xl border border-signal-200 bg-signal-50 p-5">
              <h3 className="font-semibold text-navy-900">
                Your Quote is Ready
              </h3>

              <p className="mt-1 text-sm text-steel-600">
                Please review the estimated price and
                choose how you would like to proceed.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={responseLoading}
                  onClick={() =>
                    handleCustomerResponse(
                      "approved"
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle className="h-4 w-4" />

                  {responseLoading
                    ? "Processing..."
                    : "Approve Quote"}
                </button>

                <button
                  type="button"
                  disabled={responseLoading}
                  onClick={() =>
                    handleCustomerResponse(
                      "changes_requested"
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-lg border border-steel-300 bg-white px-4 py-3 text-sm font-semibold text-navy-900 transition hover:border-navy-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Clock className="h-4 w-4" />

                  {responseLoading
                    ? "Processing..."
                    : "Request Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Approved */}
          {quote.status === "approved" && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />

                <p className="font-semibold text-green-900">
                  Quote Approved
                </p>
              </div>

              <p className="mt-1 text-sm text-green-700">
                Thank you! Anup Fabrication can now proceed
                with the next stage of your project.
              </p>
            </div>
          )}

          {/* Reviewing / Changes Requested */}
          {quote.status === "reviewing" && (
            <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-5">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />

                <p className="font-semibold text-yellow-900">
                  Quote Under Review
                </p>
              </div>

              <p className="mt-1 text-sm text-yellow-700">
                Your request has been sent to Anup Fabrication.
                The team will review it and update your quote.
              </p>
            </div>
          )}

          {/* Rejected */}
          {quote.status === "rejected" && (
            <div className="mt-6 rounded-lg border border-red-100 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />

                <p className="font-semibold text-red-900">
                  Quote Rejected
                </p>
              </div>

              <p className="mt-1 text-sm text-red-700">
                Please contact Anup Fabrication if you
                need more information.
              </p>
            </div>
          )}

          {/* Quote Details */}
          <div className="mt-8 rounded-xl border border-steel-100 bg-steel-50 p-5">
            <h3 className="font-semibold text-navy-900">
              Project Details
            </h3>

            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {quote.service_type && (
                <div>
                  <dt className="text-xs uppercase text-steel-500">
                    Service
                  </dt>

                  <dd className="mt-1 text-sm font-medium text-navy-900">
                    {quote.service_type}
                  </dd>
                </div>
              )}

              {quote.product_or_project && (
                <div>
                  <dt className="text-xs uppercase text-steel-500">
                    Project
                  </dt>

                  <dd className="mt-1 text-sm font-medium text-navy-900">
                    {quote.product_or_project}
                  </dd>
                </div>
              )}

              {quote.material && (
                <div>
                  <dt className="text-xs uppercase text-steel-500">
                    Material
                  </dt>

                  <dd className="mt-1 text-sm font-medium text-navy-900">
                    {quote.material}
                  </dd>
                </div>
              )}

              {quote.finish && (
                <div>
                  <dt className="text-xs uppercase text-steel-500">
                    Finish
                  </dt>

                  <dd className="mt-1 text-sm font-medium text-navy-900">
                    {quote.finish}
                  </dd>
                </div>
              )}

              {quote.width && quote.height && (
                <div>
                  <dt className="text-xs uppercase text-steel-500">
                    Size
                  </dt>

                  <dd className="mt-1 text-sm font-medium text-navy-900">
                    {quote.width} × {quote.height}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Estimated Price */}
          {quote.estimated_price && (
            <div className="mt-5 rounded-xl border border-signal-200 bg-signal-50 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-signal-700">
                    Estimated Price
                  </p>

                  <p className="mt-1 text-2xl font-bold text-navy-900">
                    ₹
                    {Number(
                      quote.estimated_price
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-full bg-white p-3">
                  <IndianRupee className="h-5 w-5 text-signal-600" />
                </div>
              </div>

              <p className="mt-3 text-xs text-steel-500">
                This is an estimated price. Final pricing
                may vary after measurement and project
                verification.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}