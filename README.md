# Cloudflare Emails

An open source transactional email API built on Cloudflare Workers. Send emails programmatically via a simple REST API — no third-party email provider needed, just your own Cloudflare account.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/wranglerdev/emails-on-workers)

## Prerequisites

1. **Cloudflare Workers Paid Plan** — the Email Sending binding requires a paid Workers plan.
2. **Email Sending onboarding** — complete the setup at [developers.cloudflare.com/email-service/get-started/send-emails](https://developers.cloudflare.com/email-service/get-started/send-emails/) to verify your sending domain and configure the binding.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run locally:

```bash
pnpm dev
```

Deploy to Cloudflare:

```bash
pnpm deploy
```

After deploying, run database migrations:

```bash
pnpm db:migrate:remote
```

Create the email queues (required for async sending):

```bash
wrangler queues create email-send-queue
wrangler queues create email-send-dlq
```

Then update the `BETTER_AUTH_URL` variable in your Worker's settings (or in `wrangler.jsonc`) to your actual Worker URL, for example `https://cloudflare-emails.your-subdomain.workers.dev`.

Regenerate types after changing `wrangler.jsonc`:

```bash
pnpm cf-typegen
```

## API

### `POST /v1/email/send`

Enqueue a transactional email for async delivery. Returns `202` immediately.

```ts
const res = await fetch('https://your-worker.workers.dev/v1/email/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': 'your-api-key' },
  body: JSON.stringify({
    to: 'recipient@example.com',
    from: 'sender@yourdomain.com',
    subject: 'Hello',
    html: '<p>Hello from Cloudflare Emails!</p>',
    // optional: delay delivery up to 12 hours
    delaySeconds: 3600,
  }),
})
// { id: "uuid", status: "queued" }
```

Poll status with `GET /v1/logs/:id`.

### `GET /v1/logs/:id`

Fetch the status and details of a single email by its ID.

## Roadmap

- [ ] Optimizations on top of the email service
- [ ] UI polishing
- [ ] Better Auth admin + new user invite
- [ ] Custom emails using JSX renderer ([jsx.email](https://jsx.email/docs/quick-start))
- [ ] Campaigns: send newsletters and product updates to large audiences
- [ ] Contact management: manage contacts with custom fields and full activity history
- [ ] Segments: organize contacts with dynamic filtering
- [ ] Workflows: automations with triggers, delays, and conditional logic
- [ ] Analytics: track opens, clicks, bounces, and engagement metrics in real-time
- [ ] Inbound emails: receive and process incoming emails with custom routing rules

## Contributing

PRs and issues are welcome. Open an issue to discuss what you'd like to change.

## License

MIT
