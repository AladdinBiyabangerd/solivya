-- Add zone_note for public microsite copy
alter table public.properties
  add column if not exists zone_note text not null default '';

-- ---------------------------------------------------------------------------
-- Demo seed: published property "demo" (Sahil Stay)
-- ---------------------------------------------------------------------------

do $$
declare
  uid constant uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  pid uuid;
begin
  -- Auth user (idempotent)
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    uid,
    'authenticated',
    'authenticated',
    'demo@solivya.homes',
    crypt('demo-seed-only', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  on conflict (id) do nothing;

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    uid,
    uid,
    jsonb_build_object('sub', uid::text, 'email', 'demo@solivya.homes'),
    'email',
    uid::text,
    now(),
    now(),
    now()
  )
  on conflict (provider, provider_id) do nothing;

  insert into public.owners (id, email, phone)
  values (uid, 'demo@solivya.homes', '+994501234567')
  on conflict (id) do update
    set email = excluded.email,
        phone = excluded.phone;

  insert into public.properties (
    id,
    owner_id,
    slug,
    brand_name,
    title_az,
    title_ru,
    lead_az,
    lead_ru,
    zone,
    zone_note,
    rooms,
    guests,
    price_night,
    price_note,
    min_nights,
    deposit,
    amenities,
    rules,
    whatsapp_e164,
    locale_default,
    published
  )
  values (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    uid,
    'demo',
    'Sahil Stay',
    'Bulvar yaxınlığında sakit 2 otaqlı',
    'Тихая 2-комнатная у бульвара',
    'İşıqlı otaqlar, tam mətbəx və şəhərin mərkəzinə piyada məsafə — qısa və rahat qalış üçün.',
    'Светлые комнаты, кухня и пешая доступность к центру — для короткого комфортного проживания.',
    'Səbail · Bulvar zonası',
    'Sahil metrosuna və Dənizkənarı bulvara yaxın. Dəqiq ünvan bron zamanı göndərilir.',
    2,
    4,
    90,
    'gecədən başlayaraq',
    2,
    50,
    '[
      {"title":"Sürətli Wi‑Fi","subtitle":"İş və streaming üçün"},
      {"title":"Kombi + kondisioner","subtitle":"Bütün mövsümlər"},
      {"title":"Tam mətbəx","subtitle":"Plyta, soyuducu, qablar"},
      {"title":"Smart TV","subtitle":"Netflix hazır"}
    ]'::jsonb,
    '[
      "Minimum qalış: 2 gecə",
      "Depozit: 50 ₼ (çıxışda qaytarılır)",
      "Siqaret və partiya qadağandır",
      "Check-in: 15:00 · Check-out: 12:00"
    ]'::jsonb,
    '994501234567',
    'az',
    true
  )
  on conflict (slug) do update set
    brand_name = excluded.brand_name,
    title_az = excluded.title_az,
    title_ru = excluded.title_ru,
    lead_az = excluded.lead_az,
    lead_ru = excluded.lead_ru,
    zone = excluded.zone,
    zone_note = excluded.zone_note,
    rooms = excluded.rooms,
    guests = excluded.guests,
    price_night = excluded.price_night,
    price_note = excluded.price_note,
    min_nights = excluded.min_nights,
    deposit = excluded.deposit,
    amenities = excluded.amenities,
    rules = excluded.rules,
    whatsapp_e164 = excluded.whatsapp_e164,
    locale_default = excluded.locale_default,
    published = excluded.published,
    updated_at = now()
  returning id into pid;

  if pid is null then
    select id into pid from public.properties where slug = 'demo';
  end if;

  delete from public.photos where property_id = pid;

  insert into public.photos (property_id, storage_path, alt, sort_order) values
    (pid, 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1800&q=80', 'Hero', 0),
    (pid, 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1200&q=80', 'Qonaq otağı', 1),
    (pid, 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=800&q=80', 'Mətbəx', 2),
    (pid, 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80', 'Yataq otağı', 3),
    (pid, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', 'Hamam', 4),
    (pid, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80', 'Detal', 5),
    (pid, 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80', 'Zona', 6);
end $$;
