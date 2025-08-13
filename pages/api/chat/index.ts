import type { NextApiRequest, NextApiResponse } from "next";
import { generateText } from "../../../lib/gemini";
<<<<<<< HEAD
import { chatDb } from "../../../lib/chatDb";
=======
import { getDbClient } from "../../../lib/supabaseClient";
>>>>>>> da2ea298d9854f32ad5950ea73bf407d6695e00b
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
<<<<<<< HEAD
=======
  res.setHeader("Content-Type", "application/json");
>>>>>>> da2ea298d9854f32ad5950ea73bf407d6695e00b
  if (req.method !== "POST") {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
<<<<<<< HEAD
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
=======
    let { conversationId, message, prompt } = req.body || {};
    // Backward compat: original client sent { prompt }
    if (!message && prompt) message = prompt;

    const db = getDbClient(true);
    if (!conversationId) {
      const { data: conv, error: convErr } = await db.from('chat_conversations').insert({}).select('id').single();
      if (convErr) throw convErr;
      conversationId = conv.id;
    }
    if (typeof conversationId !== 'string') {
      return res.status(400).json({ error: 'conversationId is required' });
    }
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }

    await db.from('chat_messages').insert({ conversation_id: conversationId, role: 'user', content: message });

    const SYSTEM_PROMPT = buildSystemPrompt();
    const aiText = await generateText(message, { systemInstruction: SYSTEM_PROMPT });

    const { data: inserted, error } = await db.from('chat_messages')
      .insert({ conversation_id: conversationId, role: 'assistant', content: aiText })
      .select('*')
      .single();
    if (error) throw error;

    // Include both new (message) and legacy (response) fields for compatibility
    return res.status(200).json({ message: inserted, response: inserted.content, conversationId });
  } catch (err) {
>>>>>>> da2ea298d9854f32ad5950ea73bf407d6695e00b
    handleApiError(res, err);
  }
});
