import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { apiKey } from '@better-auth/api-key'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../db/schema'

export function createAuth(env: CloudflareBindings) {
  return betterAuth({
    database: drizzleAdapter(drizzle(env.DB, { schema }), {
      provider: 'sqlite',
    }),
    secret: env.BETTER_AUTH_SECRET,
    basePath: '/api/auth',
    emailAndPassword: { enabled: true },
    plugins: [apiKey({ enableSessionForAPIKeys: true })],
  })
}

export type Auth = ReturnType<typeof createAuth>
export type User = Auth['$Infer']['Session']['user']
export type Session = Auth['$Infer']['Session']['session']
