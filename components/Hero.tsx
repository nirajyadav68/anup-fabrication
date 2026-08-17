import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-900">
      {/* Brushed-steel diagonal texture — signature motif, used once */}
      <div className="absolute inset-0 bg-diagonal-lines" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/70 to-navy-900/30" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 sm:pb-32 sm:pt-20 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal-400">
          MS &amp; SS Fabrication · Patna, Bihar
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] text-white sm:text-6xl">
          Precision Fabrication.
          <br />
          <span className="text-signal-500">Built to Last.</span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-steel-300 sm:text-lg">
          {siteConfig.description}
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href="/quote"
            className="rounded-md bg-signal-500 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-signal-600 sm:text-base"
          >
            Get Free Quote
          </Link>
          <WhatsAppButton
            message={`Hello, I'm interested in getting a quote from ${siteConfig.shortName}.`}
            label="WhatsApp Us"
          />
          <a
            href={`tel:${siteConfig.phone}`}
            className="rounded-md border border-steel-500 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white sm:text-base"
          >
            Call Now
          </a>
        </div>
      </div>

      {/* Angled cut-edge — the shop-floor "cut steel plate" signature */}
      <div className="cut-edge-bottom absolute inset-x-0 bottom-0 h-10 bg-steel-50 sm:h-16" aria-hidden="true" />
    </section>
  );
}
