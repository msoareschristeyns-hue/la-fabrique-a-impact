-- Company provisioning for La Fabrique à Impact
-- Assumes public.companies(id uuid default ..., name text, ...)
-- and public.company_members(company_id uuid, user_id uuid, role text, ...)

create or replace function public.provision_company_for_user(
  p_user_id uuid,
  p_company_name text
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_company_id uuid;
  v_company_name text := trim(coalesce(p_company_name, ''));
begin
  if p_user_id is null then
    raise exception 'user id required';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  select cm.company_id
    into v_company_id
    from public.company_members cm
   where cm.user_id = p_user_id
   limit 1;

  if v_company_id is not null then
    return v_company_id;
  end if;

  if v_company_name = '' then
    raise exception 'company name required';
  end if;

  insert into public.companies(name)
  values (v_company_name)
  returning id into v_company_id;

  insert into public.company_members(company_id, user_id, role)
  values (v_company_id, p_user_id, 'owner');

  return v_company_id;
end;
$$;

revoke all on function public.provision_company_for_user(uuid, text) from public;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_company_name text;
begin
  v_company_name := trim(coalesce(new.raw_user_meta_data ->> 'company_name', ''));

  if v_company_name <> '' then
    perform public.provision_company_for_user(new.id, v_company_name);
  end if;

  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public;

drop trigger if exists on_auth_user_created_provision_company on auth.users;
create trigger on_auth_user_created_provision_company
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create or replace function public.ensure_my_company_membership()
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_company_name text;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select trim(coalesce(u.raw_user_meta_data ->> 'company_name', ''))
    into v_company_name
    from auth.users u
   where u.id = v_user_id;

  return public.provision_company_for_user(v_user_id, v_company_name);
end;
$$;

revoke all on function public.ensure_my_company_membership() from public;
grant execute on function public.ensure_my_company_membership() to authenticated;

alter table public.companies enable row level security;
alter table public.company_members enable row level security;

create or replace function public.is_company_member(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
      from public.company_members cm
     where cm.company_id = p_company_id
       and cm.user_id = auth.uid()
  );
$$;

create or replace function public.is_company_admin(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
      from public.company_members cm
     where cm.company_id = p_company_id
       and cm.user_id = auth.uid()
       and cm.role in ('owner', 'admin')
  );
$$;

revoke all on function public.is_company_member(uuid) from public;
revoke all on function public.is_company_admin(uuid) from public;
grant execute on function public.is_company_member(uuid) to authenticated;
grant execute on function public.is_company_admin(uuid) to authenticated;

drop policy if exists "company_members_read_self" on public.company_members;
create policy "company_members_read_self"
on public.company_members
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "companies_read_member" on public.companies;
create policy "companies_read_member"
on public.companies
for select
to authenticated
using (public.is_company_member(id));

drop policy if exists "companies_update_admin" on public.companies;
create policy "companies_update_admin"
on public.companies
for update
to authenticated
using (public.is_company_admin(id))
with check (public.is_company_admin(id));
