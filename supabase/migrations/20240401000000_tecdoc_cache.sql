-- Migration: tecdoc_cache
-- Created: 2024-04-01
-- Description: Cache table for TecDoc API lookups to avoid repeated API calls

create table public.tecdoc_cache (
  search_term      text not null,
  brand_no         integer,
  results_json     jsonb not null,
  cached_at        timestamptz default now(),
  expires_at       timestamptz default now() + interval '7 days',
  primary key (search_term)
);

create index idx_tecdoc_cache_expires on public.tecdoc_cache(expires_at);

-- No RLS needed — server-only reference data accessed via serverClient (service role)

-- Rollback (run manually if needed):
-- drop table public.tecdoc_cache;
