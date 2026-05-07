import { P, Sub, IC, CodeBlock, FieldTable } from '../primitives'

export function SendEmailSection() {
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
        { field: 'to',           type: 'Address | Address[]',    required: true, desc: 'Recipient address(es). Up to 50 per field.' },
        { field: 'from',         type: 'Address',                required: true, desc: 'Sender address. Domain must be verified in the Cloudflare Email dashboard.' },
        { field: 'subject',      type: 'string',                 required: true, desc: 'Subject line. Max 998 characters (RFC 5322).' },
        { field: 'html',         type: 'string',                                 desc: 'HTML body. At least one of html or text is required.' },
        { field: 'text',         type: 'string',                                 desc: 'Plain-text body. At least one of html or text is required.' },
        { field: 'cc',           type: 'Address | Address[]',                    desc: 'CC recipients. Up to 50 addresses.' },
        { field: 'bcc',          type: 'Address | Address[]',                    desc: 'BCC recipients. Up to 50 addresses.' },
        { field: 'replyTo',      type: 'Address',                                desc: 'Reply-To address.' },
        { field: 'attachments',  type: 'Attachment[]',                           desc: 'Up to 20 attachments, 10 MB each. See Attachments.' },
        { field: 'headers',      type: 'Record<string, string>',                 desc: 'Custom email headers. Platform-controlled headers are rejected.' },
        { field: 'delaySeconds', type: 'integer',                                desc: 'Defer delivery by 0–43 200 seconds (up to 12 hours). See Scheduled Delivery.' },
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
        { field: 'id',     type: 'string',   desc: 'UUID for this log entry. Use it to poll delivery status via GET /v1/logs/:id.' },
        { field: 'status', type: '"queued"', desc: 'Always queued at this point — delivery is async.' },
      ]} />
      <P>
        Validation errors return <IC>400</IC> with <IC>{'{ error: "Validation failed", issues: [...] }'}</IC>.
      </P>
    </div>
  )
}
