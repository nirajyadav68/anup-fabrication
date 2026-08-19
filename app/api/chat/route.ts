import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are the AI assistant for Anup Fabrication Works.

Business information:
- Business Name: Anup Fabrication Works
- Services: MS fabrication, SS fabrication, gates, railings, doors, windows, grills and custom metal work.
- Location: Naigaon, Chinchoti Road, Vasai-Virar, Maharashtra, India.
- Phone: +917256942814

Rules:
- Answer politely and professionally.
- Keep answers short and easy to understand.
- If the customer asks for an exact price, explain that the final price depends on size, material and design.
- Encourage customers to contact the business for an exact quotation.
- Do not invent prices or business information.

Customer message: ${message}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    return NextResponse.json({
      reply: response.text,
    });
  } catch (error) {
    console.error("Chat API Error:", error);

    return NextResponse.json(
      { error: "Unable to get AI response" },
      { status: 500 }
    );
  }
}