-- Property engagement counters for admin dashboard

alter table public.properties
  add column if not exists view_count bigint not null default 0
    check (view_count >= 0),
  add column if not exists whatsapp_click_count bigint not null default 0
    check (whatsapp_click_count >= 0);

comment on column public.properties.view_count is
  'Guest page views (session-deduped client-side).';
comment on column public.properties.whatsapp_click_count is
  'Clicks on WhatsApp CTAs from the live guest site.';

create or replace function public.track_property_event(
  p_slug text,
  p_event text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_slug is null or length(trim(p_slug)) = 0 then
    return;
  end if;

  if p_event = 'view' then
    update public.properties
    set view_count = view_count + 1
    where slug = p_slug
      and published = true;
  elsif p_event = 'whatsapp' then
    update public.properties
    set whatsapp_click_count = whatsapp_click_count + 1
    where slug = p_slug
      and published = true;
  end if;
end;
$$;

revoke all on function public.track_property_event(text, text) from public;
grant execute on function public.track_property_event(text, text) to anon, authenticated;
