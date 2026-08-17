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

export async function addGalleryImages(formData: FormData) {
  const supabase = await requireAdmin();
  const paths = formData.getAll("imagePaths").map(String).filter(Boolean);
  const title = String(formData.get("title") ?? "").trim();

  if (paths.length === 0) {
    throw new Error("Please upload at least one image.");
  }

  const rows = paths.map((storage_path) => ({
    storage_path,
    title: title || null,
    is_published: true,
  }));

  const { error } = await supabase.from("gallery").insert(rows);
  if (error) throw new Error(`Could not add to gallery: ${error.message}`);

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  redirect("/admin/gallery");
}

export async function deleteGalleryImage(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("gallery").delete().eq("id", id);
  if (error) throw new Error(`Could not delete image: ${error.message}`);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function toggleGalleryPublished(id: string, isPublished: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("gallery").update({ is_published: isPublished }).eq("id", id);
  if (error) throw new Error(`Could not update image: ${error.message}`);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}
