"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import { primaryNavLinks, siteConfig } from "@/lib/site-config";
import { buildTelLink, cn } from "@/lib/utils";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-navy-800 bg-navy-900/95 backdrop-blur supports-[backdrop-filter]:bg-navy-900/90">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-white"
          onClick={() => setOpen(false)}
        >
          ANUP <span className="text-signal-500">FABRICATION</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 md:flex">
          {primaryNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "text-sm font-medium tracking-wide text-steel-300 transition-colors hover:text-white",
                    isActive && "text-white"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <a
            href={buildTelLink(siteConfig.phone)}
            className="flex items-center gap-1.5 text-sm font-medium text-steel-300 hover:text-white"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {siteConfig.phone}
          </a>
          <Link
            href="/quote"
            className="rounded-md bg-signal-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-signal-600"
          >
            Get Quote
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-white md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          "overflow-hidden border-t border-navy-800 bg-navy-900 transition-[max-height] duration-300 md:hidden",
          open ? "max-h-96" : "max-h-0 border-t-0"
        )}
      >
        <ul className="flex flex-col gap-1 px-4 py-3">
          {primaryNavLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-md px-3 py-2.5 text-base font-medium text-steel-300 hover:bg-navy-800 hover:text-white",
                  pathname === link.href && "bg-navy-800 text-white"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="mt-2 flex gap-2 px-3">
            <Link
              href="/quote"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-md bg-signal-500 px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Get Quote
            </Link>
            <a
              href={buildTelLink(siteConfig.phone)}
              className="flex-1 rounded-md border border-steel-500 px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Call Now
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
