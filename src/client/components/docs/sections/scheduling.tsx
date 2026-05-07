import { P, IC, CodeBlock } from '../primitives'

export function SchedulingSection() {
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
