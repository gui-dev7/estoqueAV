-- AV.Storage v16.5 — RLS Supabase
-- Execute após 01_schema.sql e depois vincule o auth_user_id do admin em profiles.

alter table public.profiles enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.activity_logs enable row level security;
alter table public.infra_rooms enable row level security;
alter table public.system_settings enable row level security;
alter table public.session_collaborators enable row level security;
alter table public.sync_meta enable row level security;
alter table public.change_events enable row level security;

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where auth_user_id = auth.uid()
    and status = 'active'
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() in ('Administrador', 'Desenvolvedor'), false);
$$;

create or replace function public.is_operator_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() in ('Administrador', 'Desenvolvedor', 'Operador'), false);
$$;

grant usage on schema public to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant select on public.inventory_items to anon, authenticated;
grant select on public.inventory_movements to anon, authenticated;
grant select on public.activity_logs to anon, authenticated;
grant select on public.infra_rooms to anon, authenticated;
grant select on public.system_settings to anon, authenticated;
grant select on public.session_collaborators to anon, authenticated;
grant select on public.sync_meta to anon, authenticated;
grant select on public.change_events to anon, authenticated;

grant insert, update, delete on public.profiles to authenticated;
grant insert, update, delete on public.inventory_items to authenticated;
grant insert, update, delete on public.inventory_movements to authenticated;
grant insert, update, delete on public.activity_logs to authenticated;
grant insert, update, delete on public.infra_rooms to authenticated;
grant insert, update, delete on public.system_settings to authenticated;
grant insert, update, delete on public.session_collaborators to authenticated;
grant insert, update, delete on public.sync_meta to authenticated;
grant insert, update, delete on public.change_events to authenticated;
grant usage, select on sequence public.change_events_id_seq to authenticated;

drop policy if exists "profiles_read_public" on public.profiles;
create policy "profiles_read_public" on public.profiles
for select to anon, authenticated
using (true);

drop policy if exists "profiles_write_admin" on public.profiles;
create policy "profiles_write_admin" on public.profiles
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "inventory_read_public" on public.inventory_items;
create policy "inventory_read_public" on public.inventory_items
for select to anon, authenticated
using (true);

drop policy if exists "inventory_write_admin" on public.inventory_items;
create policy "inventory_write_admin" on public.inventory_items
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "movements_read_public" on public.inventory_movements;
create policy "movements_read_public" on public.inventory_movements
for select to anon, authenticated
using (true);

drop policy if exists "movements_write_admin" on public.inventory_movements;
create policy "movements_write_admin" on public.inventory_movements
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "logs_read_public" on public.activity_logs;
create policy "logs_read_public" on public.activity_logs
for select to anon, authenticated
using (true);

drop policy if exists "logs_write_admin" on public.activity_logs;
create policy "logs_write_admin" on public.activity_logs
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "infra_read_public" on public.infra_rooms;
create policy "infra_read_public" on public.infra_rooms
for select to anon, authenticated
using (true);

drop policy if exists "infra_write_admin" on public.infra_rooms;
create policy "infra_write_admin" on public.infra_rooms
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "settings_read_public" on public.system_settings;
create policy "settings_read_public" on public.system_settings
for select to anon, authenticated
using (true);

drop policy if exists "settings_write_admin" on public.system_settings;
create policy "settings_write_admin" on public.system_settings
for all to authenticated
using (public.is_admin())
with check (public.is_admin());



drop policy if exists "session_collaborators_read_public" on public.session_collaborators;
create policy "session_collaborators_read_public" on public.session_collaborators
for select to anon, authenticated
using (active = true);

drop policy if exists "session_collaborators_write_admin" on public.session_collaborators;
create policy "session_collaborators_write_admin" on public.session_collaborators
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "sync_meta_read_public" on public.sync_meta;
create policy "sync_meta_read_public" on public.sync_meta
for select to anon, authenticated
using (true);

drop policy if exists "sync_meta_write_admin" on public.sync_meta;
create policy "sync_meta_write_admin" on public.sync_meta
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "events_read_public" on public.change_events;
create policy "events_read_public" on public.change_events
for select to anon, authenticated
using (true);

drop policy if exists "events_write_admin" on public.change_events;
create policy "events_write_admin" on public.change_events
for all to authenticated
using (public.is_admin())
with check (public.is_admin());
