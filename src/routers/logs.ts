import { desc, eq, sql } from 'drizzle-orm'
import { factory } from '../factory'
import { createDb } from '../db'
import { emailLogs } from '../db/schema'
import { logsQuerySchema } from '../schemas/logs'

const logs = factory.createApp()

logs.get('/', async (c) => {
  const parsed = logsQuerySchema.safeParse(c.req.query())

  if (!parsed.success) {
    return c.json({ error: 'Validation failed', issues: parsed.error.issues }, 400)
  }

  const { status, limit, offset } = parsed.data
  const db = createDb(c.env.DB)

  const where = status ? eq(emailLogs.status, status) : undefined

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(emailLogs)
      .where(where)
      .orderBy(desc(emailLogs.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: sql<number>`COUNT(*)` })
      .from(emailLogs)
      .where(where),
  ])

  return c.json({ data: rows, total, limit, offset })
})

logs.get('/stats', async (c) => {
  const db = createDb(c.env.DB)

  const dateExpr = sql<string>`DATE(${emailLogs.createdAt} / 1000, 'unixepoch')`

  const [daily, totals] = await Promise.all([
    db
      .select({
        date: dateExpr,
        total: sql<number>`COUNT(*)`,
        sent: sql<number>`SUM(CASE WHEN ${emailLogs.status} = 'sent' THEN 1 ELSE 0 END)`,
        failed: sql<number>`SUM(CASE WHEN ${emailLogs.status} = 'failed' THEN 1 ELSE 0 END)`,
      })
      .from(emailLogs)
      .groupBy(dateExpr)
      .orderBy(desc(dateExpr)),

    db
      .select({
        total: sql<number>`COUNT(*)`,
        sent: sql<number>`SUM(CASE WHEN ${emailLogs.status} = 'sent' THEN 1 ELSE 0 END)`,
        failed: sql<number>`SUM(CASE WHEN ${emailLogs.status} = 'failed' THEN 1 ELSE 0 END)`,
        pending: sql<number>`SUM(CASE WHEN ${emailLogs.status} = 'pending' THEN 1 ELSE 0 END)`,
        queued: sql<number>`SUM(CASE WHEN ${emailLogs.status} = 'queued' THEN 1 ELSE 0 END)`,
      })
      .from(emailLogs),
  ])

  return c.json({ totals: totals[0], daily })
})

logs.get('/:id', async (c) => {
  const { id } = c.req.param()
  const db = createDb(c.env.DB)

  const [row] = await db
    .select()
    .from(emailLogs)
    .where(eq(emailLogs.id, id))
    .limit(1)

  if (!row) {
    return c.json({ error: 'Not Found' }, 404)
  }

  return c.json(row)
})

export { logs }
