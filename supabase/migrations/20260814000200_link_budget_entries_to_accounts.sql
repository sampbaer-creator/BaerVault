alter table public.budget_entries
add column financial_account_id uuid references public.financial_accounts(id) on delete set null;

create index budget_entries_financial_account_idx
on public.budget_entries(household_id, financial_account_id)
where financial_account_id is not null;
