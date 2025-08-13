import type { NextApiRequest, NextApiResponse } from 'next'
import { chatDb } from '../../../lib/chatDb'
import { withCors } from '../../../utils/corsMiddleware'
import { handleApiError } from '../../../utils/errorHandler'

export default withCors(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const { user_id, title } = req.body

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' })
  }

  try {
    const conversation = await chatDb.createConversation(user_id, title)
    res.status(201).json(conversation)
  } catch (err) {
    handleApiError(res, err)
  }
})
