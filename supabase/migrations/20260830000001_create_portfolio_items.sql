create extension if not exists pgcrypto;

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  media_type text not null default 'image',
  cover_image text,
  media_urls text[] not null default '{}',
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.portfolio_items enable row level security;

create policy "Public can read active portfolio items"
on public.portfolio_items
for select
to public
using (active = true);

create policy "Authenticated users can insert portfolio items"
on public.portfolio_items
for insert
to authenticated
with check (true);

create policy "Authenticated users can update portfolio items"
on public.portfolio_items
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete portfolio items"
on public.portfolio_items
for delete
to authenticated
using (true);