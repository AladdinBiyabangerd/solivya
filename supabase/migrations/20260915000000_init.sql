-- Solivya MVP schema: owners, properties, photos + RLS + storage

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.owners (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.owners (id) on delete cascade,
  slug text not null,
  brand_name text not null,
  title_az text not null default '',
  title_ru text not null default '',
  lead_az text not null default '',
  lead_ru text not null default '',
  zone text not null default '',
  rooms int not null default 1 check (rooms > 0),
  guests int not null default 2 check (guests > 0),
  price_night numeric(10, 2) not null default 0 check (price_night >= 0),
  price_note text not null default '',
  min_nights int not null default 1 check (min_nights > 0),
  deposit numeric(10, 2) not null default 0 check (deposit >= 0),
  amenities jsonb not null default '[]'::jsonb,
  rules jsonb not null default '[]'::jsonb,
  whatsapp_e164 text not null default '',
  locale_default text not null default 'az' check (locale_default in ('az', 'ru')),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint properties_slug_unique unique (slug),
  constraint properties_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  storage_path text not null,
  alt text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists properties_owner_id_idx on public.properties (owner_id);
create index if not exists properties_published_idx on public.properties (published);
create index if not exists photos_property_id_idx on public.photos (property_id);
create index if not exists photos_sort_order_idx on public.photos (property_id, sort_order);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
before update on public.properties
for each row execute function public.set_updated_at();

-- Auto-create owner row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.owners (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.owners enable row level security;
alter table public.properties enable row level security;
alter table public.photos enable row level security;

-- owners
drop policy if exists "owners_select_own" on public.owners;
create policy "owners_select_own"
on public.owners for select
to authenticated
using (id = auth.uid());

drop policy if exists "owners_update_own" on public.owners;
create policy "owners_update_own"
on public.owners for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- properties: public can read published
drop policy if exists "properties_public_read_published" on public.properties;
create policy "properties_public_read_published"
on public.properties for select
to anon, authenticated
using (published = true);

drop policy if exists "properties_owner_select_own" on public.properties;
create policy "properties_owner_select_own"
on public.properties for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists "properties_owner_insert" on public.properties;
create policy "properties_owner_insert"
on public.properties for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "properties_owner_update" on public.properties;
create policy "properties_owner_update"
on public.properties for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "properties_owner_delete" on public.properties;
create policy "properties_owner_delete"
on public.properties for delete
to authenticated
using (owner_id = auth.uid());

-- photos: public read if parent property published
drop policy if exists "photos_public_read_published" on public.photos;
create policy "photos_public_read_published"
on public.photos for select
to anon, authenticated
using (
  exists (
    select 1
    from public.properties p
    where p.id = photos.property_id
      and p.published = true
  )
);

drop policy if exists "photos_owner_select_own" on public.photos;
create policy "photos_owner_select_own"
on public.photos for select
to authenticated
using (
  exists (
    select 1
    from public.properties p
    where p.id = photos.property_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "photos_owner_insert" on public.photos;
create policy "photos_owner_insert"
on public.photos for insert
to authenticated
with check (
  exists (
    select 1
    from public.properties p
    where p.id = photos.property_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "photos_owner_update" on public.photos;
create policy "photos_owner_update"
on public.photos for update
to authenticated
using (
  exists (
    select 1
    from public.properties p
    where p.id = photos.property_id
      and p.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.properties p
    where p.id = photos.property_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "photos_owner_delete" on public.photos;
create policy "photos_owner_delete"
on public.photos for delete
to authenticated
using (
  exists (
    select 1
    from public.properties p
    where p.id = photos.property_id
      and p.owner_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- Storage: property-photos
-- Path convention: {owner_id}/{property_id}/{filename}
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-photos',
  'property-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "property_photos_public_read" on storage.objects;
create policy "property_photos_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'property-photos');

drop policy if exists "property_photos_owner_insert" on storage.objects;
create policy "property_photos_owner_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'property-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "property_photos_owner_update" on storage.objects;
create policy "property_photos_owner_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'property-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'property-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "property_photos_owner_delete" on storage.objects;
create policy "property_photos_owner_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'property-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
