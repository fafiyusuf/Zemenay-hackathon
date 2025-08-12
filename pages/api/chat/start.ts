import type { NextApiRequest, NextApiResponse } from 'next'
import { getDbClient } from '../../../lib/supabaseClient'
import { withCors } from '../../../utils/corsMiddleware'
import { handleApiError } from '../../../utils/errorHandler'

export default withCors(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const db = getDbClient(true)
  const { user_id } = req.body

  try {
    const { data, error } = await db.from('chat_conversations').insert({ user_id }).select('*').single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    handleApiError(res, err)
  }
})
