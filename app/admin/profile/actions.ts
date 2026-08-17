"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const fullName = String(formData.get("fullName") ?? "").trim();
  const avatarPath = String(formData.get("avatarPath") ?? "").trim();

  if (!fullName) throw new Error("Name is required.");

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, avatar_url: avatarPath || null })
    .eq("id", user.id);

  if (error) throw new Error(`Could not update profile: ${error.message}`);

  revalidatePath("/admin/profile");
}

export async function changePassword(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const newPassword = String(formData.get("newPassword") ?? "");
  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(`Could not update password: ${error.message}`);
}
