import type { Metadata } from "next";
import QuoteForm from "@/components/QuoteForm";
import { getPublishedServices } from "@/lib/data/services";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Request a Quote",
  description: `Request a fabrication quote from ${siteConfig.name} — tell us what you need and we'll get back to you.`,
  alternates: { canonical: "/quote" },
};

export default async function QuotePage() {
  const services = await getPublishedServices();

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal-600">Get Started</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-navy-900 sm:text-5xl">Request a Quote</h1>
      <p className="mt-3 max-w-xl text-steel-500">
        Tell us what you need — a photo, a drawing, or just a description — and we&apos;ll get back
        to you with a quote.
      </p>

      <div className="mt-10 rounded-lg border border-steel-100 bg-white p-6 sm:p-8">
        <QuoteForm services={services} />
      </div>
    </section>
  );
}
