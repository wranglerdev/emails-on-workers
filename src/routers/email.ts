import { eq } from 'drizzle-orm'
import { emailErrorMap, type EmailBindingError } from '../errors/email'
import { sendBodySchema } from '../schemas/email'
import { factory } from '../factory'
import { createDb } from '../db'
import { emailLogs } from '../db/schema'

const email = factory.createApp()

email.post('/send', async (c) => {
  const raw = await c.req.json()
  const parsed = sendBodySchema.safeParse(raw)

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', issues: parsed.error.issues }, 400)
  }

  const db = createDb(c.env.DB)
  const id = crypto.randomUUID()

  await db.insert(emailLogs).values({
    id,
    status: 'pending',
    toAddresses: JSON.stringify(parsed.data.to),
    fromAddress: JSON.stringify(parsed.data.from),
    subject: parsed.data.subject,
    createdAt: new Date(),
  })

  try {
    const result = await c.env.EMAIL.send(parsed.data)

    await db
      .update(emailLogs)
      .set({ status: 'sent', messageId: result.messageId, sentAt: new Date() })
      .where(eq(emailLogs.id, id))

    return c.json({ messageId: result.messageId })
  } catch (err: unknown) {
    const e = err as EmailBindingError
    const code = e.code ?? 'UNKNOWN_ERROR'
    const mapped = emailErrorMap[code]

    await db
      .update(emailLogs)
      .set({ status: 'failed', errorCode: code, errorMessage: e.message })
      .where(eq(emailLogs.id, id))

    return c.json(
      { error: code, message: mapped?.message ?? e.message },
      mapped?.status ?? 500,
    )
  }
})

export { email }
