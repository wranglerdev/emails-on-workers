import { defineConfig } from 'drizzle-kit'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

function localD1Path(): string {
  const base = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject'
  try {
    const [dir] = readdirSync(base)
    return join(base, dir, 'db.sqlite')
  } catch {
    throw new Error('Local D1 not found. Run `pnpm dev` first to initialise the local database.')
  }
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: localD1Path(),
  },
})
