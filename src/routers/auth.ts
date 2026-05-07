import { sql } from 'drizzle-orm'
import { factory } from '../factory'
import { createAuth } from '../lib/auth'
import { createDb } from '../db'
import { user as userTable } from '../db/schema'

const auth = factory.createApp()

// First-user-only signup guard. Once any user exists the endpoint is closed.
// Additional users must be managed by the instance owner (future: invite flow).
auth.post('/sign-up/email', async (c, next) => {
  const db = createDb(c.env.DB)
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(userTable)

  if (count > 0) {
    return c.json(
      { error: 'SIGNUP_CLOSED', message: 'Signup is closed. Contact the instance owner.' },
      403,
    )
  }

  return next()
})

auth.all('/*', async (c) => {
  const authInstance = createAuth(c.env)
  return authInstance.handler(c.req.raw)
})

export { auth }
