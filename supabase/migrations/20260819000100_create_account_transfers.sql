create table public.account_transfers (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  from_account_id uuid not null,
  to_account_id uuid not null,
  amount numeric(14, 2) not null check (amount > 0),
  transfer_date date not null,
  note text not null default '' check (char_length(note) <= 160),
  created_at timestamptz not null default now(),
  check (from_account_id <> to_account_id),
  foreign key (from_account_id, household_id)
    references public.financial_accounts(id, household_id) on delete cascade,
  foreign key (to_account_id, household_id)
    references public.financial_accounts(id, household_id) on delete cascade
);

create index account_transfers_household_date_idx
on public.account_transfers(household_id, transfer_date desc, created_at desc);

create index account_transfers_from_account_idx
on public.account_transfers(household_id, from_account_id, transfer_date desc);

create index account_transfers_to_account_idx
on public.account_transfers(household_id, to_account_id, transfer_date desc);

alter table public.account_transfers enable row level security;
alter table public.account_transfers force row level security;

revoke all on public.account_transfers from anon;
grant select on public.account_transfers to authenticated;

create policy account_transfers_select on public.account_transfers
for select to authenticated
using (
  exists (
    select 1
    from public.households h
    where h.id = household_id
      and h.clerk_org_id = public.current_clerk_org_id()
  )
);

create or replace function public.transfer_between_financial_accounts(
  p_from_account_id uuid,
  p_to_account_id uuid,
  p_amount numeric,
  p_transfer_date date,
  p_note text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_org_id text := public.current_clerk_org_id();
  source_account public.financial_accounts%rowtype;
  destination_account public.financial_accounts%rowtype;
  transfer_id uuid;
  source_balance numeric(14, 2);
  destination_balance numeric(14, 2);
  source_updated_at timestamptz;
  destination_updated_at timestamptz;
begin
  if current_org_id is null or current_org_id = '' then
    raise exception using errcode = '42501', message = 'Authentication is required.';
  end if;

  if p_from_account_id is null
    or p_to_account_id is null
    or p_from_account_id = p_to_account_id
    or p_amount is null
    or p_amount <= 0
    or p_amount <> round(p_amount, 2)
    or p_transfer_date is null
    or char_length(coalesce(p_note, '')) > 160 then
    raise exception using errcode = '23514', message = 'Invalid transfer details.';
  end if;

  -- Lock both accounts in a stable order so concurrent opposite-direction
  -- transfers cannot overwrite one another or deadlock.
  perform fa.id
  from public.financial_accounts fa
  join public.households h on h.id = fa.household_id
  where fa.id in (p_from_account_id, p_to_account_id)
    and h.clerk_org_id = current_org_id
  order by fa.id
  for update of fa;

  select fa.* into source_account
  from public.financial_accounts fa
  join public.households h on h.id = fa.household_id
  where fa.id = p_from_account_id
    and h.clerk_org_id = current_org_id;

  select fa.* into destination_account
  from public.financial_accounts fa
  join public.households h on h.id = fa.household_id
  where fa.id = p_to_account_id
    and h.clerk_org_id = current_org_id;

  if source_account.id is null or destination_account.id is null then
    raise exception using errcode = '42501', message = 'One or both accounts are unavailable.';
  end if;

  if source_account.household_id <> destination_account.household_id then
    raise exception using errcode = '42501', message = 'Accounts must belong to the same household.';
  end if;

  if source_account.account_type in ('credit_card', 'loan')
    or destination_account.account_type in ('credit_card', 'loan') then
    raise exception using errcode = '23514', message = 'Debt payments require a payment transaction, not an account transfer.';
  end if;

  if source_account.balance < p_amount then
    raise exception using errcode = '23514', message = 'The source account has insufficient funds.';
  end if;

  update public.financial_accounts
  set balance = balance - p_amount
  where id = source_account.id
  returning balance, updated_at into source_balance, source_updated_at;

  update public.financial_accounts
  set balance = balance + p_amount
  where id = destination_account.id
  returning balance, updated_at into destination_balance, destination_updated_at;

  insert into public.account_transfers (
    household_id,
    from_account_id,
    to_account_id,
    amount,
    transfer_date,
    note
  ) values (
    source_account.household_id,
    source_account.id,
    destination_account.id,
    p_amount,
    p_transfer_date,
    trim(coalesce(p_note, ''))
  )
  returning id into transfer_id;

  return jsonb_build_object(
    'id', transfer_id,
    'fromAccountId', source_account.id,
    'toAccountId', destination_account.id,
    'amount', p_amount,
    'date', p_transfer_date,
    'fromBalance', source_balance,
    'toBalance', destination_balance,
    'fromUpdatedAt', source_updated_at,
    'toUpdatedAt', destination_updated_at
  );
end;
$$;

revoke execute on function public.transfer_between_financial_accounts(uuid, uuid, numeric, date, text)
from public, anon;

grant execute on function public.transfer_between_financial_accounts(uuid, uuid, numeric, date, text)
to authenticated;
