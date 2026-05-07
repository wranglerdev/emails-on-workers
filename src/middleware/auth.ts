import { factory } from '../factory'
import { createAuth } from '../lib/auth'

export const requireAuth = factory.createMiddleware(async (c, next) => {
  const baseURL = new URL(c.req.url).origin
  const auth = createAuth(c.env, baseURL)

  // Better Auth's apiKey plugin reads x-api-key when enableSessionForAPIKeys is true.
  // Mirror Authorization: Bearer to x-api-key so both header conventions work.
  const headers = new Headers(c.req.raw.headers)
  const bearer = headers.get('Authorization')?.slice(7)
  if (bearer && !headers.has('x-api-key')) {
    headers.set('x-api-key', bearer)
  }

  const result = await auth.api.getSession({ headers })

  if (!result) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('user', result.user)
  c.set('session', result.session)
  await next()
})
