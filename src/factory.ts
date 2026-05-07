import { createFactory } from 'hono/factory'
import type { User, Session } from './lib/auth'

export const factory = createFactory<{
  Bindings: CloudflareBindings
  Variables: {
    user: User
    session: Session
  }
}>()
