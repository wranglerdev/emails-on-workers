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

Then update the `BETTER_AUTH_URL` variable in your Worker's settings (or in `wrangler.jsonc`) to your actual Worker URL, for example `https://cloudflare-emails.your-subdomain.workers.dev`.

Regenerate types after changing `wrangler.jsonc`:

```bash
pnpm cf-typegen
```

## API

### `POST /v1/email`

Send a transactional email.

```ts
const res = await fetch('https://your-worker.workers.dev/v1/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'recipient@example.com',
    subject: 'Hello',
    html: '<p>Hello from Cloudflare Emails!</p>',
  }),
})
```

## Roadmap

### MVP

- [ok] Full Zod type safety
- [ok] Error handling
- [ok] Product images
- [ok] Attachments
- [ok] Hono goodies
      - Factory
      - Logger
      - Timeout
- [ok] Database + ORM
- [ok] Auth
- [ok] Setup frontend (daisyUI, TanStack Router, TanStack Query, TanStack Forms)
- [ ] Dashboard
- [ok] Deploy via one-click button on Cloudflare
- [ ] Queues
- [ ] Custom emails using JSX renderer ([jsx.email](https://jsx.email/docs/quick-start))
- [ ] Simple docs using Astro

### V2

- [ ] Optimizations on top of the email service

Needs refine:

- [ ] Campaigns: Send newsletters and product updates to large audiences
- [ ] Contact Management: Manage contacts with custom fields and full activity history
- [ ] Segments: Organize contacts with dynamic filtering and target the right audience
- [ ] Workflows: Create advanced automations with triggers, delays, and conditional logic
- [ ] Analytics: Track opens, clicks, bounces, and engagement metrics in real-time
- [ ] Inbound Emails: Receive and process incoming emails with custom routing rules

## Contributing

PRs and issues are welcome. Open an issue to discuss what you'd like to change.

## License

MIT
