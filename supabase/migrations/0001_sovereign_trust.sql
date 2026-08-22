-- Sovereign Stitch trust/evidence schema for Supabase/Postgres.
-- Public schema is used for Data API compatibility, with RLS deny-by-default.

create extension if not exists pgcrypto;

create table if not exists public.sovereign_authorities (
  user_id uuid primary key references auth.users(id) on delete cascade,
  authority_role text not null check (authority_role in ('operator','verifier','validator','certifier','auditor')),
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.sovereign_items (
  id uuid primary key default gen_random_uuid(),
  producer_id uuid not null references auth.users(id),
  source text not null,
  payload_hash text not null,
  risk_score numeric not null default 0 check (risk_score between 0 and 100),
  state text not null default 'input' check (state in ('input','verification','validation','certification','trusted','rejected','quarantined','recovery_pending')),
  lineage jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.sovereign_decisions (
  id bigint generated always as identity primary key,
  item_id uuid not null references public.sovereign_items(id),
  phase text not null check (phase in ('verification','validation','certification')),
  actor_id uuid not null references auth.users(id),
  actor_role text not null check (actor_role in ('verifier','validator','certifier')),
  result text not null check (result in ('pass','fail')),
  evidence jsonb not null default '{}'::jsonb,
  prev_hash text not null,
  decision_hash text not null unique,
  created_at timestamptz not null default now(),
  unique(item_id, phase)
);

create table if not exists public.sovereign_recovery_evidence (
  id bigint generated always as identity primary key,
  item_id uuid references public.sovereign_items(id),
  node_ref text not null,
  healer_id uuid references auth.users(id),
  before_hash text not null,
  after_hash text not null,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sovereign_items_state_idx on public.sovereign_items(state);
create index if not exists sovereign_decisions_item_idx on public.sovereign_decisions(item_id, phase);
create index if not exists sovereign_recovery_item_idx on public.sovereign_recovery_evidence(item_id);

alter table public.sovereign_authorities enable row level security;
alter table public.sovereign_items enable row level security;
alter table public.sovereign_decisions enable row level security;
alter table public.sovereign_recovery_evidence enable row level security;

-- Authenticated users may see only their own authority assignment.
create policy authorities_self_read on public.sovereign_authorities
for select to authenticated
using ((select auth.uid()) = user_id);

-- Producers can create/read their own submitted items, but cannot promote trust state through Data API.
create policy items_owner_read on public.sovereign_items
for select to authenticated
using ((select auth.uid()) = producer_id);

create policy items_owner_insert on public.sovereign_items
for insert to authenticated
with check ((select auth.uid()) = producer_id and state = 'input');

-- Decision and recovery evidence are intentionally not writable through the public Data API.
-- Backend/Edge authority code must perform authenticated, scoped writes after checking app_metadata/authority records.
revoke insert, update, delete on public.sovereign_decisions from anon, authenticated;
revoke insert, update, delete on public.sovereign_recovery_evidence from anon, authenticated;
revoke update, delete on public.sovereign_items from anon, authenticated;
revoke insert, update, delete on public.sovereign_authorities from anon, authenticated;

-- Immutable evidence at the database layer.
create or replace function public.reject_sovereign_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'Sovereign evidence is append-only';
end;
$$;

revoke all on function public.reject_sovereign_mutation() from public, anon, authenticated;

drop trigger if exists sovereign_decisions_no_update on public.sovereign_decisions;
create trigger sovereign_decisions_no_update before update or delete on public.sovereign_decisions
for each row execute function public.reject_sovereign_mutation();

drop trigger if exists sovereign_recovery_no_update on public.sovereign_recovery_evidence;
create trigger sovereign_recovery_no_update before update or delete on public.sovereign_recovery_evidence
for each row execute function public.reject_sovereign_mutation();

-- Views use caller permissions and therefore preserve RLS.
create or replace view public.sovereign_trust_status
with (security_invoker = true)
as
select i.id, i.source, i.payload_hash, i.state, i.created_at,
       count(d.id) filter (where d.result = 'pass') as passed_decisions,
       count(d.id) filter (where d.result = 'fail') as failed_decisions
from public.sovereign_items i
left join public.sovereign_decisions d on d.item_id = i.id
group by i.id;
