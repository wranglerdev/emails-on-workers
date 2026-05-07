import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { emailErrorMap, type EmailBindingError } from '../errors/email'
import { createDb } from '../db'
import { emailLogs } from '../db/schema'
import { sendBodySchema } from '../schemas/email'

export interface EmailQueueMessage {
  logId: string
  email: z.infer<typeof sendBodySchema>
}

export async function handleEmailQueue(
  batch: MessageBatch<EmailQueueMessage>,
  env: CloudflareBindings,
): Promise<void> {
  const db = createDb(env.DB)

  for (const msg of batch.messages) {
    try {
      const result = await env.EMAIL.send(msg.body.email)

      await db
        .update(emailLogs)
        .set({ status: 'sent', messageId: result.messageId, sentAt: new Date() })
        .where(eq(emailLogs.id, msg.body.logId))
        .catch((e) => console.error('db update failed after send', msg.body.logId, e))

      msg.ack()
    } catch (err: unknown) {
      const e = err as EmailBindingError
      const code = e.code ?? 'UNKNOWN_ERROR'
      const mapped = emailErrorMap[code]

      // 4xx errors (except 429 rate-limit) are not worth retrying
      const isPermanent = mapped !== undefined && mapped.status < 500 && mapped.status !== 429

      if (isPermanent) {
        await db
          .update(emailLogs)
          .set({ status: 'failed', errorCode: code, errorMessage: e.message })
          .where(eq(emailLogs.id, msg.body.logId))
          .catch((dbErr) => console.error('db update failed after permanent error', msg.body.logId, dbErr))
        msg.ack()
      } else {
        // Exponential backoff: 30s, 60s, 120s, … capped at 12h
        const delay = Math.min(30 * 2 ** msg.attempts, 43200)
        msg.retry({ delaySeconds: delay })
      }
    }
  }
}

export async function handleDlqQueue(
  batch: MessageBatch<EmailQueueMessage>,
  env: CloudflareBindings,
): Promise<void> {
  const db = createDb(env.DB)

  for (const msg of batch.messages) {
    await db
      .update(emailLogs)
      .set({
        status: 'failed',
        errorCode: 'PERMANENTLY_FAILED',
        errorMessage: 'Message exhausted all retries',
      })
      .where(eq(emailLogs.id, msg.body.logId))
      .catch((e) => console.error('dlq db update failed', msg.body.logId, e))

    msg.ack()
  }
}
