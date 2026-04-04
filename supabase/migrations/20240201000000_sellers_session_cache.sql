-- Migration: sellers_session_cache
-- Created: 2024-02-01
-- Description: Add session caching columns to sellers table for B2B scraping module

alter table public.sellers
  add column if not exists session_cookie      text,
  add column if not exists session_expires_at   timestamp with time zone,
  add column if not exists last_login_at        timestamp with time zone,
  add column if not exists login_status         varchar(20) default 'unknown';

-- Add a comment for valid login_status values
comment on column public.sellers.login_status is 'ok | failed | expired | unknown';

-- Rollback (run manually if needed):
-- alter table public.sellers drop column session_cookie;
-- alter table public.sellers drop column session_expires_at;
-- alter table public.sellers drop column last_login_at;
-- alter table public.sellers drop column login_status;
