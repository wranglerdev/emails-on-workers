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

export const PAGE_SIZE = 20

export interface LogsPage {
  data: EmailLog[]
  total: number
  limit: number
  offset: number
}

export function logsPageQueryOptions(page: number, status?: EmailStatus) {
  const offset = (page - 1) * PAGE_SIZE
  const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) })
  if (status) params.set('status', status)

  return queryOptions({
    queryKey: ['logs', 'page', page, status ?? 'all'] as const,
    queryFn: async (): Promise<LogsPage> => {
      const res = await fetch(`/v1/logs?${params}`)
      if (!res.ok) throw new Error('Failed to load logs')
      return res.json()
    },
    staleTime: 30_000,
  })
}
