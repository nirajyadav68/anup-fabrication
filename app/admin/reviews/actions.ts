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

export async function createReview(formData: FormData) {
  const supabase = await requireAdmin();

  const customerName = String(formData.get("customerName") ?? "").trim();
  const rating = Number(formData.get("rating"));
  const review = String(formData.get("review") ?? "").trim();
  const imagePath = String(formData.get("imagePath") ?? "").trim();
  const isPublished = formData.get("isPublished") === "on";

  if (!customerName || !review || rating < 1 || rating > 5) {
    throw new Error("Please fill in the customer name, a rating (1–5) and the review text.");
  }

  const { error } = await supabase.from("reviews").insert({
    customer_name: customerName,
    rating,
    review,
    image_path: imagePath || null,
    is_published: isPublished,
  });

  if (error) throw new Error(`Could not add review: ${error.message}`);

  revalidatePath("/admin/reviews");
  revalidatePath("/");
  redirect("/admin/reviews");
}

export async function deleteReview(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw new Error(`Could not delete review: ${error.message}`);
  revalidatePath("/admin/reviews");
  revalidatePath("/");
}

export async function toggleReviewPublished(id: string, isPublished: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("reviews").update({ is_published: isPublished }).eq("id", id);
  if (error) throw new Error(`Could not update review: ${error.message}`);
  revalidatePath("/admin/reviews");
  revalidatePath("/");
}
