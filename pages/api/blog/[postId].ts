import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbClient } from '../../../lib/supabaseClient';
import { withCors } from '../../../utils/corsMiddleware';
import { handleApiError } from '../../../utils/errorHandler';

export default withCors(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDbClient(true);
  const { postId } = req.query;

  if (typeof postId !== 'string') {
    return res.status(400).json({ error: 'postId is required' });
  }

  try {
    if (req.method === 'GET') {
      // Get specific blog post
      const { data, error } = await db
        .from('blog_posts')
        .select(`
          *,
          categories:blog_categories(name),
          comments:blog_comments(*)
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;
      res.status(200).json(data);
    } else if (req.method === 'PUT') {
      // Update blog post
      const { title, content } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: 'title and content are required' });
      }

      const { data, error } = await db
        .from('blog_posts')
        .update({ 
          title, 
          content, 
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select('*')
        .single();

      if (error) throw error;
      res.status(200).json(data);
    } else if (req.method === 'DELETE') {
      // Delete blog post
      const { error } = await db
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      res.status(204).end();
    } else {
      res.setHeader('Allow', 'GET,PUT,DELETE');
      res.status(405).end('Method Not Allowed');
    }
  } catch (err) {
    handleApiError(res, err);
  }
});
