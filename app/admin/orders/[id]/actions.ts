"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "in_production",
  "ready",
  "delivered",
  "cancelled",
] as const;

const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "partially_paid",
  "refunded",
] as const;

export async function updateOrderStatus(
  orderId: string,
  status: string
) {
  if (
    !ORDER_STATUSES.includes(
      status as (typeof ORDER_STATUSES)[number]
    )
  ) {
    throw new Error("Invalid order status.");
  }

  const supabase = createClient();

  const { error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    console.error("Update order status error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: string
) {
  if (
    !PAYMENT_STATUSES.includes(
      paymentStatus as (typeof PAYMENT_STATUSES)[number]
    )
  ) {
    throw new Error("Invalid payment status.");
  }

  const supabase = createClient();

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    console.error(
      "Update payment status error:",
      error
    );
    throw new Error(error.message);
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}