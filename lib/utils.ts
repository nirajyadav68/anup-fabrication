import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names safely, resolving conflicting utility
 * classes (e.g. "p-2 p-4" -> "p-4") the way `tailwind-merge` intends.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Build a WhatsApp deep link with a prefilled message. */
export function buildWhatsAppLink(phoneNumberE164: string, message: string) {
  const digits = phoneNumberE164.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Build a tel: link from a display phone number. */
export function buildTelLink(phoneNumberE164: string) {
  return `tel:${phoneNumberE164.replace(/[^\d+]/g, "")}`;
}
