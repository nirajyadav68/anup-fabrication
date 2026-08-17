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

const QUOTE_STATUSES = [
  "new",
  "contacted",
  "quotation_sent",
  "negotiation",
  "approved",
  "rejected",
  "completed",
] as const;

export async function updateQuoteStatus(id: string, formData: FormData) {
  const supabase = await requireAdmin();
  const status = String(formData.get("status"));

  if (!QUOTE_STATUSES.includes(status as (typeof QUOTE_STATUSES)[number])) {
    throw new Error("Invalid status.");
  }

  const { error } = await supabase.from("quotes").update({ status }).eq("id", id);
  if (error) throw new Error(`Could not update status: ${error.message}`);

  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${id}`);
}

export async function deleteQuote(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("quotes").delete().eq("id", id);
  if (error) throw new Error(`Could not delete quote: ${error.message}`);
  revalidatePath("/admin/quotes");
  redirect("/admin/quotes");
}
