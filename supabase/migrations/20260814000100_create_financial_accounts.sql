create table public.financial_accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  institution text not null default '' check (char_length(institution) <= 100),
  account_type text not null check (account_type in ('checking', 'savings', 'cash', 'credit_card', 'loan', 'other')),
  ownership text not null default 'joint' check (ownership in ('user', 'spouse', 'joint', 'other')),
  balance numeric(14,2) not null default 0 check (balance >= 0),
  credit_limit numeric(14,2) check (credit_limit is null or credit_limit > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index financial_accounts_household_id_idx on public.financial_accounts(household_id);
create trigger financial_accounts_set_updated_at before update on public.financial_accounts
for each row execute function public.set_updated_at();

alter table public.financial_accounts enable row level security;
alter table public.financial_accounts force row level security;
revoke all on public.financial_accounts from anon;
grant select, insert, update, delete on public.financial_accounts to authenticated;

create policy financial_accounts_select on public.financial_accounts for select to authenticated
using (exists (select 1 from public.households h where h.id = household_id and h.clerk_org_id = public.current_clerk_org_id()));
create policy financial_accounts_insert on public.financial_accounts for insert to authenticated
with check (exists (select 1 from public.households h where h.id = household_id and h.clerk_org_id = public.current_clerk_org_id()));
create policy financial_accounts_update on public.financial_accounts for update to authenticated
using (exists (select 1 from public.households h where h.id = household_id and h.clerk_org_id = public.current_clerk_org_id()))
with check (exists (select 1 from public.households h where h.id = household_id and h.clerk_org_id = public.current_clerk_org_id()));
create policy financial_accounts_delete on public.financial_accounts for delete to authenticated
using (exists (select 1 from public.households h where h.id = household_id and h.clerk_org_id = public.current_clerk_org_id()));
