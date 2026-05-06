# Cloudflare Emails

An open source transactional email API built on Cloudflare Workers. Send emails programmatically via a simple REST API — no third-party email provider needed, just your own Cloudflare account.

## Prerequisites

1. **Cloudflare Workers Paid Plan** — the Email Sending binding requires a paid Workers plan.
2. **Email Sending onboarding** — complete the setup at [developers.cloudflare.com/email-service/get-started/send-emails](https://developers.cloudflare.com/email-service/get-started/send-emails/) to verify your sending domain and configure the binding.

## Getting Started

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Deploy to Cloudflare:

```bash
npm run deploy
```

Regenerate types after changing `wrangler.jsonc`:

```bash
npm run cf-typegen
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

- [ ] Full Zod type safety
- [ ] Product images
- [ ] Attachments
- [ ] Error handling
- [ ] Database + ORM
- [ ] Auth
- [ ] Deploy via one-click button on Cloudflare
- [ ] Queues
- [ ] Custom emails using JSX renderer ([jsx.email](https://jsx.email/docs/quick-start))
- [ ] Simple docs using Astro

### V2

- [ ] Email routing

## Contributing

PRs and issues are welcome. Open an issue to discuss what you'd like to change.

## License

MIT
