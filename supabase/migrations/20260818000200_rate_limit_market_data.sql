-- Shared limits protect the server-side Twelve Data credential across instances.
create table public.market_data_rate_limits (
  bucket_key text not null,
  window_start timestamptz not null,
  request_count integer not null check (request_count >= 0),
  primary key (bucket_key, window_start)
);

create index market_data_rate_limits_window_idx
on public.market_data_rate_limits(window_start);

alter table public.market_data_rate_limits enable row level security;
alter table public.market_data_rate_limits force row level security;
revoke all on public.market_data_rate_limits from public, anon, authenticated;

create or replace function public.consume_market_data_quota(request_cost integer)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  organization_id text := coalesce(auth.jwt() ->> 'org_id', auth.jwt() -> 'o' ->> 'id');
  user_id text := auth.jwt() ->> 'sub';
  current_window timestamptz := to_timestamp(floor(extract(epoch from now()) / 900) * 900);
  user_allowed boolean;
  organization_allowed boolean;
  global_allowed boolean;
begin
  if organization_id is null or user_id is null or request_cost < 1 or request_cost > 10 then
    return false;
  end if;

  delete from public.market_data_rate_limits
  where window_start < now() - interval '1 day';

  insert into public.market_data_rate_limits as limits (bucket_key, window_start, request_count)
  values ('user:' || user_id, current_window, request_cost)
  on conflict (bucket_key, window_start) do update
  set request_count = limits.request_count + excluded.request_count
  where limits.request_count + excluded.request_count <= 60
  returning true into user_allowed;

  if user_allowed is not true then return false; end if;

  insert into public.market_data_rate_limits as limits (bucket_key, window_start, request_count)
  values ('org:' || organization_id, current_window, request_cost)
  on conflict (bucket_key, window_start) do update
  set request_count = limits.request_count + excluded.request_count
  where limits.request_count + excluded.request_count <= 150
  returning true into organization_allowed;

  if organization_allowed is not true then return false; end if;

  insert into public.market_data_rate_limits as limits (bucket_key, window_start, request_count)
  values ('global', current_window, request_cost)
  on conflict (bucket_key, window_start) do update
  set request_count = limits.request_count + excluded.request_count
  where limits.request_count + excluded.request_count <= 1000
  returning true into global_allowed;

  return global_allowed is true;
end;
$$;

revoke execute on function public.consume_market_data_quota(integer) from public, anon;
grant execute on function public.consume_market_data_quota(integer) to authenticated;
