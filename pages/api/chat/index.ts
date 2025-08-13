import type { NextApiRequest, NextApiResponse } from "next";
import { generateText } from "../../../lib/gemini";
import { chatDb } from "../../../lib/chatDb";
import { withCors } from "../../../utils/corsMiddleware";
import { handleApiError } from "../../../utils/errorHandler";
import { qaExamples } from "../../../utils/qaExamples";

function buildSystemPrompt() {
  const base = `You are the Q^A assistant for a Next.js app using Supabase.
You answer briefly and guide non-technical users with UI steps first (page navigation),
then optionally include API routes for advanced users.

Primary guidance:
- To create a post: go to /blog/new, fill Title and Content, optional Categories, click Create Post.
- To browse posts: go to /blog.
- To edit/delete: open /blog/[id], use Edit or Delete buttons.
- To comment: on a post page, write a comment and click Add Comment.

For developers (optional), the app exposes these endpoints:
GET /api/blog, POST /api/blog { title, content, categories? }
GET /api/blog/[postId], PUT /api/blog/[postId], DELETE /api/blog/[postId]
GET /api/blog/comments?postId=..., POST /api/blog/comments { post_id, author?, content }
GET /api/blog/categories, POST /api/blog/categories { name }

When asked how to create a blog post as a user, show the UI steps; only then a short fetch() example if requested.
Use bullets for steps and keep code minimal.`;

  const examples = qaExamples
    .map((ex, i) => `Example ${i + 1}\nQ: ${ex.question}\nA: ${ex.answer}${ex.followUp ? "\n(Follow-up suggested)" : ""}`)
    .join("\n\n");

  return `${base}\n\nHere are examples of tone and format you should follow:\n\n${examples}`;
}

export default withCors(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, conversationId, userId } = req.body || {};
    
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Save user message to database
    let messageId: string;
    if (conversationId) {
      const userMessage = await chatDb.addMessage(conversationId, userId, 'user', prompt);
      messageId = userMessage.id;
    }

    // Get conversation history for context
    let conversationHistory: any[] = [];
    if (conversationId) {
      conversationHistory = await chatDb.getConversationHistoryForAI(conversationId, userId);
    }

    const SYSTEM_PROMPT = buildSystemPrompt();
    const aiResponse = await generateText(prompt, { 
      systemInstruction: SYSTEM_PROMPT,
      conversationHistory: conversationHistory.length > 0 ? conversationHistory : undefined
    });

    // Save AI response to database
    if (conversationId) {
      await chatDb.addMessage(conversationId, userId, 'assistant', aiResponse);
    }

    return res.status(200).json({ 
      response: aiResponse,
      conversationId,
      messageId
    });
  } catch (err) {
    console.error("/api/chat error:", err);
    handleApiError(res, err);
  }
});
