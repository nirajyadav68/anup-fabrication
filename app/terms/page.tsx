import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold text-navy-900">Terms &amp; Conditions</h1>
      <div className="prose prose-slate mt-6 max-w-none text-steel-700">
        <p>
          All quotes provided by {siteConfig.name} are estimates based on the information
          and measurements supplied. Final pricing is confirmed after site measurement or
          drawing review where applicable.
        </p>
        <p>
          Custom fabrication orders may require an advance payment before work begins,
          with the balance due on completion or delivery, as agreed at the time of order.
        </p>
        <p>
          Delivery and installation timelines are estimates and may vary based on material
          availability and site conditions.
        </p>
        <p className="text-sm text-steel-500">Last updated: {new Date().getFullYear()}</p>
      </div>
    </section>
  );
}
