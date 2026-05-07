import { logger } from 'hono/logger'
import { timeout } from 'hono/timeout'
import { renderer } from './renderer'
import { email } from './routers/email'
import { factory } from './factory'

const app = factory.createApp()

app.use(logger())
app.use(timeout(30000))
app.use(renderer)

app.get('/', (c) => {
  return c.render(<h1>Hello!</h1>)
})

app.route('/v1/email', email)

export default app
