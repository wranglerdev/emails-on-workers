import { createFileRoute, redirect, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { AppHeader } from '../components/app-header'
import {
  logsPageQueryOptions,
  PAGE_SIZE,
  type EmailLog,
  type EmailStatus,
} from '../lib/logs-queries'

const STATUS_FILTERS = [
  { value: undefined, label: 'All' },
  { value: 'sent' as const, label: 'Sent' },
  { value: 'failed' as const, label: 'Failed' },
  { value: 'queued' as const, label: 'Queued' },
  { value: 'pending' as const, label: 'Pending' },
]

const STATUS_COLOR: Record<EmailStatus, string> = {
  sent: 'bg-success',
  failed: 'bg-error',
  queued: 'bg-warning',
  pending: 'bg-base-content/25',
}

export const Route = createFileRoute('/logs')({
  validateSearch: (search: Record<string, unknown>) => ({
    page: Math.max(1, Number(search.page) || 1),
    status: (['sent', 'failed', 'queued', 'pending'].includes(search.status as string)
      ? (search.status as EmailStatus)
      : undefined),
  }),
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: '/sign-in' })
  },
  loader: ({ context, deps }) => {
    const { page, status } = deps as { page: number; status?: EmailStatus }
    return context.queryClient.ensureQueryData(logsPageQueryOptions(page, status))
  },
  loaderDeps: ({ search }) => ({ page: search.page, status: search.status }),
  pendingComponent: Pending,
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <p className="text-sm text-error">{(error as Error).message}</p>
    </div>
  ),
  component: LogsPage,
})

// ─── helpers ────────────────────────────────────────────────────

function relativeTime(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  if (s < 3_600) return `${Math.floor(s / 60)}m ago`
  if (s < 86_400) return `${Math.floor(s / 3_600)}h ago`
  if (s < 604_800) return `${Math.floor(s / 86_400)}d ago`
  return new Date(ts).toLocaleDateString()
}

function parseFirstRecipient(json: string): string {
  try {
    const v = JSON.parse(json)
    return String(Array.isArray(v) ? v[0] : v)
  } catch {
    return json
  }
}

// ─── sub-components ─────────────────────────────────────────────

function Pending() {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <span className="loading loading-spinner loading-md text-base-content/30" />
    </div>
  )
}

function StatusBadge({ status }: { status: EmailStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLOR[status]}`} />
      <span className="text-sm text-base-content/60 capitalize">{status}</span>
    </span>
  )
}

function LogRow({ log }: { log: EmailLog }) {
  const recipient = parseFirstRecipient(log.toAddresses)
  const ts = log.sentAt ?? log.createdAt

  return (
    <tr className="border-t border-base-200 group">
      <td className="py-3 pr-6">
        <span
          className="text-sm block truncate max-w-[260px] group-hover:text-base-content transition-colors"
          title={log.subject}
        >
          {log.subject}
        </span>
        {log.status === 'failed' && log.errorMessage && (
          <span className="text-[11px] text-error/70 block mt-0.5 truncate max-w-[260px]">
            {log.errorMessage}
          </span>
        )}
      </td>
      <td className="py-3 pr-6">
        <span className="text-sm text-base-content/50 block truncate max-w-[180px]" title={recipient}>
          {recipient}
        </span>
      </td>
      <td className="py-3 pr-6">
        <span className="text-sm text-base-content/50 block truncate max-w-[180px]" title={log.fromAddress}>
          {log.fromAddress}
        </span>
      </td>
      <td className="py-3 pr-6">
        <StatusBadge status={log.status} />
      </td>
      <td className="py-3 text-right">
        <span className="text-sm text-base-content/35 tabular-nums whitespace-nowrap">
          {relativeTime(ts)}
        </span>
      </td>
    </tr>
  )
}

function StatusFilter({
  active,
  onSelect,
}: {
  active: EmailStatus | undefined
  onSelect: (s: EmailStatus | undefined) => void
}) {
  return (
    <div className="flex items-center gap-5">
      {STATUS_FILTERS.map(({ value, label }) => {
        const isActive = active === value
        return (
          <button
            key={label}
            onClick={() => onSelect(value)}
            className={`text-[11px] uppercase tracking-widest font-medium transition-colors ${
              isActive ? 'text-base-content' : 'text-base-content/35 hover:text-base-content/60'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function Pagination({
  page,
  total,
  onPrev,
  onNext,
}: {
  page: number
  total: number
  onPrev: () => void
  onNext: () => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="flex items-center justify-between pt-4 border-t border-base-200">
      <span className="text-[11px] text-base-content/35 tabular-nums">
        Page {page} of {totalPages} &middot; {total.toLocaleString()} total
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={page <= 1}
          className="btn btn-ghost btn-sm px-3 disabled:opacity-30"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Prev
        </button>
        <button
          onClick={onNext}
          disabled={page >= totalPages}
          className="btn btn-ghost btn-sm px-3 disabled:opacity-30"
        >
          Next
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── page ────────────────────────────────────────────────────────

function LogsPage() {
  const { session } = Route.useRouteContext()
  const { name, email } = session!.user
  const { page, status } = Route.useSearch()
  const navigate = useNavigate({ from: '/logs' })

  const { data } = useQuery(logsPageQueryOptions(page, status))
  const logs = data?.data ?? []
  const total = data?.total ?? 0

  function setStatus(s: EmailStatus | undefined) {
    navigate({ search: { page: 1, status: s } })
  }

  function goTo(p: number) {
    navigate({ search: (prev) => ({ ...prev, page: p }) })
  }

  return (
    <div className="min-h-screen bg-base-100">
      <AppHeader name={name} email={email} />

      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">
        <section>
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-baseline gap-6">
              <p className="text-[11px] text-base-content/40 uppercase tracking-widest font-medium">
                Logs
              </p>
              <StatusFilter active={status} onSelect={setStatus} />
            </div>
            <Link
              to="/"
              className="text-[11px] text-base-content/35 hover:text-base-content/60 transition-colors uppercase tracking-widest font-medium"
            >
              Dashboard
            </Link>
          </div>

          {logs.length === 0 ? (
            <p className="text-sm text-base-content/30 py-6">No emails found.</p>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left pb-3 text-[11px] text-base-content/30 font-medium uppercase tracking-widest">
                      Subject
                    </th>
                    <th className="text-left pb-3 text-[11px] text-base-content/30 font-medium uppercase tracking-widest">
                      To
                    </th>
                    <th className="text-left pb-3 text-[11px] text-base-content/30 font-medium uppercase tracking-widest">
                      From
                    </th>
                    <th className="text-left pb-3 text-[11px] text-base-content/30 font-medium uppercase tracking-widest">
                      Status
                    </th>
                    <th className="text-right pb-3 text-[11px] text-base-content/30 font-medium uppercase tracking-widest">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <LogRow key={log.id} log={log} />
                  ))}
                </tbody>
              </table>

              <Pagination
                page={page}
                total={total}
                onPrev={() => goTo(page - 1)}
                onNext={() => goTo(page + 1)}
              />
            </>
          )}
        </section>
      </main>
    </div>
  )
}
