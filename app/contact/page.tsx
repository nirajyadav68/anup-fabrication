import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import WhatsAppButton from "@/components/WhatsAppButton";
import { siteConfig } from "@/lib/site-config";
import { buildTelLink } from "@/lib/utils";


export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${siteConfig.name} for a quote or to discuss your fabrication project.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal-600">
        Get In Touch
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        Contact Us
      </h1>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <ul className="space-y-5">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-signal-500" aria-hidden="true" />
              <span className="text-steel-700">{siteConfig.address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-5 w-5 shrink-0 text-signal-500" aria-hidden="true" />
              <a href={buildTelLink(siteConfig.phone)} className="text-steel-700 hover:text-navy-900">
                {siteConfig.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 shrink-0 text-signal-500" aria-hidden="true" />
              <a href={`mailto:${siteConfig.email}`} className="text-steel-700 hover:text-navy-900">
                {siteConfig.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="h-5 w-5 shrink-0 text-signal-500" aria-hidden="true" />
              <span className="text-steel-700">{siteConfig.businessHours}</span>
            </li>
          </ul>

          <div className="mt-6">
            <WhatsAppButton
              message={`Hello, I'd like to get in touch with ${siteConfig.shortName}.`}
            />
          </div>

          <div className="mt-8 overflow-hidden rounded-lg border border-steel-100">
            <iframe
              title="Location map"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                siteConfig.address
              )}&output=embed`}
              className="h-72 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="rounded-lg border border-steel-100 bg-white p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold text-navy-900">Send a Message</h2>
          <p className="mt-1 text-sm text-steel-500">
            We usually reply within a few hours during business hours.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
