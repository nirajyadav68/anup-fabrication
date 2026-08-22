import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Hero() {
  return (
    <section className="relative min-h-[650px] overflow-hidden bg-navy-900">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/hero-fabrication.png')",
        }}
        aria-hidden="true"
      />

      {/* Dark Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-900/80 to-transparent"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative mx-auto flex min-h-[650px] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">

          <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal-400">
            MS &amp; SS FABRICATION EXPERTS
          </p>

          <h1 className="mt-4 font-display text-5xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
            Precision Fabrication.
            <br />
            <span className="text-signal-500">
              Built to Last.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-steel-200 sm:text-lg">
            {siteConfig.description}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/quote"
              className="rounded-md bg-signal-500 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-signal-600 sm:text-base"
            >
              Get Free Quote →
            </Link>

            <WhatsAppButton
              message={`Hello, I'm interested in getting a quote from ${siteConfig.shortName}.`}
              label="WhatsApp Us"
            />

            <a
              href={`tel:${siteConfig.phone}`}
              className="rounded-md border border-white/50 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:text-base"
            >
              Call Now
            </a>
          </div>

          {/* Trust Points */}
          <div className="mt-10 flex flex-wrap gap-5 text-sm font-medium text-white sm:gap-7">
            <span>✓ Premium Quality</span>
            <span>✓ Custom Designs</span>
            <span>✓ On-Time Delivery</span>
            <span>✓ Trusted Service</span>
          </div>

        </div>
      </div>

      {/* Bottom Design */}
      <div
        className="cut-edge-bottom absolute inset-x-0 bottom-0 h-10 bg-steel-50 sm:h-16"
        aria-hidden="true"
      />
    </section>
  );
}