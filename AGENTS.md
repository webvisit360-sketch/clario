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
         availability: 'Na zalogi', image_url: null, part_number_found: 'ABC123',
         add_to_cart_url: 'https://...' }

// Not found
return { status: 'not_found', price_net: null, currency: 'EUR', stock_qty: null,
         availability: 'Ni na zalogi', image_url: null, part_number_found: '',
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
toast.success('Shranjeno')
toast.error('Napaka: ' + err.message)
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
