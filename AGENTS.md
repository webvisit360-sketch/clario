# Clario — Agent & Developer Specification

> **Target:** B2B automotive spare parts price comparison platform for Slovenia.
> **Stack:** Next.js 14 (App Router) · Express scraping API · Supabase · Turborepo · pnpm · shadcn/ui · Playwright

---

## Monorepo Layout

```
clario/
├── apps/
│   ├── web/          Next.js 14 frontend   → port 3000
│   └── api/          Express scraping API  → port 3001
└── packages/
    ├── shared/       TypeScript interfaces (no runtime deps)
    ├── supabase/     Supabase clients + all DB query helpers
    └── ui/           Shared React components (MathCaptcha, SellerCard, Navbar, LanguageSwitcher)
```

### Package names
| Path | Name |
|------|------|
| `packages/shared` | `@clario/shared` |
| `packages/supabase` | `@clario/supabase` |
| `packages/ui` | `@clario/ui` |
| `apps/web` | `@clario/web` |
| `apps/api` | `@clario/api` |

---

## Next.js — App Router Conventions

### File roles
| File | Purpose |
|------|---------|
| `layout.tsx` | Persistent shell (Navbar, providers). Fetch session here, never in page. |
| `page.tsx` | Route entry point. Prefer Server Components unless interactivity needed. |
| `loading.tsx` | Automatic Suspense skeleton for the route segment. |
| `error.tsx` | Error boundary for the segment — must be `'use client'`. |
| `middleware.ts` | Runs on Edge — used **only** for session refresh + auth redirect. |

### Server vs Client Components
- Default to **Server Components**. Add `'use client'` only when you need:
  - `useState` / `useEffect` / event handlers
  - Browser APIs (`localStorage`, `window`)
  - Third-party client-only libraries
- **Never** `'use client'` on layout files that fetch session data.
- Pass server-fetched data down as **props** — don't re-fetch in children.

### Data fetching
```ts
// ✅ Server Component — fetch directly
const supabase = createClient()           // from lib/supabase/server.ts
const { data } = await supabase.from('sellers').select(...)

// ✅ Client Component — call the Express API via the axios instance
const { data } = await api.get('/api/sellers')   // from lib/api.ts

// ❌ Never call Supabase directly from client components in dashboard pages
//    — use the API layer instead so auth + encryption stay server-side
```

### Route groups
| Group | Auth | Purpose |
|-------|------|---------|
| `(auth)` | Public | Login only |
| `(dashboard)` | Protected | All app pages — layout guards with `middleware.ts` |

---

## Supabase Auth

### Client creation
| Context | Import from | Client factory |
|---------|------------|----------------|
| Server Components / Route Handlers | `@/lib/supabase/server` | `createClient()` |
| Client Components | `@/lib/supabase/client` | `createClient()` |
| Middleware | inline in `middleware.ts` | `createServerClient(...)` |

### Session rules
1. **Always use `supabase.auth.getUser()`** — never `getSession()` in server code. `getUser()` validates the JWT with Supabase each time; `getSession()` reads from the cookie without verification.
2. The `middleware.ts` refreshes the session on every request — this is the only place tokens are renewed.
3. The dashboard `layout.tsx` calls `getUser()` to guard all routes; never duplicate this in individual pages.
4. After `signInWithPassword`, call `router.refresh()` to force the server to re-evaluate the session.

### Auth flow
```
User → POST /login (captcha verified first)
     → supabase.auth.signInWithPassword()
     → middleware sets auth cookie
     → redirect to /search
     → middleware.ts validates on every request
     → dashboard layout.tsx checks user, fetches profile
```

---

## Express API (`apps/api`)

### Responsibilities
- Scraping (Playwright) — the only service that touches seller websites
- Password encryption/decryption (AES-256-CBC) — passwords never leave this service in plaintext
- Captcha generation + verification (in-memory, 5 min TTL)
- Proxying DB writes for search history

### Auth model
- **Does not manage users** — Supabase owns that
- Validates every request via `requireAuth` middleware:
  - Reads `Authorization: Bearer <supabase_jwt>`
  - Verifies with `serverClient.auth.getUser(token)`
  - Attaches `req.user` — use `req.user.id` as the scoped userId in all DB calls

### Adding a new scraper
1. Create `apps/api/src/scrapers/<name>.js`
2. Export a default `async function scrape(credentials, partNumber)` → returns `SearchResult`
3. Register it in `apps/api/src/routes/search.js` — the seller's `name` field must match the key
4. Use `runScraper(fn, credentials, partNumber)` from `base-scraper.js` — handles timeout + browser lifecycle

### Scraper return shape
```js
// Success
return { status: 'ok', price_net: 12.50, currency: 'EUR', stock_qty: 10,
         availability: 'In stock', image_url: null, part_number_found: 'ABC123',
         add_to_cart_url: 'https://...' }

// Not found
return { status: 'not_found', price_net: null, currency: 'EUR', stock_qty: null,
         availability: 'Out of stock', image_url: null, part_number_found: '',
         add_to_cart_url: null }
```

---

## shadcn/ui — Component Rules

- All shadcn components live in `apps/web/components/ui/`
- Import with `@/components/ui/<name>` — never with relative paths
- Use the `cn()` helper from `@/lib/utils` for conditional class merging
- **Do not customise shadcn source files** — extend via `className` prop or wrap in a new component
- New compound components go in `apps/web/components/` (not `/ui/`)

### Available components
`Button` `Input` `Label` `Card` `Table` `Dialog` `Badge` `Skeleton` `Separator` `Sonner`

### Toast pattern
```ts
import { toast } from 'sonner'
toast.success('Saved')
toast.error('Error: ' + err.message)
```

---

## Colour System

CSS variables are defined in `globals.css`. Use semantic tokens in new code:

| Token | Value | Use |
|-------|-------|-----|
| `bg-background` | `#0f0f1a` (navy) | Page background |
| `bg-card` | dark navy | Card / panel background |
| `text-foreground` | near-white | Body text |
| `bg-primary` / `text-primary` | gold `#e8a838` | CTAs, logo accent, focus ring |
| `text-muted-foreground` | grey | Secondary text, labels |
| `bg-destructive` | red `#d64444` | Errors, delete actions |
| `bg-success` / `text-success` | green `#2a9d4e` | In-stock indicators |
| `brand-primary` | `#1a1a2e` | Direct navy hex (avoid — prefer tokens) |

---

## Shared Packages — Usage Rules

### `@clario/shared`
- **Pure types only** — zero runtime code, zero dependencies
- Import in both `apps/` and `packages/`

### `@clario/supabase`
- All DB query functions live here — never write raw Supabase calls in app code
- Functions are scoped to `userId` — always pass it, never trust client-sent userId
- Use `serverClient` (service role) for all writes; `browserClient` only for read-only public data

### `@clario/ui`
- Components that are shared between hypothetical future apps (e.g., a mobile web)
- Do not add Next.js-specific imports (`next/navigation`, etc.) here — keep it framework-agnostic
- App-specific compound components belong in `apps/web/components/`

---

## Environment Variables

| Variable | Used by | Purpose |
|----------|---------|---------|
| `SUPABASE_URL` | api, supabase pkg | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | api, supabase pkg | Bypasses RLS — server only, never expose |
| `NEXT_PUBLIC_SUPABASE_URL` | web | Public project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | web | Anon/publishable key |
| `NEXT_PUBLIC_API_URL` | web | Express API base URL |
| `AES_KEY` | api | 32-char key for password encryption |
| `JWT_SECRET` | api | Fallback JWT validation |
| `CORS_ORIGIN` | api | Allowed origin (Next.js URL) |
| `API_PORT` | api | Express port (default 3001) |

**Never commit `.env`**. Copy `.env.example` → `.env` and fill in values.

---

## Scraping Framework Recommendation

**Use [Crawlee](https://crawlee.dev) (by Apify) as the scraping framework.**

### Why Crawlee over raw Playwright
| Feature | Raw Playwright | Crawlee + Playwright |
|---------|---------------|---------------------|
| Request queue | Manual | Built-in, persistent |
| Auto-retry on failure | Manual | Built-in (configurable) |
| Session rotation | Manual | `SessionPool` built-in |
| Anti-bot fingerprint spoofing | Manual | Built-in via `PlaywrightCrawler` |
| Proxy rotation | Manual | Built-in |
| Rate limiting / politeness | Manual | Built-in |
| Concurrent scraper management | Manual | Built-in |

### Installation (in `apps/api`)
```bash
pnpm add crawlee playwright
```

### Scraper pattern with Crawlee
```js
import { PlaywrightCrawler } from 'crawlee';

export default async function scrape(credentials, partNumber) {
  let result = { status: 'not_found', ... };

  const crawler = new PlaywrightCrawler({
    maxRequestsPerCrawl: 1,
    requestHandlerTimeoutSecs: 12,
    async requestHandler({ page }) {
      // 1. Login
      await page.fill('#email', credentials.login_email);
      await page.fill('#password', credentials.login_password);
      await page.click('[type=submit]');

      // 2. Search
      await page.fill('.search-input', partNumber);
      await page.click('.search-btn');

      // 3. Scrape
      const price = await page.$eval('.price', el => parseFloat(el.textContent));
      result = { status: 'ok', price_net: price, currency: 'EUR', ... };
    },
  });

  await crawler.run([credentials.url]);
  return result;
}
```

### Recommended Crawlee packages
- `crawlee` — core + `PlaywrightCrawler`
- Keep `playwright` as the browser engine (already a dep)
- Optional: `@crawlee/memory-storage` for local dev queue persistence

---

## Development Commands

```bash
# Install all deps (run from repo root)
pnpm install

# Start everything (Turbo orchestrates web + api)
pnpm dev

# Start individually
pnpm --filter @clario/web dev      # Next.js on :3000
pnpm --filter @clario/api dev      # Express on :3001

# Type-check all packages
pnpm turbo type-check

# Format
pnpm format
```

---

## Code Style

- **TypeScript strict mode** everywhere in web + packages
- API (`apps/api`) is plain JS — add JSDoc types where helpful
- Prefer `async/await` over `.then()` chains
- All API route handlers must call `next(err)` on error — never `res.status(500).json(...)` inline
- DB query functions in `@clario/supabase` throw on error — callers must `try/catch`
- Use `toast.error()` / `toast.success()` (sonner) for user feedback — no `alert()`
- **Language:** All code must be written in English — variable names, function names, comments, `console.log` messages, and string literals inside code logic (`toast.error()`, `setError()`, `confirm()`, API error responses, code examples in docs). **Exception:** user-facing JSX display strings (labels, headings, button text, placeholders) may be in Slovenian as the product targets Slovenian-speaking users; when i18n is introduced these move to a translation file.

---

## Supabase Development Best Practices

### Branch → Environment mapping

| Git branch | Supabase project | GitHub Actions workflow |
|------------|-----------------|------------------------|
| `staging`  | Staging project  | `supabase-staging.yml` |
| `main`     | Production project | `supabase-production.yml` |

**Rule:** Never apply migrations directly in the Supabase dashboard on staging or production. All schema changes go through `supabase/migrations/` and are deployed via CI.

---

### Supabase CLI — local dev workflow

```bash
# 1. Install CLI (once)
brew install supabase/tap/supabase

# 2. Login
supabase login

# 3. Start local stack (Docker required)
supabase start
# Gives you: local DB on :54322, Studio on :54323, API on :54321

# 4. After making schema changes, generate a new migration
supabase db diff --schema public -f your_migration_name
# Creates supabase/migrations/<timestamp>_your_migration_name.sql

# 5. Apply to local DB
supabase db reset   # full reset + all migrations + seed.sql
# or
supabase db push    # apply only new migrations (no seed)

# 6. Stop local stack
supabase stop
```

---

### Migration rules

1. **Never edit an applied migration.** Once a migration file is committed and pushed, treat it as immutable. Create a new migration instead.
2. **Naming convention:** `<timestamp>_<snake_case_description>.sql`
   - Timestamp format: `YYYYMMDDHHMMSS` (e.g. `20240315143000_add_seller_logo_url.sql`)
   - Generated automatically by `supabase db diff -f <name>`
3. **One concern per migration.** Don't combine unrelated table changes in one file.
4. **Always include the reverse** as a comment at the bottom for documentation (but don't run it automatically):
   ```sql
   -- Rollback (run manually if needed):
   -- alter table public.sellers drop column logo_url;
   ```
5. **Test locally first:** `supabase db reset` must succeed with zero errors before committing.

---

### RLS (Row Level Security) rules

- **RLS is always enabled** on every table — never disable it.
- Every new table needs at least one policy before data can be read/written.
- Use `auth.uid()` to scope policies to the authenticated user.
- The `serverClient` (service role key) **bypasses RLS** — use it only in `apps/api` server-side code, never expose the service role key to the browser.
- Policy naming convention: `"<table>: <description>"` e.g. `"sellers: owner access"`
- When writing policies, cover all operations explicitly: `for select`, `for insert`, `for update`, `for delete` (or `for all` when all four are identical).

---

### GitHub Actions secrets (required for CI)

Add these in **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Where to find it |
|--------|-----------------|
| `SUPABASE_ACCESS_TOKEN` | [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) |
| `STAGING_SUPABASE_PROJECT_ID` | Supabase Dashboard → Staging project → Settings ��� General → Reference ID |
| `STAGING_SUPABASE_DB_PASSWORD` | Supabase Dashboard → Staging project → Settings → Database → Database password |
| `PROD_SUPABASE_PROJECT_ID` | Supabase Dashboard → Production project → Settings → General → Reference ID |
| `PROD_SUPABASE_DB_PASSWORD` | Supabase Dashboard → Production project → Settings → Database → Database password |

Also add **GitHub Environments** (`staging`, `production`) under Settings → Environments. This enables environment-specific protection rules (e.g. require reviewer approval before production deploys).

---

### Adding a new migration (step-by-step)

```bash
# 1. Start local stack
supabase start

# 2. Make schema changes via SQL or Studio (localhost:54323)
#    e.g. add a column in Studio

# 3. Diff the changes into a migration file
supabase db diff --schema public -f add_seller_logo_url

# 4. Review the generated file
cat supabase/migrations/*_add_seller_logo_url.sql

# 5. Reset local DB to verify the full migration chain works
supabase db reset

# 6. Commit and push to staging branch → CI deploys automatically
git add supabase/migrations/
git commit -m "db: add seller logo_url column"
git push origin staging

# 7. Verify in Supabase Staging Dashboard → Database → Migrations
# 8. After staging validation, merge to main → CI deploys to production
```

---

### Supabase project setup checklist (new environment)

- [ ] Create project at [supabase.com](https://supabase.com)
- [ ] Copy **Project Reference ID** → add to GitHub secrets
- [ ] Copy **Database password** → add to GitHub secrets
- [ ] Copy **Project URL** + **Publishable Default Key** + **Service Role Key** → add to hosting env vars
- [ ] Enable **Email auth** in Authentication → Providers
- [ ] Disable **Email confirmations** for dev (enable for production)
- [ ] Set **Site URL** in Authentication → URL Configuration → your app's URL
- [ ] Add redirect URL: `https://your-app.com/**`
- [ ] Run initial migration: `supabase db push --project-ref <ref>`

---

### Do's and Don'ts

| ✅ Do | ❌ Don't |
|-------|---------|
| Create migrations with `supabase db diff` | Edit tables directly in the dashboard without a migration |
| Use `serverClient` (service role) only in `apps/api` | Expose `SUPABASE_SERVICE_ROLE_KEY` to the browser |
| Test every migration with `supabase db reset` locally | Push broken migrations to staging |
| Use RLS policies for all data access | Disable RLS or use `service_role` for regular app reads |
| Use `auth.uid()` in policies | Hard-code user IDs in policies |
| Keep `staging` in sync with `main` | Let staging drift significantly from production schema |
| Use `supabase db push` in CI | Run raw SQL in the dashboard on production |
