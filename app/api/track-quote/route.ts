import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const quoteNumber = String(body.quoteNumber ?? "").trim();
    const phone = String(body.phone ?? "").trim();

    if (!quoteNumber || !phone) {
      return NextResponse.json(
        {
          error: "Quote number and phone number are required.",
        },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: quote, error } = await supabase
      .from("quotes")
      .select(
        `
        quote_number,
        customer_name,
        service_type,
        product_or_project,
        material,
        width,
        height,
        finish,
        estimated_price,
        status,
        created_at
        `
      )
      .eq("quote_number", quoteNumber)
      .eq("phone", phone)
      .maybeSingle();

    if (error) {
      console.error("Quote tracking error:", error.message);

      return NextResponse.json(
        { error: "Unable to check quote right now." },
        { status: 500 }
      );
    }

    if (!quote) {
      return NextResponse.json(
        {
          error:
            "No quote found. Please check your quote number and phone number.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ quote });
  } catch (error) {
    console.error("Quote tracking request error:", error);

    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}