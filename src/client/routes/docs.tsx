import { createFileRoute, redirect } from '@tanstack/react-router'
import type { ReactNode, ComponentType } from 'react'
import { AppHeader } from '../components/app-header'

export const Route = createFileRoute('/docs')({
  beforeLoad: ({ context }) => {
    if (!context.session) throw redirect({ to: '/sign-in' })
  },
  component: DocsPage,
})

// ─── primitives ─────────────────────────────────────────────────

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-base-200 rounded-lg p-4 text-sm font-mono overflow-x-auto text-base-content/80 leading-relaxed mt-3">
      {children.trim()}
    </pre>
  )
}

function IC({ children }: { children: string }) {
  return (
    <code className="bg-base-200 px-1.5 py-0.5 rounded text-[13px] font-mono text-base-content/80">
      {children}
    </code>
  )
}

function P({ children }: { children: ReactNode }) {
  return <p className="text-sm text-base-content/70 leading-relaxed">{children}</p>
}

function Sub({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] text-base-content/30 uppercase tracking-widest font-medium mt-7 mb-2">
      {children}
    </p>
  )
}

interface FieldRow {
  field: string
  type?: string
  required?: boolean
  desc: string
}

function FieldTable({ rows }: { rows: FieldRow[] }) {
  const hasType = rows.some((r) => r.type)
  return (
    <table className="w-full mt-3">
      <thead>
        <tr>
          <th className="text-left pb-3 text-[11px] text-base-content/30 font-medium uppercase tracking-widest w-[170px]">
            Field
          </th>
          {hasType && (
            <th className="text-left pb-3 text-[11px] text-base-content/30 font-medium uppercase tracking-widest w-[130px]">
              Type
            </th>
          )}
          <th className="text-left pb-3 text-[11px] text-base-content/30 font-medium uppercase tracking-widest">
            Notes
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.field} className="border-t border-base-200">
            <td className="py-2.5 pr-4 align-top">
              <code className="bg-base-200 px-1.5 py-0.5 rounded text-[12px] font-mono text-base-content/80">
                {r.field}
              </code>
              {r.required && (
                <span className="ml-1.5 text-[10px] text-error/60 uppercase tracking-wider font-medium">
                  req
                </span>
              )}
            </td>
            {hasType && (
              <td className="py-2.5 pr-4 align-top">
                <span className="text-sm text-base-content/40 font-mono">{r.type ?? ''}</span>
              </td>
            )}
            <td className="py-2.5 align-top">
              <span className="text-sm text-base-content/60 leading-relaxed">{r.desc}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── section content ─────────────────────────────────────────────

function OverviewSection() {
  return (
    <div className="flex flex-col gap-3">
      <P>
        Cloudflare Emails is a self-hosted transactional email API built on Cloudflare Workers. It delivers messages directly through the Cloudflare Email Sending binding — no Sendgrid, Postmark, or SES required.
      </P>
      <P>
        Sending is asynchronous. When you call <IC>POST /v1/email/send</IC>, the API enqueues the message in a Cloudflare Queue and immediately returns a log ID. A consumer Worker picks it up, calls the Email binding, and updates the log record to <IC>sent</IC> or <IC>failed</IC>.
      </P>
      <P>
        Transient failures are retried automatically with exponential backoff. Permanent errors — such as an unverified sender domain or a suppressed recipient — are logged with a descriptive error code and not retried.
      </P>
      <Sub>Request flow</Sub>
      <CodeBlock>{`Your app
  → POST /v1/email/send
  → Cloudflare Queue (email-send-queue)
  → Consumer Worker → Cloudflare Email binding
  → Recipient inbox

  On failure: retry with backoff → DLQ → marked failed`}</CodeBlock>
    </div>
  )
}

function AuthSection() {
  return (
    <div className="flex flex-col gap-3">
      <P>
        All <IC>/v1/*</IC> endpoints require an API key. Two header conventions are accepted — use whichever fits your HTTP client:
      </P>
      <CodeBlock>{`Authorization: Bearer <your-api-key>
# or
x-api-key: <your-api-key>`}</CodeBlock>
      <Sub>Creating an API key</Sub>
      <P>
        API keys are managed through the Better Auth API. Make an authenticated request (session cookie) to create one:
      </P>
      <CodeBlock>{`POST /api/auth/api-key/create
Content-Type: application/json

{ "name": "production" }`}</CodeBlock>
      <P>
        The response contains a <IC>key</IC> field — this is your API key. Save it immediately; it won't be shown again.
      </P>
      <Sub>Managing keys</Sub>
      <FieldTable rows={[
        { field: 'GET /api/auth/api-key/list', desc: 'List all active keys for your account.' },
        { field: 'POST /api/auth/api-key/delete', desc: 'Revoke a key by its ID.' },
      ]} />
      <P>
        A missing or invalid key returns <IC>401 Unauthorized</IC>.
      </P>
    </div>
  )
}

function SendEmailSection() {
  return (
    <div className="flex flex-col gap-3">
      <P>
        Enqueues a transactional email for async delivery. Returns <IC>202 Accepted</IC> immediately — the email has not been sent yet when the response arrives.
      </P>
      <Sub>Endpoint</Sub>
      <CodeBlock>{`POST /v1/email/send
Content-Type: application/json
x-api-key: <your-api-key>`}</CodeBlock>
      <Sub>Request body</Sub>
      <FieldTable rows={[
        { field: 'to', type: 'Address | Address[]', required: true, desc: 'Recipient address(es). Up to 50 per field.' },
        { field: 'from', type: 'Address', required: true, desc: 'Sender address. Domain must be verified in the Cloudflare Email dashboard.' },
        { field: 'subject', type: 'string', required: true, desc: 'Subject line. Max 998 characters (RFC 5322).' },
        { field: 'html', type: 'string', desc: 'HTML body. At least one of html or text is required.' },
        { field: 'text', type: 'string', desc: 'Plain-text body. At least one of html or text is required.' },
        { field: 'cc', type: 'Address | Address[]', desc: 'CC recipients. Up to 50 addresses.' },
        { field: 'bcc', type: 'Address | Address[]', desc: 'BCC recipients. Up to 50 addresses.' },
        { field: 'replyTo', type: 'Address', desc: 'Reply-To address.' },
        { field: 'attachments', type: 'Attachment[]', desc: 'Up to 20 attachments, 10 MB each. See Attachments.' },
        { field: 'headers', type: 'Record<string, string>', desc: 'Custom email headers. Platform-controlled headers are rejected.' },
        { field: 'delaySeconds', type: 'integer', desc: 'Defer delivery by 0–43 200 seconds (up to 12 hours). See Scheduled Delivery.' },
      ]} />
      <Sub>Example</Sub>
      <CodeBlock>{`const res = await fetch('https://your-worker.workers.dev/v1/email/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key',
  },
  body: JSON.stringify({
    to: 'alice@example.com',
    from: { email: 'hello@yourdomain.com', name: 'Acme' },
    subject: 'Welcome to Acme',
    html: '<p>Thanks for signing up!</p>',
    text: 'Thanks for signing up!',
  }),
})

const { id, status } = await res.json()
// { id: "550e8400-e29b-41d4-a716-...", status: "queued" }`}</CodeBlock>
      <Sub>Response</Sub>
      <FieldTable rows={[
        { field: 'id', type: 'string', desc: 'UUID for this log entry. Use it to poll delivery status via GET /v1/logs/:id.' },
        { field: 'status', type: '"queued"', desc: 'Always queued at this point — delivery is async.' },
      ]} />
      <P>
        Validation errors return <IC>400</IC> with <IC>{'{ error: "Validation failed", issues: [...] }'}</IC>.
      </P>
    </div>
  )
}

function AddressesSection() {
  return (
    <div className="flex flex-col gap-3">
      <P>
        Address fields (<IC>to</IC>, <IC>from</IC>, <IC>cc</IC>, <IC>bcc</IC>, <IC>replyTo</IC>) accept either a plain email string or an object with a display name:
      </P>
      <CodeBlock>{`// plain string
"alice@example.com"

// named address
{ "email": "alice@example.com", "name": "Alice" }

// multiple recipients (to, cc, bcc only — up to 50 each)
["alice@example.com", "bob@example.com"]

// mixed array
[
  "alice@example.com",
  { "email": "bob@example.com", "name": "Bob" }
]`}</CodeBlock>
      <P>
        The combined total of recipients across <IC>to</IC>, <IC>cc</IC>, and <IC>bcc</IC> must not exceed 50 — this is a hard limit imposed by the Cloudflare Email binding.
      </P>
    </div>
  )
}

function AttachmentsSection() {
  return (
    <div className="flex flex-col gap-3">
      <P>
        Each attachment must be base64-encoded and include a MIME type. Up to 20 attachments per email, with a maximum of 10 MB each.
      </P>
      <Sub>Regular attachment</Sub>
      <P>
        Appears in the email's attachment tray. Use <IC>disposition: "attachment"</IC>:
      </P>
      <CodeBlock>{`{
  "disposition": "attachment",
  "filename": "report.pdf",
  "type": "application/pdf",
  "content": "<base64-encoded content>"
}`}</CodeBlock>
      <Sub>Inline attachment</Sub>
      <P>
        Embeds the file inside the HTML body via a <IC>cid:</IC> reference. Useful for images. Requires a <IC>contentId</IC> that you reference in the <IC>src</IC> attribute:
      </P>
      <CodeBlock>{`// Attachment object
{
  "disposition": "inline",
  "contentId": "logo",
  "filename": "logo.png",
  "type": "image/png",
  "content": "<base64-encoded content>"
}

// Reference it in your HTML body
<img src="cid:logo" alt="Logo" />`}</CodeBlock>
      <Sub>Fields</Sub>
      <FieldTable rows={[
        { field: 'disposition', type: 'string', required: true, desc: '"attachment" to appear in the tray, or "inline" to embed in HTML.' },
        { field: 'contentId', type: 'string', desc: 'Required for inline only. Matches the cid: reference in your HTML.' },
        { field: 'filename', type: 'string', required: true, desc: 'File name shown in the email client. Max 255 characters.' },
        { field: 'type', type: 'string', required: true, desc: 'MIME type, e.g. "image/png" or "application/pdf".' },
        { field: 'content', type: 'string', required: true, desc: 'Base64-encoded file content. Max 10 MB per file.' },
      ]} />
    </div>
  )
}

function SchedulingSection() {
  return (
    <div className="flex flex-col gap-3">
      <P>
        Pass <IC>delaySeconds</IC> to defer delivery. The value must be an integer between <IC>0</IC> and <IC>43200</IC> (12 hours).
      </P>
      <CodeBlock>{`{
  "to": "alice@example.com",
  "from": "hello@yourdomain.com",
  "subject": "Your weekly digest",
  "html": "<p>Here's what happened this week.</p>",
  "delaySeconds": 3600
}`}</CodeBlock>
      <P>
        The log entry is created immediately with status <IC>queued</IC>, but the consumer Worker won't process it until the delay has elapsed. This is implemented using Cloudflare Queue's native delayed delivery — no polling required on your end.
      </P>
      <P>
        Omitting <IC>delaySeconds</IC> sends as soon as a consumer picks up the message, typically within seconds.
      </P>
    </div>
  )
}

function LifecycleSection() {
  return (
    <div className="flex flex-col gap-3">
      <P>Every email moves through the following statuses:</P>
      <FieldTable rows={[
        { field: 'queued', desc: 'Accepted by the API and enqueued in Cloudflare Queue. Delivery has not been attempted yet.' },
        { field: 'sent', desc: 'Successfully delivered. The messageId field is populated with the provider message ID.' },
        { field: 'failed', desc: 'Permanently failed. Check errorCode and errorMessage for the reason.' },
        { field: 'pending', desc: 'Transitional state set on log creation. Advances to queued immediately in normal operation.' },
      ]} />
      <Sub>Retry policy</Sub>
      <P>
        Transient errors (rate limits, 5xx responses from the binding) are retried with exponential backoff:
      </P>
      <CodeBlock>{`Attempt 1 → wait  30 s → retry
Attempt 2 → wait  60 s → retry
Attempt 3 → wait 120 s → retry
Attempt 4 → wait 240 s → retry
...          (delay capped at 12 h)`}</CodeBlock>
      <P>
        Permanent errors (bad sender domain, suppressed recipient, oversized content) are not retried — the log is marked <IC>failed</IC> immediately with the appropriate error code.
      </P>
      <Sub>Dead-letter queue</Sub>
      <P>
        If a message exhausts all Cloudflare Queue retries, it is routed to the dead-letter queue. A DLQ consumer marks the log as <IC>failed</IC> with <IC>errorCode: "PERMANENTLY_FAILED"</IC>.
      </P>
      <Sub>Error codes</Sub>
      <FieldTable rows={[
        { field: 'E_SENDER_NOT_VERIFIED', desc: 'Sender domain is not verified in the Cloudflare Email dashboard.' },
        { field: 'E_SENDER_DOMAIN_NOT_AVAILABLE', desc: 'Sender domain is not onboarded to Cloudflare Email Service.' },
        { field: 'E_RECIPIENT_NOT_ALLOWED', desc: 'Recipient not in the allowed destination list (Cloudflare sandbox mode).' },
        { field: 'E_RECIPIENT_SUPPRESSED', desc: 'Recipient suppressed due to a prior bounce or spam complaint.' },
        { field: 'E_TOO_MANY_RECIPIENTS', desc: 'Combined recipients across to, cc, and bcc exceed 50.' },
        { field: 'E_CONTENT_TOO_LARGE', desc: 'Email content exceeds the maximum allowed size.' },
        { field: 'E_RATE_LIMIT_EXCEEDED', desc: 'Sending rate limit exceeded. Retried automatically.' },
        { field: 'E_DAILY_LIMIT_EXCEEDED', desc: 'Daily sending quota reached. Retried the following day.' },
        { field: 'E_DELIVERY_FAILED', desc: 'Recipient server rejected the message.' },
        { field: 'E_ATTACHMENT_TYPE_NOT_ALLOWED', desc: 'Attachment MIME type is not permitted by Cloudflare.' },
        { field: 'PERMANENTLY_FAILED', desc: 'Exhausted all Queue retries. Marked failed by the DLQ consumer.' },
      ]} />
    </div>
  )
}

function LogsApiSection() {
  return (
    <div className="flex flex-col gap-3">
      <P>
        The Logs API gives you programmatic access to delivery history. All endpoints require authentication.
      </P>
      <Sub>List logs</Sub>
      <CodeBlock>{`GET /v1/logs?status=sent&limit=50&offset=0`}</CodeBlock>
      <FieldTable rows={[
        { field: 'status', type: 'string', desc: 'Filter by status: pending, queued, sent, or failed.' },
        { field: 'limit', type: 'integer', desc: 'Results per page. Range 1–100, default 20.' },
        { field: 'offset', type: 'integer', desc: 'Pagination offset. Default 0.' },
      ]} />
      <CodeBlock>{`// Response
{
  "data": [ /* EmailLog[] */ ],
  "total": 1024,
  "limit": 50,
  "offset": 0
}`}</CodeBlock>
      <Sub>Get a single log</Sub>
      <CodeBlock>{`GET /v1/logs/:id`}</CodeBlock>
      <P>
        Returns the full log record or <IC>404</IC> if not found. Use this to poll delivery status after sending — check until <IC>status</IC> is <IC>sent</IC> or <IC>failed</IC>.
      </P>
      <Sub>Stats</Sub>
      <CodeBlock>{`GET /v1/logs/stats`}</CodeBlock>
      <P>
        Returns aggregate totals and a daily breakdown ordered newest-first. The dashboard uses the last 28 days.
      </P>
      <CodeBlock>{`{
  "totals": {
    "total": 1024,
    "sent": 980,
    "failed": 12,
    "pending": 2,
    "queued": 30
  },
  "daily": [
    { "date": "2026-05-07", "total": 42, "sent": 40, "failed": 2 },
    { "date": "2026-05-06", "total": 38, "sent": 38, "failed": 0 }
  ]
}`}</CodeBlock>
    </div>
  )
}

// ─── section registry ────────────────────────────────────────────
// Add a new entry here to create a new docs section.

interface DocSection {
  id: string
  label: string
  Content: ComponentType
}

const SECTIONS: DocSection[] = [
  { id: 'overview',        label: 'Overview',          Content: OverviewSection },
  { id: 'authentication',  label: 'Authentication',    Content: AuthSection },
  { id: 'send-email',      label: 'Send an Email',     Content: SendEmailSection },
  { id: 'addresses',       label: 'Addresses',         Content: AddressesSection },
  { id: 'attachments',     label: 'Attachments',       Content: AttachmentsSection },
  { id: 'scheduling',      label: 'Scheduled Delivery',Content: SchedulingSection },
  { id: 'lifecycle',       label: 'Delivery & Retries',Content: LifecycleSection },
  { id: 'logs-api',        label: 'Logs API',          Content: LogsApiSection },
]

// ─── page ────────────────────────────────────────────────────────

function DocsPage() {
  const { session } = Route.useRouteContext()
  const { name, email } = session!.user

  return (
    <div className="min-h-screen bg-base-100">
      <AppHeader name={name} email={email} />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-[11px] text-base-content/40 uppercase tracking-widest font-medium mb-2">
            Documentation
          </p>
          <p className="text-sm text-base-content/50 leading-relaxed max-w-md">
            API reference and guides for sending transactional email with Cloudflare Emails.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-[180px_1fr] lg:gap-16">
          {/* sticky TOC — desktop only */}
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <p className="text-[11px] text-base-content/30 uppercase tracking-widest font-medium mb-4">
                Contents
              </p>
              <nav className="flex flex-col gap-3">
                {SECTIONS.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="text-sm text-base-content/45 hover:text-base-content transition-colors"
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* content */}
          <div className="flex flex-col min-w-0">
            {SECTIONS.map((s, i) => (
              <div key={s.id}>
                {i > 0 && <div className="border-t border-base-200 my-10" />}
                <section id={s.id} className="scroll-mt-6">
                  <p className="text-[11px] text-base-content/40 uppercase tracking-widest font-medium mb-5">
                    {s.label}
                  </p>
                  <s.Content />
                </section>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
