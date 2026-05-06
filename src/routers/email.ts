import { Hono } from 'hono'
import { sendBodySchema } from '../schemas/email'

const email = new Hono<{ Bindings: CloudflareBindings }>()

email.post('/send', async (c) => {
  const raw = await c.req.json()
  const parsed = sendBodySchema.safeParse(raw)

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', issues: parsed.error.issues }, 400)
  }

  try {
    const result = await c.env.EMAIL.send(parsed.data)
    return c.json({ messageId: result.messageId })
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string }
    return c.json({ error: e.code ?? 'UNKNOWN_ERROR', message: e.message }, 500)
  }
})

export { email }
