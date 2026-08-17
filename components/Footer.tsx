import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { siteConfig, primaryNavLinks } from "@/lib/site-config";
import { buildTelLink } from "@/lib/utils";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 text-steel-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <p className="font-display text-lg font-bold text-white">
            ANUP <span className="text-signal-500">FABRICATION</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed">{siteConfig.description}</p>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {primaryNavLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-signal-500" aria-hidden="true" />
              <span>{siteConfig.address}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-signal-500" aria-hidden="true" />
              <a href={buildTelLink(siteConfig.phone)} className="hover:text-white">
                {siteConfig.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-signal-500" aria-hidden="true" />
              <a href={`mailto:${siteConfig.email}`} className="hover:text-white">
                {siteConfig.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
            Business Hours
          </h3>
          <p className="mt-4 flex items-start gap-2 text-sm">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-signal-500" aria-hidden="true" />
            {siteConfig.businessHours}
          </p>
        </div>
      </div>

      <div className="border-t border-navy-800 px-4 py-5 text-center text-xs text-steel-500 sm:px-6 lg:px-8">
        <p>
          © {year} {siteConfig.name}. All rights reserved. ·{" "}
          <Link href="/privacy-policy" className="hover:text-steel-300">
            Privacy Policy
          </Link>{" "}
          ·{" "}
          <Link href="/terms" className="hover:text-steel-300">
            Terms &amp; Conditions
          </Link>
        </p>
      </div>
    </footer>
  );
}
