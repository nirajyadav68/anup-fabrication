import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;

  console.log(
    "Gemini API Key loaded:",
    apiKey ? "YES" : "NO"
  );

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  console.log("\nGemini Response:\n");

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: "Explain Artificial Intelligence in simple words.",
  });

  console.log(response.text);
}

main().catch((error) => {
  console.error("Error:", error);
});