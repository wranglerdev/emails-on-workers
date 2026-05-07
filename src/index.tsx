import { logger } from 'hono/logger'
import { timeout } from 'hono/timeout'
import { email } from './routers/email'
import { logs } from './routers/logs'
import { auth } from './routers/auth'
import { requireAuth } from './middleware/auth'
import { factory } from './factory'
import { handleEmailQueue, handleDlqQueue, type EmailQueueMessage } from './queues/email'

const app = factory.createApp()

app.use(logger())
app.use(timeout(30000))

app.route('/api/auth', auth)

app.use('/v1/*', requireAuth)
app.route('/v1/email', email)
app.route('/v1/logs', logs)

app.notFound((c) => c.json({ error: 'Not Found' }, 404))

export default {
  fetch(req: Request, env: CloudflareBindings, ctx: ExecutionContext) {
    return app.fetch(req, env, ctx)
  },
  async queue(batch: MessageBatch<EmailQueueMessage>, env: CloudflareBindings): Promise<void> {
    if (batch.queue === 'email-send-dlq') {
      return handleDlqQueue(batch, env)
    }
    return handleEmailQueue(batch, env)
  },
}
