import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;
const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

function getGenAI(): GoogleGenerativeAI {
  if (genAI) return genAI;
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY or GOOGLE_API_KEY in environment variables");
  }
  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function generateText(
  prompt: string,
  options?: { 
    systemInstruction?: string;
    conversationHistory?: Message[];
  }
): Promise<string> {
  try {
    const model = getGenAI().getGenerativeModel({
      model: MODEL,
      ...(options?.systemInstruction ? { systemInstruction: options.systemInstruction } : {}),
    });

    // Build conversation history if provided
    const history = options?.conversationHistory || [];
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }))
    });

    const result = await chat.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate content");
  }
}

// Standalone test function for AI helper
export async function testAIHelper(): Promise<void> {
  const mockMessages: Message[] = [
    { role: 'user', content: 'Hello, how are you?' },
    { role: 'assistant', content: 'I\'m doing well, thank you! How can I help you today?' }
  ];

  try {
    const response = await generateText('What was my previous question?', {
      conversationHistory: mockMessages
    });
    console.log('AI Test Response:', response);
  } catch (error) {
    console.error('AI Test Failed:', error);
  }
}
