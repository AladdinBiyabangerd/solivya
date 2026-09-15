-- Exact pin for the listing (Google Maps).
alter table public.properties
  add column if not exists lat double precision,
  add column if not exists lng double precision;

alter table public.properties
  drop constraint if exists properties_lat_lng_pair;

alter table public.properties
  add constraint properties_lat_lng_pair check (
    (lat is null and lng is null)
    or (
      lat is not null
      and lng is not null
      and lat between -90 and 90
      and lng between -180 and 180
    )
  );

comment on column public.properties.lat is 'Google Maps latitude for the listing pin';
comment on column public.properties.lng is 'Google Maps longitude for the listing pin';
