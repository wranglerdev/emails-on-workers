import { Hono } from 'hono'
import { renderer } from './renderer'
import { email } from './routers/email'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.use(renderer)

app.get('/', (c) => {
  return c.render(<h1>Hello!</h1>)
})

app.route('/v1/email', email)

export default app
