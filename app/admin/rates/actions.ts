"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addMaterialRate(formData: FormData) {
  const supabase = await createClient();

  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const rate = Number(formData.get("rate"));
  const unit = String(formData.get("unit") || "").trim();

  if (!name || !category || !unit) {
    throw new Error("Please fill all required fields.");
  }

  if (!Number.isFinite(rate) || rate < 0) {
    throw new Error("Please enter a valid rate.");
  }

  const { error } = await supabase
    .from("material_rates")
    .insert({
      name,
      category,
      rate,
      unit,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error(`Could not add item: ${error.message}`);
  }

  revalidatePath("/admin/rates");
  revalidatePath("/quote");
}

export async function updateMaterialRate(
  id: string,
  formData: FormData
) {
  const supabase = await createClient();

  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const rate = Number(formData.get("rate"));
  const unit = String(formData.get("unit") || "").trim();

  if (!name || !category || !unit) {
    throw new Error("Please fill all required fields.");
  }

  if (!Number.isFinite(rate) || rate < 0) {
    throw new Error("Please enter a valid rate.");
  }

  const { error } = await supabase
    .from("material_rates")
    .update({
      name,
      category,
      rate,
      unit,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Could not update item: ${error.message}`);
  }

  revalidatePath("/admin/rates");
  revalidatePath("/quote");
}

export async function deleteMaterialRate(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("material_rates")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Could not delete item: ${error.message}`);
  }

  revalidatePath("/admin/rates");
  revalidatePath("/quote");
}