import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // --------------------------------------------------
    // ADMIN AUTHENTICATION
    // --------------------------------------------------

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------------------------
    // REQUEST DATA
    // --------------------------------------------------

    const body = await request.json();

    const quoteId = String(
      body.quoteId || ""
    ).trim();

    const customerId = String(
      body.customerId || ""
    ).trim();

    if (!quoteId || !customerId) {
      return NextResponse.json(
        {
          error:
            "Quote ID and customer ID are required.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // GET QUOTE
    // --------------------------------------------------

    const {
      data: quote,
      error: quoteError,
    } = await supabase
      .from("quotes")
      .select(`
        id,
        quote_number,
        customer_id,
        customer_name,
        product_or_project,
        service_type,
        material,
        approximate_size,
        quantity,
        estimated_price,
        budget,
        description,
        status
      `)
      .eq("id", quoteId)
      .single();

    if (quoteError || !quote) {
      console.error(
        "Quote lookup error:",
        quoteError
      );

      return NextResponse.json(
        {
          error: "Quote not found.",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // CUSTOMER / QUOTE SECURITY CHECK
    // --------------------------------------------------

    if (
      !quote.customer_id ||
      quote.customer_id !== customerId
    ) {
      return NextResponse.json(
        {
          error:
            "Customer does not match this quote.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // ONLY APPROVED QUOTES
    // --------------------------------------------------

    if (quote.status !== "approved") {
      return NextResponse.json(
        {
          error:
            "Only approved quotes can be converted into orders.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // CHECK DUPLICATE ORDER
    // --------------------------------------------------

    const {
      data: existingOrder,
      error: existingOrderError,
    } = await supabase
      .from("orders")
      .select("id, order_number")
      .eq("quote_id", quoteId)
      .maybeSingle();

    if (existingOrderError) {
      console.error(
        "Existing order check error:",
        existingOrderError
      );

      return NextResponse.json(
        {
          error:
            "Could not check existing orders.",
        },
        {
          status: 500,
        }
      );
    }

    if (existingOrder) {
      return NextResponse.json(
        {
          error: `This quote is already converted into order ${existingOrder.order_number}.`,
          orderId: existingOrder.id,
          orderNumber:
            existingOrder.order_number,
        },
        {
          status: 409,
        }
      );
    }

    // --------------------------------------------------
    // ORDER TOTAL
    // --------------------------------------------------

    const orderTotal =
      quote.estimated_price !== null &&
      quote.estimated_price !== undefined
        ? Number(quote.estimated_price)
        : quote.budget !== null &&
            quote.budget !== undefined
          ? Number(quote.budget)
          : null;

    // --------------------------------------------------
    // ORDER NOTES
    // --------------------------------------------------

    const orderNotes = [
      `Created from quote ${quote.quote_number}.`,

      quote.product_or_project
        ? `Project: ${quote.product_or_project}.`
        : "",

      quote.service_type
        ? `Service: ${quote.service_type}.`
        : "",

      quote.material
        ? `Material: ${quote.material}.`
        : "",

      quote.description
        ? `Description: ${quote.description}`
        : "",
    ]
      .filter(Boolean)
      .join(" ");

    // --------------------------------------------------
    // CREATE ORDER
    // --------------------------------------------------

    const {
      data: order,
      error: orderError,
    } = await supabase
      .from("orders")
      .insert({
        customer_id: customerId,
        quote_id: quoteId,
        status: "pending",
        payment_status: "pending",
        total: orderTotal,
        notes: orderNotes,
      })
      .select(
        "id, order_number"
      )
      .single();

    if (orderError || !order) {
      console.error(
        "Create order error:",
        orderError
      );

      return NextResponse.json(
        {
          error:
            orderError?.message ||
            "Failed to create order.",
        },
        {
          status: 500,
        }
      );
    }

    // --------------------------------------------------
    // CREATE ORDER ITEM
    // --------------------------------------------------

    const itemDescription = [
      quote.product_or_project,
      quote.service_type,

      quote.material
        ? `Material: ${quote.material}`
        : "",

      quote.approximate_size
        ? `Size: ${quote.approximate_size}`
        : "",
    ]
      .filter(Boolean)
      .join(" • ");

    const quantity =
      quote.quantity &&
      quote.quantity > 0
        ? quote.quantity
        : 1;

    const unitPrice =
      orderTotal !== null
        ? orderTotal / quantity
        : null;

    const {
      error: itemError,
    } = await supabase
      .from("order_items")
      .insert({
        order_id: order.id,
        description:
          itemDescription ||
          `Quote ${quote.quote_number}`,
        quantity,
        unit_price: unitPrice,
        total_price: orderTotal,
      });

    // --------------------------------------------------
    // ROLLBACK IF ITEM CREATION FAILS
    // --------------------------------------------------

    if (itemError) {
      console.error(
        "Create order item error:",
        itemError
      );

      await supabase
        .from("orders")
        .delete()
        .eq("id", order.id);

      return NextResponse.json(
        {
          error:
            itemError.message ||
            "Failed to create order item.",
        },
        {
          status: 500,
        }
      );
    }

    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Convert quote to order error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error.",
      },
      {
        status: 500,
      }
    );
  }
}