alter table public.bank_connections drop constraint if exists bank_connections_provider_check;
alter table public.bank_connections add constraint bank_connections_provider_check check (provider in ('teller', 'plaid'));
alter table public.bank_connections drop constraint if exists bank_connections_environment_check;
alter table public.bank_connections add constraint bank_connections_environment_check check (environment in ('development', 'sandbox', 'production'));

alter table public.bank_transactions drop constraint if exists bank_transactions_provider_check;
alter table public.bank_transactions add constraint bank_transactions_provider_check check (provider in ('teller', 'plaid'));

alter table public.bank_webhook_events drop constraint if exists bank_webhook_events_provider_check;
alter table public.bank_webhook_events add constraint bank_webhook_events_provider_check check (provider in ('teller', 'plaid'));

alter table public.income_entries
  add column financial_account_id uuid,
  add column provider text,
  add column provider_transaction_id text,
  add constraint income_entries_financial_account_household_fk foreign key (financial_account_id, household_id) references public.financial_accounts(id, household_id) on delete set null,
  add constraint income_entries_provider_check check (provider is null or provider in ('plaid')),
  add constraint income_entries_provider_transaction_unique unique (provider, provider_transaction_id);
