import { P, IC, CodeBlock } from '../primitives'

export function AddressesSection() {
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
