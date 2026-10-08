"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateCustomer(
  customerId: string,
  formData: FormData
) {
  const supabase = createClient();

  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const whatsapp = String(formData.get("whatsapp") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!name) {
    throw new Error("Customer name is required");
  }

  const { error } = await supabase
    .from("customers")
    .update({
      name,
      phone: phone || null,
      whatsapp: whatsapp || null,
      email: email || null,
      city: city || null,
      address: address || null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", customerId);

  if (error) {
    console.error("Update customer error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${customerId}`);
}
