import { z } from 'zod'

const logsQuerySchema = z.object({
  status: z.enum(['pending', 'queued', 'sent', 'failed']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export { logsQuerySchema }
