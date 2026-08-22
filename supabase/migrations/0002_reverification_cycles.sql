-- Sovereign Stitch recovery must return through VERIFY -> VALIDATE -> CERTIFY.
alter table public.sovereign_decisions add column if not exists trust_cycle integer not null default 1 check (trust_cycle > 0);
alter table public.sovereign_recovery_evidence add column if not exists trust_cycle integer not null default 1 check (trust_cycle > 0);
alter table public.sovereign_decisions drop constraint if exists sovereign_decisions_item_id_phase_key;
create unique index if not exists sovereign_decisions_item_cycle_phase_uq on public.sovereign_decisions(item_id, trust_cycle, phase);

create or replace function public.record_sovereign_decision(
  p_item_id uuid, p_phase text, p_actor_id uuid, p_result text,
  p_evidence jsonb, p_trust_cycle integer default 1
) returns public.sovereign_decisions
language plpgsql security invoker set search_path=public,pg_temp as $$
declare
  v_role text; v_producer uuid; v_state text; v_prev_hash text; v_hash text;
  v_row public.sovereign_decisions; v_required_role text;
begin
  if p_trust_cycle < 1 then raise exception 'invalid trust cycle'; end if;
  v_required_role := case p_phase when 'verification' then 'verifier' when 'validation' then 'validator' when 'certification' then 'certifier' else null end;
  if v_required_role is null then raise exception 'invalid phase'; end if;
  select authority_role into v_role from public.sovereign_authorities where user_id=p_actor_id and enabled=true;
  if v_role is distinct from v_required_role then raise exception 'authority role mismatch'; end if;
  select producer_id,state into v_producer,v_state from public.sovereign_items where id=p_item_id for update;
  if v_producer is null then raise exception 'item not found'; end if;
  if v_producer=p_actor_id then raise exception 'producer cannot certify own item'; end if;
  if exists(select 1 from public.sovereign_decisions where item_id=p_item_id and trust_cycle=p_trust_cycle and actor_id=p_actor_id) then raise exception 'same actor cannot decide multiple phases in a trust cycle'; end if;
  if p_phase='verification' and p_trust_cycle>1 then
    if v_state <> 'recovery_pending' then raise exception 'reverification requires recovery_pending state'; end if;
    if not exists(select 1 from public.sovereign_recovery_evidence where item_id=p_item_id and trust_cycle=p_trust_cycle) then raise exception 'reverification requires preserved recovery evidence'; end if;
  end if;
  if p_phase='validation' and not exists(select 1 from public.sovereign_decisions where item_id=p_item_id and trust_cycle=p_trust_cycle and phase='verification' and result='pass') then raise exception 'verification required'; end if;
  if p_phase='certification' and not exists(select 1 from public.sovereign_decisions where item_id=p_item_id and trust_cycle=p_trust_cycle and phase='validation' and result='pass') then raise exception 'validation required'; end if;
  select decision_hash into v_prev_hash from public.sovereign_decisions order by id desc limit 1;
  v_prev_hash := coalesce(v_prev_hash,'GENESIS');
  v_hash := encode(extensions.digest(concat_ws('|',p_item_id::text,p_trust_cycle::text,p_phase,p_actor_id::text,p_result,coalesce(p_evidence::text,'{}'),v_prev_hash),'sha256'),'hex');
  insert into public.sovereign_decisions(item_id,trust_cycle,phase,actor_id,actor_role,result,evidence,prev_hash,decision_hash)
  values(p_item_id,p_trust_cycle,p_phase,p_actor_id,v_role,p_result,coalesce(p_evidence,'{}'::jsonb),v_prev_hash,v_hash) returning * into v_row;
  if p_result='fail' then update public.sovereign_items set state='rejected' where id=p_item_id;
  elsif p_phase='verification' then update public.sovereign_items set state='validation' where id=p_item_id;
  elsif p_phase='validation' then update public.sovereign_items set state='certification' where id=p_item_id;
  elsif p_phase='certification' then update public.sovereign_items set state='trusted' where id=p_item_id;
  end if;
  return v_row;
end; $$;

revoke all on function public.record_sovereign_decision(uuid,text,uuid,text,jsonb,integer) from public,anon,authenticated;
grant execute on function public.record_sovereign_decision(uuid,text,uuid,text,jsonb,integer) to service_role;
