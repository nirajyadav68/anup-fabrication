import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAYMENT_METHODS = [
  "cash",
  "upi",
  "bank_transfer",
  "card",
  "cheque",
  "other",
] as const;

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    // Check logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const orderId = params.id;

    // Read request body
    const body = await request.json();

    const paidAmount = Number(body.paidAmount);

    const paymentMethod = body.paymentMethod
      ? String(body.paymentMethod)
      : null;

    const paymentNotes = body.paymentNotes
      ? String(body.paymentNotes).trim()
      : null;

    // Validate amount
    if (!Number.isFinite(paidAmount) || paidAmount < 0) {
      return NextResponse.json(
        {
          error: "Invalid paid amount.",
        },
        { status: 400 }
      );
    }

    // Validate payment method
    if (
      paymentMethod &&
      !PAYMENT_METHODS.includes(
        paymentMethod as (typeof PAYMENT_METHODS)[number]
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid payment method.",
        },
        { status: 400 }
      );
    }

    // Get order
    const { data: order, error: orderError } =
      await supabase
        .from("orders")
        .select("id, total")
        .eq("id", orderId)
        .single();

    if (orderError || !order) {
      console.error(
        "Order lookup error:",
        orderError
      );

      return NextResponse.json(
        {
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    const total = Number(order.total ?? 0);

    // Paid amount cannot exceed total
    if (paidAmount > total) {
      return NextResponse.json(
        {
          error:
            "Paid amount cannot be greater than order total.",
        },
        { status: 400 }
      );
    }

    // Calculate payment status
    let paymentStatus:
      | "pending"
      | "partially_paid"
      | "paid";

    if (paidAmount === 0) {
      paymentStatus = "pending";
    } else if (paidAmount < total) {
      paymentStatus = "partially_paid";
    } else {
      paymentStatus = "paid";
    }

    // Update order
    const {
      data: updatedOrder,
      error: updateError,
    } = await supabase
      .from("orders")
      .update({
        paid_amount: paidAmount,
        payment_method: paymentMethod,
        payment_notes: paymentNotes,
        payment_status: paymentStatus,
        paid_at:
          paidAmount > 0
            ? new Date().toISOString()
            : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select(
        `
          id,
          total,
          paid_amount,
          payment_method,
          payment_notes,
          payment_status,
          paid_at
        `
      )
      .single();

    if (updateError || !updatedOrder) {
      console.error(
        "Payment update error:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            updateError?.message ||
            "Failed to update payment.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Payment API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error.",
      },
      { status: 500 }
    );
  }
}