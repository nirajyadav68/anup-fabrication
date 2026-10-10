
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      console.error("Missing server-side Supabase configuration");

      return NextResponse.json(
        { success: false, error: "Server configuration error." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const customerName = String(body.customerName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const description = String(body.description ?? "").trim();

    if (
      !customerName ||
      customerName.length > 120 ||
      !phone ||
      phone.length > 30 ||
      email.length > 254 ||
      description.length > 5000
    ) {
      return NextResponse.json(
        { success: false, error: "Please check the submitted form fields." },
        { status: 400 }
      );
    }

    const supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // 1. Find an existing customer by phone, then email.
    let customerId: string | null = null;

    const { data: phoneMatch, error: phoneError } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", phone)
      .limit(1)
      .maybeSingle();

    if (phoneError) throw phoneError;

    if (phoneMatch) {
      customerId = phoneMatch.id;
    } else if (email) {
      const { data: emailMatch, error: emailError } = await supabase
        .from("customers")
        .select("id")
        .eq("email", email)
        .limit(1)
        .maybeSingle();

      if (emailError) throw emailError;

      if (emailMatch) {
        customerId = emailMatch.id;
      }
    }

    // 2. Update or create the customer.
    const customerFields = {
      name: customerName,
      phone,
      whatsapp: body.whatsapp || null,
      email: email || null,
      city: body.city || null,
      address: body.address || null,
      updated_at: new Date().toISOString(),
    };

    if (customerId) {
      const { error } = await supabase
        .from("customers")
        .update(customerFields)
        .eq("id", customerId);

      if (error) throw error;
    } else {
      const { data, error } = await supabase
        .from("customers")
        .insert(customerFields)
        .select("id")
        .single();

      if (error) throw error;

      customerId = data.id;
    }

    // 3. Create the quote.
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        customer_id: customerId,
        customer_name: customerName,
        phone,
        whatsapp: body.whatsapp || null,
        email: email || null,
        city: body.city || null,
        address: body.address || null,
        service_type: body.serviceType || null,
        product_or_project: body.productOrProject || null,
        material: body.material || null,
        approximate_size: body.approximateSize || null,
        width: body.width != null && body.width !== ""
          ? Number(body.width)
          : null,
        height: body.height != null && body.height !== ""
          ? Number(body.height)
          : null,
        finish: body.finish || null,
        estimated_price: body.estimatedPrice ?? null,
        quantity: body.quantity === "" ? null : body.quantity ?? null,
        budget: body.budget === "" ? null : body.budget ?? null,
        required_date: body.requiredDate || null,
        description,
        status: "new",
      })
      .select("id, quote_number")
      .single();

    if (quoteError) throw quoteError;

    // 4. Add customer activity.
    const { error: activityError } = await supabase.rpc(
      "create_customer_quote_activity",
      {
        p_customer_id: customerId,
        p_quote_id: quote.id,
        p_title: `Quote ${quote.quote_number || "created"}`,
        p_description:
          body.productOrProject ||
          body.serviceType ||
          "New quote request submitted",
      }
    );

    if (activityError) {
      console.error("Customer activity error:", activityError.message);
    }

    // 5. Link uploaded files to the quote.
    const drawingPaths = Array.isArray(body.drawingPaths)
      ? body.drawingPaths
          .filter((path: unknown): path is string => typeof path === "string")
          .slice(0, 10)
      : [];

    const referencePaths = Array.isArray(body.referencePaths)
      ? body.referencePaths
          .filter((path: unknown): path is string => typeof path === "string")
          .slice(0, 10)
      : [];

    const fileRows = [
      ...drawingPaths.map((storage_path: string) => ({
        quote_id: quote.id,
        storage_path,
        file_type: "drawing",
      })),
      ...referencePaths.map((storage_path: string) => ({
        quote_id: quote.id,
        storage_path,
        file_type: "reference_image",
      })),
    ];

    if (fileRows.length > 0) {
      const { error: filesError } = await supabase
        .from("quote_files")
        .insert(fileRows);

      if (filesError) {
        console.error("Quote files error:", filesError.message);
      }
    }

    return NextResponse.json({
      success: true,
      customerId,
      quote: {
        id: quote.id,
        quote_number: quote.quote_number,
      },
    });
  } catch (error) {
    console.error("Quote API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Quote could not be saved. Please try again.",
      },
      { status: 500 }
    );
  }
}