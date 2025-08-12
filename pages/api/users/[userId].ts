import type { NextApiRequest, NextApiResponse } from 'next'
import { getDbClient } from '../../../lib/supabaseClient'
import { withCors } from '../../../utils/corsMiddleware'
import { handleApiError } from '../../../utils/errorHandler'

export default withCors(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDbClient(true)
  const { userId } = req.query
  if (typeof userId !== 'string') return res.status(400).json({ error: 'userId required' })

  try {
    if (req.method === 'GET') {
      const { data, error } = await db
        .from('users')
        .select('id, username, email, role, created_at, updated_at')
        .eq('id', userId)
        .single()
      if (error) throw error
      res.status(200).json(data)
    } else if (req.method === 'PUT') {
      const { username, email, role } = req.body
      const { data, error } = await db
        .from('users')
        .update({ username, email, role, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select('id, username, email, role, created_at, updated_at')
        .single()
      if (error) throw error
      res.status(200).json(data)
    } else if (req.method === 'DELETE') {
      const { error } = await db.from('users').delete().eq('id', userId)
      if (error) throw error
      res.status(204).end()
    } else {
      res.setHeader('Allow', 'GET,PUT,DELETE')
      res.status(405).end('Method Not Allowed')
    }
  } catch (err) {
    handleApiError(res, err)
  }
})
