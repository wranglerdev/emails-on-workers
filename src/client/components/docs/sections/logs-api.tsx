import { P, Sub, IC, CodeBlock, FieldTable } from '../primitives'

export function LogsApiSection() {
  return (
    <div className="flex flex-col gap-3">
      <P>
        The Logs API gives you programmatic access to delivery history. All endpoints require authentication.
      </P>
      <Sub>List logs</Sub>
      <CodeBlock>{`GET /v1/logs?status=sent&limit=50&offset=0`}</CodeBlock>
      <FieldTable rows={[
        { field: 'status', type: 'string',  desc: 'Filter by status: pending, queued, sent, or failed.' },
        { field: 'limit',  type: 'integer', desc: 'Results per page. Range 1–100, default 20.' },
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
