import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;
const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

function getGenAI(): GoogleGenerativeAI {
  if (genAI) return genAI;
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY or GOOGLE_API_KEY in environment variables");
  }
  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

export async function generateText(
  prompt: string,
  options?: { systemInstruction?: string }
): Promise<string> {
  try {
    const model = getGenAI().getGenerativeModel({
      model: MODEL,
      ...(options?.systemInstruction ? { systemInstruction: options.systemInstruction } : {}),
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate content");
  }
}
