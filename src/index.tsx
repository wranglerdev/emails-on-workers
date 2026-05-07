import { logger } from 'hono/logger'
import { timeout } from 'hono/timeout'
import { email } from './routers/email'
import { logs } from './routers/logs'
import { auth } from './routers/auth'
import { requireAuth } from './middleware/auth'
import { factory } from './factory'

const app = factory.createApp()

app.use(logger())
app.use(timeout(30000))

app.route('/api/auth', auth)

app.use('/v1/*', requireAuth)
app.route('/v1/email', email)
app.route('/v1/logs', logs)

app.notFound((c) => c.json({ error: 'Not Found' }, 404))

export default app
