import type { NextApiRequest, NextApiResponse } from 'next'

export type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => void | NextApiResponse | Promise<void | NextApiResponse>

export function withCors(handler: ApiHandler) {
  return async function (req: NextApiRequest, res: NextApiResponse): Promise<void> {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (req.method === 'OPTIONS') {
      res.status(200).end()
      return
    }

    await handler(req, res)
  }
}
