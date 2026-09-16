-- Keep public.owners.email in sync when auth.users.email changes
-- (email confirm / change-email flows).

create or replace function public.sync_owner_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.owners
    set email = coalesce(new.email, '')
    where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
after update of email on auth.users
for each row
execute function public.sync_owner_email();
