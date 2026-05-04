-- AV.Storage v16.5 — Schema Supabase/Postgres
-- Execute no SQL Editor do Supabase antes da carga inicial.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id text primary key,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  email text,
  role text not null default 'Convidado' check (role in ('Administrador', 'Desenvolvedor', 'Operador', 'Convidado')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  is_system boolean not null default false,
  is_guest boolean not null default false,
  last_access timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id text primary key,
  name text not null,
  category text not null default 'Outros',
  quantity integer not null default 0 check (quantity >= 0),
  price numeric(12,2) not null default 0 check (price >= 0),
  status text not null default 'ok',
  manual_purchase_qty integer not null default 0 check (manual_purchase_qty >= 0),
  deadline date,
  is_critical boolean not null default false,
  version integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id text primary key,
  item_id text references public.inventory_items(id) on delete set null,
  type text not null check (type in ('in', 'out')),
  quantity integer not null check (quantity > 0),
  user_name text,
  removed_by text,
  actor_name text,
  session_name text,
  date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id text primary key,
  section text not null default 'system',
  action text not null default 'update',
  message text not null,
  actor_id text,
  target_user_id text,
  target_room_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.infra_rooms (
  id text primary key,
  name text not null,
  unit integer not null default 1,
  floor text,
  equip jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.system_settings (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);


create table if not exists public.session_collaborators (
  id text primary key,
  name text not null unique,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sync_meta (
  id integer primary key check (id = 1),
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists public.change_events (
  id bigserial primary key,
  revision bigint not null,
  section text not null,
  action text not null,
  message text not null,
  actor_id text,
  target_user_id text,
  target_room_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_auth_user_id on public.profiles(auth_user_id);
create index if not exists idx_profiles_role_status on public.profiles(role, status);
create index if not exists idx_inventory_items_category on public.inventory_items(category);
create index if not exists idx_inventory_items_deadline on public.inventory_items(deadline);
create index if not exists idx_inventory_movements_item_date on public.inventory_movements(item_id, date desc);
create index if not exists idx_activity_logs_created_at on public.activity_logs(created_at desc);
create index if not exists idx_activity_logs_targets on public.activity_logs(target_user_id, target_room_id);
create index if not exists idx_infra_rooms_unit on public.infra_rooms(unit);
create index if not exists idx_session_collaborators_active on public.session_collaborators(active, sort_order);
create index if not exists idx_change_events_id on public.change_events(id);
create index if not exists idx_change_events_revision on public.change_events(revision);

insert into public.sync_meta (id, revision, updated_at)
values (1, 1, now())
on conflict (id) do nothing;
