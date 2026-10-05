revoke execute on function public.ensure_my_company_membership() from anon;
revoke execute on function public.ensure_my_company_membership() from public;
grant execute on function public.ensure_my_company_membership() to authenticated;
