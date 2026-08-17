/**
 * Single source of truth for editable business info.
 *
 * In Phase 1 (no database yet) these values come from environment
 * variables with sane fallbacks. In Phase 2+, this file will instead
 * read from the `website_settings` table (via a server component /
 * cached fetch) so the admin can edit these from the dashboard
 * without a code change or redeploy.
 */
export const siteConfig = {
  name: "Anup Fabrication Works",
  shortName: "Anup Fabrication",
  tagline: "Precision Fabrication. Built to Last.",
  description:
    "Quality MS & SS fabrication, gates, railings, doors, windows and custom metal work — built to spec, delivered on time.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.anupfabrication.in",
  phone: process.env.NEXT_PUBLIC_PHONE_NUMBER ?? "+919999999999",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+919999999999",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "rajuyadavchinchoti@123gmail.com",
  address: "Naigaon, 9WM2+R37, Chinchoti Rd, Chinchoti, East, Vasai-Virar, Maharashtra 421302, India",
  businessHours: "Mon – Sat: 9:00 AM – 9:00 PM",
  googleMapsUrl: process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL ?? "https://www.google.com/maps/place/Chinchoti+Rd,+Chinchoti,+Vasai-Virar,+Maharashtra+421302/@19.3872,72.9038,822m/data=!3m1!1e3!4m6!3m5!1s0x3be7a58af2b19585:0x4699e60ff25f9284!8m2!3d19.3845926!4d72.9001255!16s%2Fg%2F1tf46m21?hl=en&entry=ttu&g_ep=EgoyMDI2MDgxMi4wIKXMDSoASAFQAw%3D%3D",
  social: {
    instagram: "",
    facebook: "",
  },
} as const;

export const primaryNavLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Gallery", href: "/gallery" },
  { label: "Products", href: "/products" },
  { label: "Contact", href: "/contact" },
] as const;
