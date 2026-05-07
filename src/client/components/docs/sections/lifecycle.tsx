import { P, Sub, IC, CodeBlock, FieldTable } from '../primitives'

export function LifecycleSection() {
  return (
    <div className="flex flex-col gap-3">
      <P>Every email moves through the following statuses:</P>
      <FieldTable rows={[
        { field: 'queued',  desc: 'Accepted by the API and enqueued in Cloudflare Queue. Delivery has not been attempted yet.' },
        { field: 'sent',    desc: 'Successfully delivered. The messageId field is populated with the provider message ID.' },
        { field: 'failed',  desc: 'Permanently failed. Check errorCode and errorMessage for the reason.' },
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
        { field: 'E_SENDER_NOT_VERIFIED',         desc: 'Sender domain is not verified in the Cloudflare Email dashboard.' },
        { field: 'E_SENDER_DOMAIN_NOT_AVAILABLE', desc: 'Sender domain is not onboarded to Cloudflare Email Service.' },
        { field: 'E_RECIPIENT_NOT_ALLOWED',       desc: 'Recipient not in the allowed destination list (Cloudflare sandbox mode).' },
        { field: 'E_RECIPIENT_SUPPRESSED',        desc: 'Recipient suppressed due to a prior bounce or spam complaint.' },
        { field: 'E_TOO_MANY_RECIPIENTS',         desc: 'Combined recipients across to, cc, and bcc exceed 50.' },
        { field: 'E_CONTENT_TOO_LARGE',           desc: 'Email content exceeds the maximum allowed size.' },
        { field: 'E_RATE_LIMIT_EXCEEDED',         desc: 'Sending rate limit exceeded. Retried automatically.' },
        { field: 'E_DAILY_LIMIT_EXCEEDED',        desc: 'Daily sending quota reached. Retried the following day.' },
        { field: 'E_DELIVERY_FAILED',             desc: 'Recipient server rejected the message.' },
        { field: 'E_ATTACHMENT_TYPE_NOT_ALLOWED', desc: 'Attachment MIME type is not permitted by Cloudflare.' },
        { field: 'PERMANENTLY_FAILED',            desc: 'Exhausted all Queue retries. Marked failed by the DLQ consumer.' },
      ]} />
    </div>
  )
}
