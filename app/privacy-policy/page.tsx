import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold text-navy-900">Privacy Policy</h1>
      <div className="prose prose-slate mt-6 max-w-none text-steel-700">
        <p>
          {siteConfig.name} collects only the information you provide through our contact
          and quote request forms — such as your name, phone number, email and project
          details — in order to respond to your enquiry.
        </p>
        <p>
          We do not sell or share your personal information with third parties, other than
          service providers (such as our website hosting and database provider) who help
          us operate this website.
        </p>
        <p>
          You may contact us at any time at{" "}
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> to request that we
          delete your information.
        </p>
        <p className="text-sm text-steel-500">Last updated: {new Date().getFullYear()}</p>
      </div>
    </section>
  );
}
