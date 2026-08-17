"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { serviceFormSchema } from "@/lib/validations/service";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

function readServiceForm(formData: FormData) {
  return serviceFormSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    imagePath: formData.get("imagePath") ?? "",
    isEnabled: formData.get("isEnabled") === "on",
  });
}

export async function createService(formData: FormData) {
  const supabase = await requireAdmin();
  const values = readServiceForm(formData);

  const { error } = await supabase.from("services").insert({
    name: values.name,
    slug: values.slug,
    short_description: values.shortDescription,
    description: values.description,
    image_url: values.imagePath || null,
    is_enabled: values.isEnabled,
  });

  if (error) {
    throw new Error(`Could not create service: ${error.message}`);
  }

  revalidatePath("/admin/services");
  revalidatePath("/services");
  redirect("/admin/services");
}

export async function updateService(id: string, formData: FormData) {
  const supabase = await requireAdmin();
  const values = readServiceForm(formData);

  const { error } = await supabase
    .from("services")
    .update({
      name: values.name,
      slug: values.slug,
      short_description: values.shortDescription,
      description: values.description,
      image_url: values.imagePath || null,
      is_enabled: values.isEnabled,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Could not update service: ${error.message}`);
  }

  revalidatePath("/admin/services");
  revalidatePath("/services");
  redirect("/admin/services");
}

export async function deleteService(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) {
    throw new Error(`Could not delete service: ${error.message}`);
  }
  revalidatePath("/admin/services");
  revalidatePath("/services");
}

export async function toggleServiceEnabled(id: string, isEnabled: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("services").update({ is_enabled: isEnabled }).eq("id", id);
  if (error) {
    throw new Error(`Could not update service: ${error.message}`);
  }
  revalidatePath("/admin/services");
  revalidatePath("/services");
}
