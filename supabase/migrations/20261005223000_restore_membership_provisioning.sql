-- Restore authenticated company membership provisioning for La Fabrique a Impact.
-- Keeps the private workspace self-healing when an authenticated user has
-- company_name metadata but no company_members row yet.

create or replace function public.ensure_my_company_membership()
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_company_id uuid;
  v_company_name text;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select cm.company_id
    into v_company_id
    from public.company_members cm
   where cm.user_id = v_user_id
   limit 1;

  if v_company_id is not null then
    return v_company_id;
  end if;

  select nullif(trim(coalesce(u.raw_user_meta_data ->> 'company_name', '')), '')
    into v_company_name
    from auth.users u
   where u.id = v_user_id;

  if v_company_name is null then
    raise exception 'company name missing';
  end if;

  insert into public.companies(name, created_by)
  values (v_company_name, v_user_id)
  returning id into v_company_id;

  return v_company_id;
end;
$$;

revoke all on function public.ensure_my_company_membership() from public;
grant execute on function public.ensure_my_company_membership() to authenticated;
