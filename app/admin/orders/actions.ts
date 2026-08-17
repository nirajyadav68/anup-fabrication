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



async function findOrCreateCustomer(
  supabase: ReturnType<typeof createClient>,
  name: string,
  phone: string
) {
  const { data: existing } = await supabase.from("customers").select("id").eq("phone", phone).maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("customers")
    .insert({ name, phone })
    .select("id")
    .single();
  if (error || !created) return null;
  return created.id;
}

export async function createOrder(formData: FormData) {
  const supabase = await requireAdmin();

  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const quantity = Number(formData.get("quantity") ?? 1);
  const total = formData.get("total") ? Number(formData.get("total")) : null;

  if (!customerName || !customerPhone || !description) {
    throw new Error("Customer name, phone and description are required.");
  }

  const customerId = await findOrCreateCustomer(supabase, customerName, customerPhone);

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      total,
      notes: description,
    })
    .select("id")
    .single();

  if (error || !order) throw new Error(`Could not create order: ${error?.message ?? "unknown error"}`);

  await supabase.from("order_items").insert({
    order_id: order.id,
    description,
    quantity,
    total_price: total,
  });

  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

export async function updateOrderStatus(id: string, formData: FormData) {
  const supabase = await requireAdmin();
  const status = String(formData.get("status"));
  const paymentStatus = String(formData.get("paymentStatus"));

  const { error } = await supabase
    .from("orders")
    .update({ status, payment_status: paymentStatus })
    .eq("id", id);

  if (error) throw new Error(`Could not update order: ${error.message}`);
  revalidatePath("/admin/orders");
}

export async function deleteOrder(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw new Error(`Could not delete order: ${error.message}`);
  revalidatePath("/admin/orders");
}
