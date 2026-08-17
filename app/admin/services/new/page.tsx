import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ServiceForm from "@/components/admin/ServiceForm";
import { createService } from "../actions";

export const metadata: Metadata = {
  title: "Add Service",
  robots: { index: false, follow: false },
};

export default function NewServicePage() {
  return (
    <div>
      <Link
        href="/admin/services"
        className="inline-flex items-center gap-1.5 text-sm text-steel-500 hover:text-navy-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Services
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-navy-900">Add Service</h1>

      <div className="mt-6">
        <ServiceForm action={createService} />
      </div>
    </div>
  );
}
