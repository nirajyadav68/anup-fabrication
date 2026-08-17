import type { Metadata } from "next";
import ServiceCard from "@/components/ServiceCard";
import { getPublishedServices } from "@/lib/data/services";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Services",
  description: `MS fabrication, SS fabrication, gates, railings, doors, windows and more from ${siteConfig.name}.`,
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const enabledServices = await getPublishedServices();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal-600">
        What We Do
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        Our Services
      </h1>
      <p className="mt-3 max-w-2xl text-steel-500">
        Every service below is fabricated in-house and sized to your job — from a single
        gate to a full structural shed.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {enabledServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
        {enabledServices.length === 0 && (
          <p className="text-steel-500">No services published yet.</p>
        )}
      </div>
    </section>
  );
}
