import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Wrench } from "lucide-react";
import type { Service } from "@/types";

const serviceImages: Record<string, string> = {
  "ms-fabrication": "/ms-fabrication.png",
  "ss-fabrication": "/ss-fabrication.png",
  "gates": "/gates.png",
  "doors": "/doors.png",
  "windows": "/windows.png",
  "railings": "/railings.png",
};

export default function ServiceCard({ service }: { service: Service }) {
  const image =
    serviceImages[service.slug] || "/ms-fabrication.png";

  return (
    <div className="group overflow-hidden rounded-lg border border-steel-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">

      {/* Service Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={image}
          alt={service.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Icon */}
        <div className="absolute bottom-3 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-navy-900 shadow-lg">
          <Wrench
            className="h-5 w-5 text-signal-500"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col p-6 pt-8">
        <h3 className="font-display text-lg font-semibold text-navy-900">
          {service.name}
        </h3>

        <p className="mt-2 flex-1 text-sm leading-relaxed text-steel-500">
          {service.shortDescription}
        </p>

        <Link
          href={`/services/${service.slug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-signal-600 hover:text-signal-500"
        >
          View Details
          <ArrowUpRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>

    </div>
  );
}