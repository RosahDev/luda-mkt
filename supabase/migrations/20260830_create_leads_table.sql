create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  service_type text not null,
  event_date date,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "Anonymous users can insert leads"
on public.leads
for insert
to anon
with check (true);

create policy "Anyone can read leads"
on public.leads
for select
to public
using (true);
