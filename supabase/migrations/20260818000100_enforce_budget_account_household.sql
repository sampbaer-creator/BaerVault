-- Keep every budget-entry-to-account relationship inside one household.
alter table public.financial_accounts
add constraint financial_accounts_id_household_key unique (id, household_id);

alter table public.budget_entries
drop constraint budget_entries_financial_account_id_fkey;

alter table public.budget_entries
add constraint budget_entries_financial_account_household_fkey
foreign key (financial_account_id, household_id)
references public.financial_accounts(id, household_id)
on delete set null (financial_account_id);
