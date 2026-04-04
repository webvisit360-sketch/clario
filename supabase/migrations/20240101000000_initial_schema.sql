-- Migration: initial_schema
-- Created: 2024-01-01
-- Description: Core tables for clario.si — profiles, sellers, search_history

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  email         text not null,
  company_name  text not null,
  created_at    timestamp with time zone default now()
);

-- Sellers (scraping targets with encrypted credentials)
create table public.sellers (
  id                       uuid primary key default uuid_generate_v4(),
  user_id                  uuid references public.profiles(id) on delete cascade not null,
  name                     text not null,
  url                      text not null,
  login_email              text not null,
  login_password_encrypted text not null,
  login_password_iv        text not null,
  notes                    text,
  active                   boolean default true,
  sort_order               integer default 0,
  created_at               timestamp with time zone default now()
);

-- Search history
create table public.search_history (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references public.profiles(id) on delete cascade not null,
  part_number  text not null,
  results_json jsonb,
  result_count integer default 0,
  searched_at  timestamp with time zone default now()
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────

create index idx_sellers_user_id     on public.sellers(user_id);
create index idx_sellers_active      on public.sellers(user_id, active);
create index idx_search_history_user on public.search_history(user_id, searched_at desc);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

alter table public.profiles      enable row level security;
alter table public.sellers       enable row level security;
alter table public.search_history enable row level security;

-- profiles: users can only see and modify their own profile
create policy "profiles: owner access"
  on public.profiles for all
  using (auth.uid() = id);

-- sellers: users can only see and modify their own sellers
create policy "sellers: owner access"
  on public.sellers for all
  using (auth.uid() = user_id);

-- search_history: users can only see their own history
create policy "search_history: owner access"
  on public.search_history for all
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- TRIGGERS
-- ─────────────────────────────────────────────

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, company_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'company_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
