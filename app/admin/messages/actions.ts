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

export async function markMessageRead(id: string, isRead: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("contact_messages").update({ is_read: isRead }).eq("id", id);
  if (error) throw new Error(`Could not update message: ${error.message}`);
  revalidatePath("/admin/messages");
}

export async function deleteMessage(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) throw new Error(`Could not delete message: ${error.message}`);
  revalidatePath("/admin/messages");
}
