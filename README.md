# clario

B2B automotive spare parts price comparison tool for Slovenia.

## Setup

1. Copy `.env.example` to `.env` and fill in your Supabase credentials.
2. Run `pnpm install`
3. Run `pnpm dev`

## Apps

- `apps/web` — Next.js 14 frontend (port 3000)
- `apps/api` — Express scraping API (port 3001)

## Packages

- `packages/shared` — TypeScript types
- `packages/supabase` — Supabase client + DB helpers
- `packages/ui` — Shared React components
# clario
