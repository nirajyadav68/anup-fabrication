import Link from "next/link";
import { ArrowUpRight, Wrench } from "lucide-react";
import type { Service } from "@/types";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="group flex flex-col rounded-lg border border-steel-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-navy-900">
        <Wrench className="h-5 w-5 text-signal-500" aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-navy-900">{service.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-steel-500">
        {service.shortDescription}
      </p>
      <Link
        href={`/services/${service.slug}`}
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-signal-600 hover:text-signal-500"
      >
        View Details
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
      </Link>
    </div>
  );
}
