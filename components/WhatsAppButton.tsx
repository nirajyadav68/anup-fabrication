import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppLink, cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  message: string;
  label?: string;
  floating?: boolean;
  className?: string;
}

export default function WhatsAppButton({
  message,
  label = "Chat on WhatsApp",
  floating = false,
  className,
}: WhatsAppButtonProps) {
  const href = buildWhatsAppLink(siteConfig.whatsapp, message);

  if (floating) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className={cn(
          "fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 focus-visible:scale-105",
          className
        )}
      >
        <MessageCircle className="h-7 w-7" aria-hidden="true" />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#1FB855]",
        className
      )}
    >
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
      {label}
    </a>
  );
}
