-- Keep pre-crop original for later hero re-crop.
alter table public.photos
  add column if not exists original_path text;
