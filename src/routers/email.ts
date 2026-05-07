import { emailErrorMap, type EmailBindingError } from '../errors/email'
import { sendBodySchema } from '../schemas/email'
import { factory } from '../factory'

const email = factory.createApp()

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
    const e = err as EmailBindingError
    const code = e.code ?? 'UNKNOWN_ERROR'
    const mapped = emailErrorMap[code]
    return c.json(
      { error: code, message: mapped?.message ?? e.message },
      mapped?.status ?? 500,
    )
  }
})

export { email }
