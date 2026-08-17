import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ServiceForm from "@/components/admin/ServiceForm";
import { updateService } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Service",
  robots: { index: false, follow: false },
};

interface Props {
  params: { id: string };
}

export default async function EditServicePage({ params }: Props) {
  const supabase = createClient();
  const { data: service } = await supabase
    .from("services")
    .select("id, name, slug, short_description, description, image_url, is_enabled")
    .eq("id", params.id)
    .single();

  if (!service) notFound();

  const boundUpdate = updateService.bind(null, service.id);

  return (
    <div>
      <Link
        href="/admin/services"
        className="inline-flex items-center gap-1.5 text-sm text-steel-500 hover:text-navy-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Services
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-navy-900">Edit Service</h1>

      <div className="mt-6">
        <ServiceForm
          action={boundUpdate}
          defaultValues={{
            name: service.name,
            slug: service.slug,
            shortDescription: service.short_description,
            description: service.description,
            imagePath: service.image_url,
            isEnabled: service.is_enabled,
          }}
        />
      </div>
    </div>
  );
}
