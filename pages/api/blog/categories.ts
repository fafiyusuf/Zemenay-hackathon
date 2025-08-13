import type { NextApiRequest, NextApiResponse } from 'next';
import { getDbClient } from '../../../lib/supabaseClient';
import { withCors } from '../../../utils/corsMiddleware';
import { handleApiError } from '../../../utils/errorHandler';

export default withCors(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDbClient(true);

  try {
    if (req.method === 'GET') {
      // Get all categories
      const { data, error } = await db
        .from('blog_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      res.status(200).json(data || []);
    } else if (req.method === 'POST') {
      // Create new category
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'name is required' });
      }

      const { data, error } = await db
        .from('blog_categories')
        .insert({ 
          name,
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
