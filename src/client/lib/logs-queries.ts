import { queryOptions } from '@tanstack/react-query'

export type EmailStatus = 'pending' | 'sent' | 'failed'

export interface EmailLog {
  id: string
  status: EmailStatus
  toAddresses: string
  fromAddress: string
  subject: string
  messageId: string | null
  errorCode: string | null
  errorMessage: string | null
  createdAt: number
  sentAt: number | null
}

export interface DailyStats {
  date: string
  total: number
  sent: number
  failed: number
}

export interface LogsStats {
  totals: {
    total: number
    sent: number
    failed: number
    pending: number
  }
  daily: DailyStats[]
}

export const statsQueryOptions = queryOptions({
  queryKey: ['logs', 'stats'] as const,
  queryFn: async (): Promise<LogsStats> => {
    const res = await fetch('/v1/logs/stats')
    if (!res.ok) throw new Error('Failed to load stats')
    return res.json()
  },
  staleTime: 30_000,
})

export const recentLogsQueryOptions = queryOptions({
  queryKey: ['logs', 'recent'] as const,
  queryFn: async (): Promise<{ data: EmailLog[] }> => {
    const res = await fetch('/v1/logs?limit=10')
    if (!res.ok) throw new Error('Failed to load recent emails')
    return res.json()
  },
  staleTime: 30_000,
})
