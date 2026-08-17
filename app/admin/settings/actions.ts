"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

export async function updateWebsiteSettings(formData: FormData) {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("website_settings")
    .update({
      company_name: String(formData.get("companyName") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      whatsapp: String(formData.get("whatsapp") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      address: String(formData.get("address") ?? "").trim(),
      google_maps_url: String(formData.get("googleMapsUrl") ?? "").trim() || null,
      business_hours: String(formData.get("businessHours") ?? "").trim() || null,
      social_instagram: String(formData.get("socialInstagram") ?? "").trim() || null,
      social_facebook: String(formData.get("socialFacebook") ?? "").trim() || null,
      hero_title: String(formData.get("heroTitle") ?? "").trim() || null,
      hero_description: String(formData.get("heroDescription") ?? "").trim() || null,
      footer_text: String(formData.get("footerText") ?? "").trim() || null,
    })
    .eq("id", true);

  if (error) throw new Error(`Could not update settings: ${error.message}`);

  revalidatePath("/admin/settings");
  revalidatePath("/");
}
