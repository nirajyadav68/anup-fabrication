import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const quoteNumber = String(body.quoteNumber ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const response = String(body.response ?? "").trim();

    if (!quoteNumber || !phone || !response) {
      return NextResponse.json(
        { error: "Required information is missing." },
        { status: 400 }
      );
    }

    if (!["approved", "changes_requested"].includes(response)) {
      return NextResponse.json(
        { error: "Invalid response." },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // First verify quote belongs to this customer
    const { data: quote, error: findError } = await supabase
      .from("quotes")
      .select("id, quote_number, customer_name, status")
      .eq("quote_number", quoteNumber)
      .eq("phone", phone)
      .maybeSingle();

    if (findError) {
      console.error("Quote lookup error:", findError.message);

      return NextResponse.json(
        { error: "Unable to process request." },
        { status: 500 }
      );
    }

    if (!quote) {
      return NextResponse.json(
        { error: "Quote not found." },
        { status: 404 }
      );
    }

    // Customer can respond only when quote has been sent
    if (quote.status !== "quoted") {
      return NextResponse.json(
        {
          error:
            "This quote is not currently awaiting customer approval.",
        },
        { status: 400 }
      );
    }

    const newStatus =
      response === "approved" ? "approved" : "reviewing";

    const customerResponse =
      response === "approved"
        ? "approved"
        : "changes_requested";

    const { error: updateError } = await supabase
      .from("quotes")
      .update({
        status: newStatus,
        customer_response: customerResponse,
        customer_response_at: new Date().toISOString(),
      })
      .eq("id", quote.id);

    if (updateError) {
      console.error(
        "Quote response update error:",
        updateError.message
      );

      return NextResponse.json(
        { error: "Could not update quote." },
        { status: 500 }
      );
    }

    // Notify admins
    const notificationTitle =
      response === "approved"
        ? "Quote Approved by Customer"
        : "Customer Requested Changes";

    const notificationMessage =
      response === "approved"
        ? `${quote.customer_name} approved quote ${quote.quote_number}.`
        : `${quote.customer_name} requested changes to quote ${quote.quote_number}.`;

    const { data: admins } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (admins && admins.length > 0) {
      await supabase.from("notifications").insert(
        admins.map((admin) => ({
          user_id: admin.id,
          title: notificationTitle,
          message: notificationMessage,
          type: "quote",
          reference_id: quote.id,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      message:
        response === "approved"
          ? "Quote approved successfully."
          : "Your request for changes has been sent.",
    });
  } catch (error) {
    console.error("Quote response error:", error);

    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}