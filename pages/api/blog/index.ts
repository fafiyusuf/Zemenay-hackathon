import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbClient } from '../../../lib/supabaseClient';
import { withCors } from '../../../utils/corsMiddleware';
import { handleApiError } from '../../../utils/errorHandler';

export default withCors(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDbClient(true);

  try {
    if (req.method === 'GET') {
      // Get all blog posts
      const { data, error } = await db
        .from('blog_posts')
        .select(`
          *,
          categories:blog_categories(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.status(200).json(data || []);
    } else if (req.method === 'POST') {
      // Create new blog post
      const { title, content, categories } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: 'title and content are required' });
      }

      const { data, error } = await db
        .from('blog_posts')
        .insert({ 
          title, 
          content, 
          author_id: req.body.author_id || 'anonymous',
          created_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) throw error;

      // Handle categories if provided
      if (categories && categories.length > 0) {
        // This would need a junction table implementation
        // For now, we'll just return the post
      }

      res.status(201).json(data);
    } else {
      res.setHeader('Allow', 'GET,POST');
      res.status(405).end('Method Not Allowed');
    }
  } catch (err) {
    handleApiError(res, err);
  }
});
