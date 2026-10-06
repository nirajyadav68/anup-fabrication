import type { Metadata } from "next";
import QuoteTracker from "@/components/QuoteTracker";

export const metadata: Metadata = {
  title: "Track Your Quote",
  description:
    "Track your Anup Fabrication quote request and check its current status.",
};

export default function TrackQuotePage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal-600">
          Quote Tracking
        </p>

        <h1 className="mt-2 font-display text-4xl font-bold text-navy-900 sm:text-5xl">
          Track Your Quote
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-steel-500">
          Enter your quote number and phone number to check the latest
          status of your fabrication request.
        </p>
      </div>

      <div className="mt-10 rounded-xl border border-steel-100 bg-white p-6 shadow-sm sm:p-8">
        <QuoteTracker />
      </div>
    </section>
  );
}