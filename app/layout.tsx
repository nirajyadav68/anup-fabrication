import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Chatbot from "@/components/chat/Chatbot";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | MS & SS Fabrication, Gates, Railings & Custom Metal Work`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "fabrication works near me",
    "MS fabrication",
    "steel fabrication",
    "gate fabrication",
    "SS railing",
    "metal fabrication",
  ],
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.tagline,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.tagline,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1">{children}</main>

        <Footer />

        <WhatsAppButton
          floating
          message={`Hello, I'd like to know more about ${siteConfig.shortName}'s services.`}
        />

        <Chatbot />
      </body>
    </html>
  );
}