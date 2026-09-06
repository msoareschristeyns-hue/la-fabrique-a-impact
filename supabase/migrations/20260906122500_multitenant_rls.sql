-- Multi-tenant RLS hardening for La Fabrique à Impact
-- Relies on public.is_company_member(uuid) and public.is_company_admin(uuid)
-- created by the company provisioning migration.

-- Helper: apply standard company-scoped policies to tables with a company_id column.
do $$
declare
  t text;
begin
  foreach t in array array[
    'diagnostics',
    'priorities',
    'actions',
    'proofs',
    'progress_snapshots',
    'template_workspaces',
    'learning_progress'
  ] loop
    if to_regclass('public.'||t) is not null
       and exists (
         select 1 from information_schema.columns
          where table_schema='public' and table_name=t and column_name='company_id'
       ) then
      execute format('alter table public.%I enable row level security', t);

      execute format('drop policy if exists %I on public.%I', t||'_select_company_member', t);
      execute format(
        'create policy %I on public.%I for select to authenticated using (public.is_company_member(company_id))',
        t||'_select_company_member', t
      );

      execute format('drop policy if exists %I on public.%I', t||'_insert_company_member', t);
      execute format(
        'create policy %I on public.%I for insert to authenticated with check (public.is_company_member(company_id))',
        t||'_insert_company_member', t
      );

      execute format('drop policy if exists %I on public.%I', t||'_update_company_member', t);
      execute format(
        'create policy %I on public.%I for update to authenticated using (public.is_company_member(company_id)) with check (public.is_company_member(company_id))',
        t||'_update_company_member', t
      );

      execute format('drop policy if exists %I on public.%I', t||'_delete_company_member', t);
      execute format(
        'create policy %I on public.%I for delete to authenticated using (public.is_company_member(company_id))',
        t||'_delete_company_member', t
      );
    end if;
  end loop;
end $$;

-- Diagnostic answers are scoped indirectly through their diagnostic.
do $$
begin
  if to_regclass('public.diagnostic_answers') is not null
     and to_regclass('public.diagnostics') is not null then
    alter table public.diagnostic_answers enable row level security;

    drop policy if exists diagnostic_answers_select_company_member on public.diagnostic_answers;
    create policy diagnostic_answers_select_company_member
      on public.diagnostic_answers
      for select to authenticated
      using (
        exists (
          select 1 from public.diagnostics d
           where d.id = diagnostic_answers.diagnostic_id
             and public.is_company_member(d.company_id)
        )
      );

    drop policy if exists diagnostic_answers_insert_company_member on public.diagnostic_answers;
    create policy diagnostic_answers_insert_company_member
      on public.diagnostic_answers
      for insert to authenticated
      with check (
        exists (
          select 1 from public.diagnostics d
           where d.id = diagnostic_answers.diagnostic_id
             and public.is_company_member(d.company_id)
        )
      );

    drop policy if exists diagnostic_answers_update_company_member on public.diagnostic_answers;
    create policy diagnostic_answers_update_company_member
      on public.diagnostic_answers
      for update to authenticated
      using (
        exists (
          select 1 from public.diagnostics d
           where d.id = diagnostic_answers.diagnostic_id
             and public.is_company_member(d.company_id)
        )
      )
      with check (
        exists (
          select 1 from public.diagnostics d
           where d.id = diagnostic_answers.diagnostic_id
             and public.is_company_member(d.company_id)
        )
      );

    drop policy if exists diagnostic_answers_delete_company_member on public.diagnostic_answers;
    create policy diagnostic_answers_delete_company_member
      on public.diagnostic_answers
      for delete to authenticated
      using (
        exists (
          select 1 from public.diagnostics d
           where d.id = diagnostic_answers.diagnostic_id
             and public.is_company_member(d.company_id)
        )
      );
  end if;
end $$;

-- Learning resources are catalogue content, not tenant data.
do $$
begin
  if to_regclass('public.learning_resources') is not null then
    alter table public.learning_resources enable row level security;
    drop policy if exists learning_resources_read_published on public.learning_resources;
    create policy learning_resources_read_published
      on public.learning_resources
      for select to authenticated
      using (coalesce(is_published, false) = true);
  end if;
end $$;

-- Company membership visibility is intentionally limited to the current user.
-- If team management is added later, create explicit admin-only membership policies.
do $$
begin
  if to_regclass('public.company_members') is not null then
    alter table public.company_members enable row level security;
    drop policy if exists company_members_read_self on public.company_members;
    create policy company_members_read_self
      on public.company_members
      for select to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

-- Storage: proof files are private by company and path prefix.
do $$
begin
  if to_regclass('storage.objects') is not null then
    drop policy if exists rse_proofs_select_company_member on storage.objects;
    create policy rse_proofs_select_company_member
      on storage.objects
      for select to authenticated
      using (
        bucket_id = 'rse-proofs'
        and public.is_company_member((storage.foldername(name))[1]::uuid)
      );

    drop policy if exists rse_proofs_insert_company_member on storage.objects;
    create policy rse_proofs_insert_company_member
      on storage.objects
      for insert to authenticated
      with check (
        bucket_id = 'rse-proofs'
        and public.is_company_member((storage.foldername(name))[1]::uuid)
      );

    drop policy if exists rse_proofs_delete_company_member on storage.objects;
    create policy rse_proofs_delete_company_member
      on storage.objects
      for delete to authenticated
      using (
        bucket_id = 'rse-proofs'
        and public.is_company_member((storage.foldername(name))[1]::uuid)
      );

    -- Branding is readable publicly only if the bucket itself is configured public.
    -- Writes remain restricted to company owners/admins by company-prefixed path.
    drop policy if exists company_branding_insert_admin on storage.objects;
    create policy company_branding_insert_admin
      on storage.objects
      for insert to authenticated
      with check (
        bucket_id = 'company-branding'
        and public.is_company_admin((storage.foldername(name))[1]::uuid)
      );

    drop policy if exists company_branding_update_admin on storage.objects;
    create policy company_branding_update_admin
      on storage.objects
      for update to authenticated
      using (
        bucket_id = 'company-branding'
        and public.is_company_admin((storage.foldername(name))[1]::uuid)
      )
      with check (
        bucket_id = 'company-branding'
        and public.is_company_admin((storage.foldername(name))[1]::uuid)
      );

    drop policy if exists company_branding_delete_admin on storage.objects;
    create policy company_branding_delete_admin
      on storage.objects
      for delete to authenticated
      using (
        bucket_id = 'company-branding'
        and public.is_company_admin((storage.foldername(name))[1]::uuid)
      );
  end if;
end $$;
