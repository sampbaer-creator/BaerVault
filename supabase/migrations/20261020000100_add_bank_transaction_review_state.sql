-- Posted transactions that already existed at rollout are not new review work.
-- New posted transactions remain unreviewed until a household member reviews them.
alter table public.bank_transactions
  add column reviewed_at timestamptz;

update public.bank_transactions
set reviewed_at = now()
where status = 'posted';

create index bank_transactions_review_queue_idx
  on public.bank_transactions (household_id, transaction_date desc)
  where status = 'posted' and reviewed_at is null;

-- Household members can update the review marker without editing provider data.
revoke update on public.bank_transactions from authenticated;
grant update (reviewed_at) on public.bank_transactions to authenticated;

-- The existing bank_transactions_select and bank_transactions_update RLS
-- policies scope reads and writes by the active Clerk household. They cover
-- reviewed_at without widening access to any other household.
