create table public.budget_advice_rate_limits (
  household_id uuid primary key references public.households(id) on delete cascade,
  last_request timestamptz not null,
  day_start date not null,
  request_count integer not null
);
alter table public.budget_advice_rate_limits enable row level security;
revoke all on public.budget_advice_rate_limits from public, anon, authenticated;

create or replace function public.consume_budget_advice_quota()
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  household uuid;
  allowed boolean;
begin
  if auth.jwt() ->> 'sub' is null then return false; end if;
  select id into household from public.households
  where clerk_org_id = coalesce(auth.jwt() ->> 'org_id', auth.jwt() -> 'o' ->> 'id');
  if household is null then return false; end if;
  insert into public.budget_advice_rate_limits as quota (household_id, last_request, day_start, request_count)
  values (household, now(), current_date, 1)
  on conflict (household_id) do update set
    last_request = now(), day_start = current_date,
    request_count = case when quota.day_start = current_date then quota.request_count + 1 else 1 end
  where quota.last_request <= now() - interval '1 minute'
    and (quota.day_start < current_date or quota.request_count < 20)
  returning true into allowed;
  return allowed is true;
end;
$$;
revoke execute on function public.consume_budget_advice_quota() from public, anon;
grant execute on function public.consume_budget_advice_quota() to authenticated;
