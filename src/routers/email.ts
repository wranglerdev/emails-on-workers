import { Hono } from 'hono'
import { emailErrorMap } from '../errors/email'
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
    const code = e.code ?? 'UNKNOWN_ERROR'
    const mapped = emailErrorMap[code]
    return c.json(
      { error: code, message: mapped?.message ?? e.message },
      (mapped?.status ?? 500) as 400 | 403 | 413 | 422 | 429 | 500 | 502,
    )
  }
})

export { email }
