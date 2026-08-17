import Link from "next/link";
import type { Metadata } from "next";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import ServiceCard from "@/components/ServiceCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import ReviewsSection from "@/components/ReviewsSection";
import { getPublishedServices } from "@/lib/data/services";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Home",
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const featuredServices = (await getPublishedServices()).slice(0, 6);

  return (
    <>
      <Hero />
      <TrustBar />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal-600">
              What We Do
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
              Our Services
            </h2>
          </div>
          <Link
            href="/services"
            className="text-sm font-semibold text-signal-600 hover:text-signal-500"
          >
            View all services →
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      <section className="bg-navy-900">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Have a fabrication job in mind?
            </h2>
            <p className="mt-2 max-w-xl text-steel-300">
              Send us your requirement — a photo, a drawing, or just a description — and
              we&apos;ll get back with a quote.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/quote"
              className="rounded-md bg-signal-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-signal-600"
            >
              Request a Quote
            </Link>
            <WhatsAppButton
              message={`Hello, I have a fabrication job I'd like to discuss with ${siteConfig.shortName}.`}
            />
          </div>
        </div>
      </section>

      <ReviewsSection />
    </>
  );
}
