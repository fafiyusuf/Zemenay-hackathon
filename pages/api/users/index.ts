import type { NextApiRequest, NextApiResponse } from 'next'
import { getDbClient } from '../../../lib/supabaseClient'
import { withCors } from '../../../utils/corsMiddleware'
import { handleApiError } from '../../../utils/errorHandler'
import bcrypt from 'bcryptjs'

export default withCors(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDbClient(true)

  try {
    if (req.method === 'GET') {
      const { data, error } = await db.from('users').select('id, username, email, role, created_at, updated_at')
      if (error) throw error
      res.status(200).json(data)
    } else if (req.method === 'POST') {
      const { username, email, password, role } = req.body
      if (!username || !email || !password) return res.status(400).json({ error: 'username, email, password required' })
      const password_hash = await bcrypt.hash(password, 10)
      const { data, error } = await db
        .from('users')
        .insert({ username, email, password_hash, role })
        .select('id, username, email, role, created_at, updated_at')
        .single()
      if (error) throw error
      res.status(201).json(data)
    } else {
      res.setHeader('Allow', 'GET,POST')
      res.status(405).end('Method Not Allowed')
    }
  } catch (err) {
    handleApiError(res, err)
  }
})
