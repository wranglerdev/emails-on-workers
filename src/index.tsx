import { Hono } from 'hono'
import { renderer } from './renderer'

type Bindings = CloudflareBindings

const app = new Hono<{ Bindings: Bindings }>()

app.use(renderer)

app.get('/', (c) => {
  return c.render(<h1>Hello!</h1>)
})

app.post('/v1/email/send', async (c) => {
  const body = await c.req.json<{
    to: string | string[]
    from: { email: string; name?: string }
    subject: string
    html?: string
    text?: string
  }>()

  if (!body.to || !body.from?.email || !body.subject) {
    return c.json({ error: 'Missing required fields: to, from.email, subject' }, 400)
  }

  try {
    const result = await c.env.EMAIL.send({
      to: body.to,
      from: body.from,
      subject: body.subject,
      html: body.html,
      text: body.text,
    })

    return c.json({ messageId: result.messageId })
  } catch (err: any) {
    return c.json({ error: err.code ?? 'UNKNOWN_ERROR', message: err.message }, 500)
  }
})

export default app
