import { Hono } from 'hono'
import { z } from 'zod'

const sendBodySchema = z.object({
  to: z.union([z.email(), z.array(z.email()).min(1)]),
  from: z.object({
    email: z.email(),
    name: z.string().optional(),
  }),
  subject: z.string().min(1),
  html: z.string().optional(),
  text: z.string().optional(),
})

const email = new Hono<{ Bindings: CloudflareBindings }>()

email.post('/send', async (c) => {
  const raw = await c.req.json()
  const parsed = sendBodySchema.safeParse(raw)

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', issues: parsed.error.issues }, 400)
  }

  const { to, from, subject, html, text } = parsed.data

  try {
    const result = await c.env.EMAIL.send({ to, from, subject, html, text })
    return c.json({ messageId: result.messageId })
  } catch (err: any) {
    return c.json({ error: err.code ?? 'UNKNOWN_ERROR', message: err.message }, 500)
  }
})

export { email }
