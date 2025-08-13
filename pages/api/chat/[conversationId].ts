import type { NextApiRequest, NextApiResponse } from 'next'
import { getDbClient } from '../../../lib/supabaseClient'
import { withCors } from '../../../utils/corsMiddleware'

export default withCors(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { conversationId } = req.query
  if (!conversationId || typeof conversationId !== 'string') {
    return res.status(400).json({ error: 'conversationId required' })
  }

  if (req.method === 'GET') {
    try {
      const db = getDbClient(true)
      const { data, error } = await db
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch history' })
    }
  }

  res.setHeader('Allow', 'GET')
  return res.status(405).json({ error: 'Method not allowed' })
})
