import type { NextApiResponse } from 'next'

export function handleApiError(res: NextApiResponse, err: unknown) {
  const status = (err as any)?.status || 500
  const message = (err as any)?.message || 'Internal Server Error'
  console.error('[api] error:', err)
  res.status(status).json({ error: message })
}
