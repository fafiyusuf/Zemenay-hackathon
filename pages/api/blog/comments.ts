import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbClient } from '../../../lib/supabaseClient';
import { withCors } from '../../../utils/corsMiddleware';
import { handleApiError } from '../../../utils/errorHandler';

export default withCors(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDbClient(true);
  const { postId } = req.query;

  try {
    if (req.method === 'GET') {
      // Get comments for a specific post
      if (typeof postId !== 'string') {
        return res.status(400).json({ error: 'postId is required' });
      }

      const { data, error } = await db
        .from('blog_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      res.status(200).json(data || []);
    } else if (req.method === 'POST') {
      // Add a comment to a post
      const { post_id, author, content } = req.body;

      if (!post_id || !content) {
        return res.status(400).json({ error: 'post_id and content are required' });
      }

      const { data, error } = await db
        .from('blog_comments')
        .insert({
          post_id,
          author: author || 'Anonymous',
          content,
          created_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } else {
      res.setHeader('Allow', 'GET,POST');
      res.status(405).end('Method Not Allowed');
    }
  } catch (err) {
    handleApiError(res, err);
  }
});
