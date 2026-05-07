import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { AppHeader } from '../components/app-header'
import {
  statsQueryOptions,
  recentLogsQueryOptions,
  type EmailLog,
  type DailyStats,
  type EmailStatus,
} from '../lib/logs-queries'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: '/sign-in' })
  },
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(statsQueryOptions),
      context.queryClient.ensureQueryData(recentLogsQueryOptions),
    ]),
  pendingComponent: Pending,
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <p className="text-sm text-error">{(error as Error).message}</p>
    </div>
  ),
  component: Dashboard,
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

function fmt(n: number | undefined): string {
  return n == null ? '—' : n.toLocaleString()
}

// ─── sub-components ─────────────────────────────────────────────

function Pending() {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <span className="loading loading-spinner loading-md text-base-content/30" />
    </div>
  )
}

function StatBlock({
  label,
  value,
  muted,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className={`text-3xl font-semibold tabular-nums tracking-tight${muted ? ' text-base-content/30' : ''}`}
      >
        {value}
      </span>
      <span className="text-[11px] text-base-content/40 uppercase tracking-widest font-medium">
        {label}
      </span>
    </div>
  )
}

const STATUS_COLOR: Record<EmailStatus, string> = {
  sent: 'bg-success',
  failed: 'bg-error',
  pending: 'bg-base-content/25',
}

function StatusBadge({ status }: { status: EmailStatus }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLOR[status]}`} />
      <span className="text-sm text-base-content/60">{label}</span>
    </span>
  )
}

function ActivityChart({ daily }: { daily: DailyStats[] }) {
  // API returns DESC; take last 28 days and reverse to chronological order
  const data = daily.slice(0, 28).reverse()

  if (!data.length) {
    return (
      <p className="text-sm text-base-content/30 py-8">No activity yet.</p>
    )
  }

  const maxTotal = Math.max(...data.map((d) => d.total), 1)

  return (
    <div>
      <div className="flex items-end gap-[3px] h-14">
        {data.map((day) => {
          const barPct = Math.max((day.total / maxTotal) * 100, 3)
          const errPct = day.total > 0 ? (day.failed / day.total) * 100 : 0
          return (
            <div
              key={day.date}
              className="flex-1 relative"
              style={{ height: `${barPct}%` }}
              title={`${day.date}: ${day.sent} sent, ${day.failed} failed`}
            >
              <div className="absolute inset-0 rounded-[2px] bg-base-content/10" />
              {errPct > 0 && (
                <div
                  className="absolute top-0 inset-x-0 rounded-t-[2px] bg-error/50"
                  style={{ height: `${errPct}%` }}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-base-content/30">{data[0].date}</span>
        <span className="text-[10px] text-base-content/30">
          {data[data.length - 1].date}
        </span>
      </div>
    </div>
  )
}

function LogRow({ log }: { log: EmailLog }) {
  const recipient = parseFirstRecipient(log.toAddresses)
  const ts = log.sentAt ?? log.createdAt

  return (
    <tr className="border-t border-base-200 group">
      <td className="py-3 pr-6">
        <span
          className="text-sm block truncate max-w-[280px] group-hover:text-base-content transition-colors"
          title={log.subject}
        >
          {log.subject}
        </span>
        {log.status === 'failed' && log.errorMessage && (
          <span className="text-[11px] text-error/70 block mt-0.5 truncate max-w-[280px]">
            {log.errorMessage}
          </span>
        )}
      </td>
      <td className="py-3 pr-6">
        <span className="text-sm text-base-content/50 block truncate max-w-[200px]">
          {recipient}
        </span>
      </td>
      <td className="py-3 pr-6">
        <StatusBadge status={log.status} />
      </td>
      <td className="py-3 text-right">
        <span className="text-sm text-base-content/35 tabular-nums">
          {relativeTime(ts)}
        </span>
      </td>
    </tr>
  )
}

// ─── dashboard ──────────────────────────────────────────────────

function Dashboard() {
  const { session } = Route.useRouteContext()
  const { name, email } = session!.user

  const { data: stats } = useQuery(statsQueryOptions)
  const { data: logsData } = useQuery(recentLogsQueryOptions)

  const totals = stats?.totals
  const logs = logsData?.data ?? []

  return (
    <div className="min-h-screen bg-base-100">
      <AppHeader name={name} email={email} />

      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">

        {/* stats */}
        <section>
          <p className="text-[11px] text-base-content/40 uppercase tracking-widest font-medium mb-7">
            Overview
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-10 gap-y-7">
            <StatBlock label="Total" value={fmt(totals?.total)} />
            <StatBlock label="Sent" value={fmt(totals?.sent)} />
            <StatBlock label="Failed" value={fmt(totals?.failed)} />
            <StatBlock label="Pending" value={fmt(totals?.pending)} muted />
          </div>
        </section>

        <div className="border-t border-base-200" />

        {/* activity chart */}
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <p className="text-[11px] text-base-content/40 uppercase tracking-widest font-medium">
              Activity
            </p>
            <span className="text-[11px] text-base-content/25">Last 28 days</span>
          </div>
          <ActivityChart daily={stats?.daily ?? []} />
        </section>

        <div className="border-t border-base-200" />

        {/* recent emails */}
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <p className="text-[11px] text-base-content/40 uppercase tracking-widest font-medium">
              Recent
            </p>
            <Link
              to="/logs"
              className="text-[11px] text-base-content/35 hover:text-base-content/60 transition-colors uppercase tracking-widest font-medium"
            >
              View all
            </Link>
          </div>

          {logs.length === 0 ? (
            <p className="text-sm text-base-content/30 py-6">
              No emails sent yet.
            </p>
          ) : (
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
          )}
        </section>

      </main>
    </div>
  )
}
