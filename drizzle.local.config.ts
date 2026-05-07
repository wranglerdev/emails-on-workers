import { defineConfig } from 'drizzle-kit'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

function localD1Path(): string {
  const base = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject'
  try {
    const file = readdirSync(base).find(
      (f) => f.endsWith('.sqlite') && f !== 'metadata.sqlite',
    )
    if (!file) throw new Error()
    return join(base, file)
  } catch {
    throw new Error('Local D1 not found. Run `pnpm dev` first to initialise the local database.')
  }
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'turso',
  dbCredentials: {
    url: `file:${localD1Path()}`,
  },
})
