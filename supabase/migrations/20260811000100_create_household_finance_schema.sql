create extension if not exists pgcrypto;

create or replace function public.current_clerk_org_id()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'org_id', auth.jwt() -> 'o' ->> 'id');
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.households (
  id uuid primary key default gen_random_uuid(),
  clerk_org_id text not null unique,
  name text not null check (char_length(name) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.investment_accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  account_type text not null check (char_length(account_type) between 1 and 60),
  ownership text not null default 'joint' check (ownership in ('user', 'spouse', 'joint', 'other')),
  contribution_frequency text check (contribution_frequency in ('weekly', 'biweekly', 'monthly', 'quarterly', 'annually', 'none')),
  contribution_amount numeric(20, 2) not null default 0 check (contribution_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, household_id)
);

create table public.holdings (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  investment_account_id uuid not null,
  symbol text not null check (symbol ~ '^[A-Z0-9./-]{1,15}$'),
  investment_name text not null check (char_length(investment_name) between 1 and 120),
  shares numeric(24, 8) not null default 0 check (shares >= 0),
  average_cost numeric(20, 6) not null default 0 check (average_cost >= 0),
  purchase_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, household_id),
  unique (investment_account_id, symbol),
  foreign key (investment_account_id, household_id)
    references public.investment_accounts(id, household_id) on delete cascade
);

create table public.purchase_lots (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  holding_id uuid not null,
  shares numeric(24, 8) not null check (shares > 0),
  price_per_share numeric(20, 6) not null check (price_per_share >= 0),
  purchase_date date not null,
  created_at timestamptz not null default now(),
  foreign key (holding_id, household_id)
    references public.holdings(id, household_id) on delete cascade
);

create table public.budget_months (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  year integer not null check (year between 1900 and 2200),
  month integer not null check (month between 1 and 12),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, year, month),
  unique (id, household_id)
);

create table public.budget_categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  budget_month_id uuid not null,
  name text not null check (char_length(name) between 1 and 80),
  planned_amount numeric(20, 2) not null default 0 check (planned_amount >= 0),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, household_id),
  foreign key (budget_month_id, household_id)
    references public.budget_months(id, household_id) on delete cascade
);

create table public.budget_entries (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  budget_category_id uuid not null,
  description text not null check (char_length(description) between 1 and 160),
  amount numeric(20, 2) not null check (amount > 0),
  entry_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (budget_category_id, household_id)
    references public.budget_categories(id, household_id) on delete cascade
);

create table public.income_entries (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  description text not null check (char_length(description) between 1 and 160),
  amount numeric(20, 2) not null check (amount > 0),
  income_date date not null,
  owner_label text check (owner_label is null or char_length(owner_label) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolio_snapshots (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  investment_account_id uuid,
  snapshot_date date not null,
  portfolio_value numeric(20, 2) not null check (portfolio_value >= 0),
  amount_invested numeric(20, 2) check (amount_invested is null or amount_invested >= 0),
  created_at timestamptz not null default now(),
  foreign key (investment_account_id, household_id)
    references public.investment_accounts(id, household_id) on delete cascade,
  unique (household_id, investment_account_id, snapshot_date)
);

create index investment_accounts_household_idx on public.investment_accounts(household_id);
create index holdings_household_account_idx on public.holdings(household_id, investment_account_id);
create index purchase_lots_household_holding_idx on public.purchase_lots(household_id, holding_id);
create index budget_months_household_date_idx on public.budget_months(household_id, year desc, month desc);
create index budget_categories_month_idx on public.budget_categories(household_id, budget_month_id, sort_order);
create index budget_entries_category_date_idx on public.budget_entries(household_id, budget_category_id, entry_date desc);
create index income_entries_household_date_idx on public.income_entries(household_id, income_date desc);
create index portfolio_snapshots_household_date_idx on public.portfolio_snapshots(household_id, snapshot_date desc);

create trigger households_set_updated_at before update on public.households
for each row execute function public.set_updated_at();
create trigger investment_accounts_set_updated_at before update on public.investment_accounts
for each row execute function public.set_updated_at();
create trigger holdings_set_updated_at before update on public.holdings
for each row execute function public.set_updated_at();
create trigger budget_months_set_updated_at before update on public.budget_months
for each row execute function public.set_updated_at();
create trigger budget_categories_set_updated_at before update on public.budget_categories
for each row execute function public.set_updated_at();
create trigger budget_entries_set_updated_at before update on public.budget_entries
for each row execute function public.set_updated_at();
create trigger income_entries_set_updated_at before update on public.income_entries
for each row execute function public.set_updated_at();

create or replace function public.recalculate_holding_from_lots()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_holding_id uuid := coalesce(new.holding_id, old.holding_id);
  target_household_id uuid := coalesce(new.household_id, old.household_id);
begin
  update public.holdings h
  set
    shares = totals.total_shares,
    average_cost = case when totals.total_shares = 0 then 0 else totals.total_cost / totals.total_shares end,
    purchase_date = totals.first_purchase
  from (
    select
      coalesce(sum(pl.shares), 0) as total_shares,
      coalesce(sum(pl.shares * pl.price_per_share), 0) as total_cost,
      min(pl.purchase_date) as first_purchase
    from public.purchase_lots pl
    where pl.holding_id = target_holding_id and pl.household_id = target_household_id
  ) totals
  where h.id = target_holding_id and h.household_id = target_household_id;
  return coalesce(new, old);
end;
$$;

create trigger purchase_lots_recalculate_holding
after insert or update or delete on public.purchase_lots
for each row execute function public.recalculate_holding_from_lots();

alter table public.households enable row level security;
alter table public.investment_accounts enable row level security;
alter table public.holdings enable row level security;
alter table public.purchase_lots enable row level security;
alter table public.budget_months enable row level security;
alter table public.budget_categories enable row level security;
alter table public.budget_entries enable row level security;
alter table public.income_entries enable row level security;
alter table public.portfolio_snapshots enable row level security;

alter table public.households force row level security;
alter table public.investment_accounts force row level security;
alter table public.holdings force row level security;
alter table public.purchase_lots force row level security;
alter table public.budget_months force row level security;
alter table public.budget_categories force row level security;
alter table public.budget_entries force row level security;
alter table public.income_entries force row level security;
alter table public.portfolio_snapshots force row level security;

revoke all on public.households, public.investment_accounts, public.holdings,
  public.purchase_lots, public.budget_months, public.budget_categories,
  public.budget_entries, public.income_entries, public.portfolio_snapshots from anon;
grant usage on schema public to authenticated;
grant select, insert, update on public.households to authenticated;
grant select, insert, update, delete on public.investment_accounts,
  public.purchase_lots, public.budget_months, public.budget_categories,
  public.budget_entries, public.income_entries, public.portfolio_snapshots to authenticated;
grant select, delete on public.holdings to authenticated;
grant insert (household_id, investment_account_id, symbol, investment_name) on public.holdings to authenticated;
grant update (symbol, investment_name) on public.holdings to authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.recalculate_holding_from_lots() from public, anon, authenticated;
revoke execute on function public.current_clerk_org_id() from public, anon;
grant execute on function public.current_clerk_org_id() to authenticated;

create policy households_select on public.households for select to authenticated
using (clerk_org_id = public.current_clerk_org_id());
create policy households_insert on public.households for insert to authenticated
with check (clerk_org_id = public.current_clerk_org_id());
create policy households_update on public.households for update to authenticated
using (clerk_org_id = public.current_clerk_org_id())
with check (clerk_org_id = public.current_clerk_org_id());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'investment_accounts', 'holdings', 'purchase_lots', 'budget_months',
    'budget_categories', 'budget_entries', 'income_entries', 'portfolio_snapshots'
  ] loop
    execute format(
      'create policy %1$I_select on public.%1$I for select to authenticated using (exists (select 1 from public.households h where h.id = household_id and h.clerk_org_id = public.current_clerk_org_id()))',
      table_name
    );
    execute format(
      'create policy %1$I_insert on public.%1$I for insert to authenticated with check (exists (select 1 from public.households h where h.id = household_id and h.clerk_org_id = public.current_clerk_org_id()))',
      table_name
    );
    execute format(
      'create policy %1$I_update on public.%1$I for update to authenticated using (exists (select 1 from public.households h where h.id = household_id and h.clerk_org_id = public.current_clerk_org_id())) with check (exists (select 1 from public.households h where h.id = household_id and h.clerk_org_id = public.current_clerk_org_id()))',
      table_name
    );
    execute format(
      'create policy %1$I_delete on public.%1$I for delete to authenticated using (exists (select 1 from public.households h where h.id = household_id and h.clerk_org_id = public.current_clerk_org_id()))',
      table_name
    );
  end loop;
end $$;
