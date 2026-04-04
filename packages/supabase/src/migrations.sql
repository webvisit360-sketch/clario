-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  company_name text not null,
  created_at timestamp with time zone default now()
);

-- Sellers table
create table public.sellers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  url text not null,
  login_email text not null,
  login_password_encrypted text not null,
  login_password_iv text not null,
  notes text,
  active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);

-- Search history
create table public.search_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  part_number text not null,
  results_json jsonb,
  result_count integer default 0,
  searched_at timestamp with time zone default now()
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.sellers enable row level security;
alter table public.search_history enable row level security;

create policy "Users see own profile" on public.profiles for all using (auth.uid() = id);
create policy "Users manage own sellers" on public.sellers for all using (auth.uid() = user_id);
create policy "Users see own history" on public.search_history for all using (auth.uid() = user_id);
