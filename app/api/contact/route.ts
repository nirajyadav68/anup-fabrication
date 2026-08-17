import { NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form for errors.", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const supabase = createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    message: parsed.data.message,
  });

  if (error) {
    console.error("Failed to save contact message:", error.message);
    return NextResponse.json(
      { error: "Could not send your message right now. Please try again or contact us on WhatsApp." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
