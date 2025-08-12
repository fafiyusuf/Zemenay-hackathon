import { NextResponse } from "next/server";
import { generateText } from "../../../lib/gemini";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const text = await generateText(prompt);
    return NextResponse.json({ response: text });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}
