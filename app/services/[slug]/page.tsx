import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPublishedServiceBySlug } from "@/lib/data/services";
import WhatsAppButton from "@/components/WhatsAppButton";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}



export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getPublishedServiceBySlug(params.slug);
  if (!service) return {};
  return {
    title: service.name,
    description: service.description,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const service = await getPublishedServiceBySlug(params.slug);
  if (!service) notFound();

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-steel-500 hover:text-navy-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All services
      </Link>

      <h1 className="mt-4 font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        {service.name}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-steel-700">{service.description}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/quote"
          className="rounded-md bg-signal-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-signal-600"
        >
          Get Free Quote
        </Link>
        <WhatsAppButton
          message={`Hello, I'm interested in ${service.name} from ${siteConfig.shortName}. Could you share more details?`}
          label={`Ask About ${service.name}`}
        />
      </div>
    </section>
  );
}
