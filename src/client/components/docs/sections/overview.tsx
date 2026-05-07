import { P, Sub, IC, CodeBlock } from '../primitives'

export function OverviewSection() {
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
