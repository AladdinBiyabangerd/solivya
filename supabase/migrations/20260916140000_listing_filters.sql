-- Structured location ids + amenity taxonomy for browse filters.

alter table public.properties
  add column if not exists city_id text not null default '',
  add column if not exists rayon_id text not null default '',
  add column if not exists nishangah_id text not null default '',
  add column if not exists amenities_extra text not null default '';

comment on column public.properties.city_id is 'Location tree city id (e.g. baki) or custom-* / orphan:*';
comment on column public.properties.rayon_id is 'Location tree rayon id under city';
comment on column public.properties.nishangah_id is 'Location tree nişangah id under rayon';
comment on column public.properties.amenities_extra is 'Free-text amenity notes not in the fixed taxonomy';

create index if not exists properties_published_city_idx
  on public.properties (published, city_id);

create index if not exists properties_published_price_idx
  on public.properties (published, price_night);

create index if not exists properties_amenities_gin_idx
  on public.properties using gin (amenities);

-- ---------------------------------------------------------------------------
-- Convert legacy amenities [{title, subtitle}] → ["wifi", ...] + extras
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
  elem jsonb;
  title text;
  lowered text;
  ids text[] := '{}';
  extras text[] := '{}';
  matched boolean;
begin
  for r in
    select id, amenities
    from public.properties
    where jsonb_typeof(amenities) = 'array'
      and jsonb_array_length(amenities) > 0
      and jsonb_typeof(amenities -> 0) = 'object'
  loop
    ids := '{}';
    extras := '{}';

    for elem in select * from jsonb_array_elements(r.amenities)
    loop
      title := coalesce(elem ->> 'title', '');
      if title = '' then
        continue;
      end if;

      lowered := lower(
        translate(
          title,
          'əıöüçşğƏİÖÜÇŞĞ‑—',
          'eioucsgEIOUCSG--'
        )
      );
      matched := false;

      if lowered ~ 'wi-?fi|вайфай|интернет' then
        ids := array_append(ids, 'wifi');
        matched := true;
      end if;
      if lowered ~ 'kondision|кондиц|air.?cond' then
        ids := array_append(ids, 'ac');
        matched := true;
      end if;
      if lowered ~ 'kombi|istilik|отопл|heating' then
        ids := array_append(ids, 'heating');
        matched := true;
      end if;
      if lowered ~ 'paltaryuyan|стирал|washer|washing' then
        ids := array_append(ids, 'washer');
        matched := true;
      end if;
      if lowered ~ 'metbex|кухн|kitchen' then
        ids := array_append(ids, 'kitchen');
        matched := true;
      end if;
      if lowered ~ 'qabyuyan|посудом|dishwasher' then
        ids := array_append(ids, 'dishwasher');
        matched := true;
      end if;
      if lowered ~ 'parking|парков' then
        ids := array_append(ids, 'parking');
        matched := true;
      end if;
      if lowered ~ 'lift|лифт|elevator' then
        ids := array_append(ids, 'elevator');
        matched := true;
      end if;
      if lowered ~ 'isti su|горяч|hot.?water' then
        ids := array_append(ids, 'hot_water');
        matched := true;
      end if;
      if lowered ~ '(^|[^a-z])tv([^a-z]|$)|телевиз|netflix|smart tv' then
        ids := array_append(ids, 'tv');
        matched := true;
      end if;
      if lowered ~ 'is masasi|рабоч|workspace|desk' then
        ids := array_append(ids, 'workspace');
        matched := true;
      end if;
      if lowered ~ 'balkon|балкон' then
        ids := array_append(ids, 'balcony');
        matched := true;
      end if;
      if lowered ~ 'deniz|море|sea.?view' then
        ids := array_append(ids, 'sea_view');
        matched := true;
      end if;
      if lowered ~ 'utu|утюг|iron' and lowered !~ 'kombi' then
        ids := array_append(ids, 'iron');
        matched := true;
      end if;
      if lowered ~ '(^|[^a-z])fen([^a-z]|$)|фен|hair.?dry' then
        ids := array_append(ids, 'hairdryer');
        matched := true;
      end if;
      if lowered ~ 'desmal|полотен' then
        ids := array_append(ids, 'towels');
        matched := true;
      end if;
      if lowered ~ 'yataq dest|постел|linens|bedding' then
        ids := array_append(ids, 'linens');
        matched := true;
      end if;
      if lowered ~ 'self.?check|ozunuz check|самостоятель' then
        ids := array_append(ids, 'self_checkin');
        matched := true;
      end if;

      if not matched then
        extras := array_append(extras, title);
      end if;
    end loop;

    -- dedupe ids
    select coalesce(array_agg(distinct x), '{}') into ids from unnest(ids) as x;

    update public.properties
    set
      amenities = to_jsonb(ids),
      amenities_extra = array_to_string(extras, ', ')
    where id = r.id;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Best-effort zone id backfill from display path (Bakı-style)
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
  parts text[];
  p0 text;
  p1 text;
  p2 text;
  city text := '';
  rayon text := '';
  nish text := '';
begin
  for r in select id, zone from public.properties where coalesce(zone, '') <> ''
  loop
    parts := string_to_array(r.zone, ' · ');
    if parts is null or array_length(parts, 1) is null then
      continue;
    end if;

    p0 := trim(parts[1]);
    p1 := case when array_length(parts, 1) >= 2 then trim(parts[2]) else '' end;
    p2 := case when array_length(parts, 1) >= 3 then trim(parts[3]) else '' end;

    city := '';
    rayon := '';
    nish := '';

    if p0 in ('Bakı', 'Baku') then
      city := 'baki';
      if p1 in ('Səbail', 'Sabail') then rayon := 'sabail';
      elsif p1 in ('Nəsimi', 'Nasimi') then rayon := 'nasimi';
      elsif p1 in ('Yasamal') then rayon := 'yasamal';
      elsif p1 in ('Nərimanov', 'Narimanov') then rayon := 'narimanov';
      elsif p1 in ('Nizami') then rayon := 'nizami';
      elsif p1 in ('Xətai', 'Khatai') then rayon := 'khatai';
      elsif p1 in ('Binəqədi', 'Binagadi') then rayon := 'binagadi';
      elsif p1 in ('Sabunçu', 'Sabunchu') then rayon := 'sabunchu';
      elsif p1 in ('Suraxanı', 'Surakhani') then rayon := 'surakhani';
      elsif p1 in ('Qaradağ', 'Garadagh') then rayon := 'garadagh';
      elsif p1 in ('Pirallahı', 'Pirallahi') then rayon := 'pirallahi';
      elsif p1 in ('Xəzər', 'Khazar') then rayon := 'khazar';
      end if;
      if p2 <> '' then
        nish := lower(translate(p2, 'əıöüçşğ ƏİÖÜÇŞĞ', 'eioucsg-EIOUCSG'));
        nish := regexp_replace(nish, '[^a-z0-9-]+', '-', 'g');
        nish := trim(both '-' from nish);
      end if;
    elsif p0 in ('Səbail', 'Sabail') then
      city := 'baki';
      rayon := 'sabail';
      if p1 ~* 'bulvar' then nish := 'bulvar';
      elsif p1 ~* 'içəri|iceriseher' then nish := 'iceriseher';
      elsif p1 ~* 'bayıl|bayil' then nish := 'bayil';
      elsif p1 ~* 'badamdar' then nish := 'badamdar';
      elsif p1 ~* 'şıx|shikh' then nish := 'shikh';
      elsif p1 ~* 'white' then nish := 'white-city';
      end if;
    elsif p0 in ('Gəncə', 'Ganja') then
      city := 'gence';
    elsif p0 in ('Sumqayıt', 'Sumgayit') then
      city := 'sumqayit';
    end if;

    if city <> '' then
      update public.properties
      set city_id = city,
          rayon_id = coalesce(rayon, ''),
          nishangah_id = coalesce(nish, '')
      where id = r.id
        and city_id = '';
    end if;
  end loop;
end $$;

-- Demo listing: canonical ids + taxonomy amenities
update public.properties
set
  zone = 'Bakı · Səbail · Bulvar',
  city_id = 'baki',
  rayon_id = 'sabail',
  nishangah_id = 'bulvar',
  amenities = '["wifi","heating","ac","kitchen","tv"]'::jsonb,
  amenities_extra = ''
where slug = 'demo';
