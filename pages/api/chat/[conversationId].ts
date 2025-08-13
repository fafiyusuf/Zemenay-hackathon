import type { NextApiRequest, NextApiResponse } from 'next';
import { chatDb } from '../../../lib/chatDb';
import { withCors } from '../../../utils/corsMiddleware';
import { handleApiError } from '../../../utils/errorHandler';

export default withCors(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { conversationId } = req.query;
  const { userId } = req.body;

  if (typeof conversationId !== 'string') {
    return res.status(400).json({ error: 'conversationId is required' });
  }

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    if (req.method === 'GET') {
      // Get conversation history
      const messages = await chatDb.getConversationHistory(conversationId, userId);
      res.status(200).json(messages);
    } else if (req.method === 'PUT') {
      // Update conversation title
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'title is required' });
      }
      const conversation = await chatDb.updateConversationTitle(conversationId, userId, title);
      res.status(200).json(conversation);
    } else if (req.method === 'DELETE') {
      // Delete conversation
      await chatDb.deleteConversation(conversationId, userId);
      res.status(204).end();
    } else {
      res.setHeader('Allow', 'GET,PUT,DELETE');
      res.status(405).end('Method Not Allowed');
    }
  } catch (err) {
    handleApiError(res, err);
  }
});
