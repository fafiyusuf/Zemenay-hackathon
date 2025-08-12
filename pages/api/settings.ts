import type { NextApiRequest, NextApiResponse } from 'next'
import { getDbClient } from '../../lib/supabaseClient'
import { withCors } from '../../utils/corsMiddleware'
import { handleApiError } from '../../utils/errorHandler'

export default withCors(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDbClient(true)

  try {
    if (req.method === 'GET') {
      const { data, error } = await db.from('settings').select('*').single()
      if (error) throw error
      res.status(200).json(data)
    } else if (req.method === 'PUT') {
      const payload = req.body || {}
      const { data, error } = await db.from('settings').update(payload).eq('id', 1).select('*').single()
      if (error) throw error
      res.status(200).json(data)
    } else {
      res.setHeader('Allow', 'GET,PUT')
      res.status(405).end('Method Not Allowed')
    }
  } catch (err) {
    handleApiError(res, err)
  }
})
