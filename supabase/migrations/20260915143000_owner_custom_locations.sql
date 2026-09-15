-- Owner-scoped custom location options (şəhər / rayon / nişangah not in the shared list).
alter table public.owners
  add column if not exists custom_locations jsonb not null default '[]'::jsonb;

comment on column public.owners.custom_locations is
  'Per-owner location entries: [{id, parentKey, name}]. parentKey "" = top level; "cityId" = under şəhər; "cityId/rayonId" = under rayon.';
