import { sendRequestSchema } from '../schemas/email'
import { factory } from '../factory'
import { createDb } from '../db'
import { emailLogs } from '../db/schema'

const email = factory.createApp()

email.post('/send', async (c) => {
  const raw = await c.req.json()
  const parsed = sendRequestSchema.safeParse(raw)

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', issues: parsed.error.issues }, 400)
  }

  const { delaySeconds, ...emailPayload } = parsed.data
  const db = createDb(c.env.DB)
  const id = crypto.randomUUID()

  await db.insert(emailLogs).values({
    id,
    status: 'queued',
    toAddresses: JSON.stringify(emailPayload.to),
    fromAddress: JSON.stringify(emailPayload.from),
    subject: emailPayload.subject,
    createdAt: new Date(),
  })

  await c.env.EMAIL_QUEUE.send(
    { logId: id, email: emailPayload },
    delaySeconds !== undefined ? { delaySeconds } : undefined,
  )

  return c.json({ id, status: 'queued' }, 202)
})

export { email }
