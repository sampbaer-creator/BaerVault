create table public.bank_connections (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  provider text not null check (provider in ('teller')),
  provider_enrollment_id text not null,
  provider_user_id text not null,
  institution_name text not null check (char_length(institution_name) between 1 and 160),
  encrypted_access_token text not null,
  environment text not null check (environment in ('development', 'production')),
  status text not null default 'connected' check (status in ('connected', 'disconnected', 'sync_error')),
  disconnected_reason text,
  last_synced_at timestamptz,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_enrollment_id),
  unique (id, household_id)
);

create table public.bank_connection_nonces (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  nonce_digest text not null unique check (char_length(nonce_digest) = 64),
  created_by text not null,
  environment text not null check (environment in ('development', 'production')),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.financial_accounts
  add column bank_connection_id uuid,
  add column provider_account_id text,
  add column provider_status text check (provider_status is null or provider_status in ('open', 'closed')),
  add column last_four text check (last_four is null or last_four ~ '^[0-9]{4}$'),
  add column sync_status text check (sync_status is null or sync_status in ('synced', 'sync_error')),
  add constraint financial_accounts_id_household_unique unique (id, household_id),
  add constraint financial_accounts_bank_connection_fk
    foreign key (bank_connection_id, household_id)
    references public.bank_connections(id, household_id) on delete cascade,
  add constraint financial_accounts_provider_unique
    unique (bank_connection_id, provider_account_id);

create table public.bank_transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  financial_account_id uuid not null,
  provider text not null check (provider in ('teller')),
  provider_transaction_id text not null,
  amount numeric(20,2) not null,
  description text not null check (char_length(description) between 1 and 500),
  category text,
  counterparty_name text,
  transaction_type text,
  status text not null check (status in ('pending', 'posted')),
  transaction_date date not null,
  running_balance numeric(20,2),
  raw_provider_data jsonb not null,
  match_status text not null default 'unmatched' check (match_status in ('unmatched', 'matched', 'excluded')),
  matched_budget_entry_id uuid references public.budget_entries(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (financial_account_id, household_id)
    references public.financial_accounts(id, household_id) on delete cascade,
  unique (financial_account_id, provider_transaction_id)
);

create table public.bank_webhook_events (
  id text primary key,
  provider text not null check (provider in ('teller')),
  event_type text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error_message text
);

create index bank_connections_household_idx on public.bank_connections(household_id);
create index bank_connection_nonces_expiry_idx on public.bank_connection_nonces(expires_at) where consumed_at is null;
create index bank_transactions_account_date_idx on public.bank_transactions(household_id, financial_account_id, transaction_date desc);
create trigger bank_connections_set_updated_at before update on public.bank_connections
for each row execute function public.set_updated_at();
create trigger bank_transactions_set_updated_at before update on public.bank_transactions
for each row execute function public.set_updated_at();

alter table public.bank_connections enable row level security;
alter table public.bank_connection_nonces enable row level security;
alter table public.bank_transactions enable row level security;
alter table public.bank_webhook_events enable row level security;
alter table public.bank_connections force row level security;
alter table public.bank_connection_nonces force row level security;
alter table public.bank_transactions force row level security;
alter table public.bank_webhook_events force row level security;

revoke all on public.bank_connections, public.bank_connection_nonces,
  public.bank_transactions, public.bank_webhook_events from anon;
grant select, insert, update, delete on public.bank_connection_nonces, public.bank_transactions to authenticated;
grant select (id, household_id, provider, provider_enrollment_id, institution_name, environment,
  status, disconnected_reason, last_synced_at, created_at, updated_at) on public.bank_connections to authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array['bank_connection_nonces', 'bank_transactions'] loop
    execute format('create policy %1$I_select on public.%1$I for select to authenticated using (exists (select 1 from public.households h where h.id = household_id and h.clerk_org_id = public.current_clerk_org_id()))', table_name);
    execute format('create policy %1$I_insert on public.%1$I for insert to authenticated with check (exists (select 1 from public.households h where h.id = household_id and h.clerk_org_id = public.current_clerk_org_id()))', table_name);
    execute format('create policy %1$I_update on public.%1$I for update to authenticated using (exists (select 1 from public.households h where h.id = household_id and h.clerk_org_id = public.current_clerk_org_id())) with check (exists (select 1 from public.households h where h.id = household_id and h.clerk_org_id = public.current_clerk_org_id()))', table_name);
    execute format('create policy %1$I_delete on public.%1$I for delete to authenticated using (exists (select 1 from public.households h where h.id = household_id and h.clerk_org_id = public.current_clerk_org_id()))', table_name);
  end loop;
end $$;

create policy bank_connections_select on public.bank_connections for select to authenticated
using (exists (select 1 from public.households h where h.id = household_id and h.clerk_org_id = public.current_clerk_org_id()));

-- Webhook events contain no household payload and are accessible only through the service role.
revoke all on public.bank_webhook_events from authenticated;
