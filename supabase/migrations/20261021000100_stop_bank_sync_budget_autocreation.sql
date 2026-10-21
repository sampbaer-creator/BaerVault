-- Bank sync remains the source for imported account and transaction records.
-- Purchases enter the budget ledger only when a household member logs them.
-- This prevents a credit-card purchase and its later payoff from being counted twice.

delete from public.budget_entries
where bank_transaction_id is not null;

update public.bank_transactions
set matched_budget_entry_id = null,
    match_status = 'unmatched'
where matched_budget_entry_id is not null;

create or replace function public.apply_bank_sync(
  connection_id uuid, expected_cursor text, next_cursor text,
  account_rows jsonb, transaction_rows jsonb, removed_ids text[]
) returns void language plpgsql security invoker set search_path = '' as $$
declare
  conn public.bank_connections%rowtype;
  a jsonb; t jsonb; account_id uuid; transaction_id uuid;
  transaction_date date; transaction_amount numeric;
  is_excluded boolean;
begin
  select * into strict conn from public.bank_connections where id = connection_id for update;
  if conn.sync_cursor is distinct from expected_cursor then
    raise exception 'Sync cursor changed; retry the update' using errcode = '40001';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(conn.household_id::text, 0));

  delete from public.income_entries i where i.household_id = conn.household_id
    and i.provider = 'plaid' and i.provider_transaction_id = any(removed_ids)
    and i.financial_account_id in (select id from public.financial_accounts where bank_connection_id = conn.id);
  delete from public.bank_transactions t where t.household_id = conn.household_id
    and t.provider_transaction_id = any(removed_ids)
    and t.financial_account_id in (select id from public.financial_accounts where bank_connection_id = conn.id);

  for a in select value from jsonb_array_elements(account_rows) loop
    insert into public.financial_accounts(household_id, bank_connection_id, provider_account_id,
      name, institution, account_type, ownership, balance, provider_status, last_four, sync_status)
    values(conn.household_id, conn.id, a->>'providerAccountId', left(a->>'name',100),
      left(conn.institution_name,100), a->>'type', 'joint', (a->>'balance')::numeric,
      a->>'status', case when a->>'lastFour' ~ '^[0-9]{4}$' then a->>'lastFour' else null end, 'synced')
    on conflict (bank_connection_id, provider_account_id) do update set
      balance = excluded.balance, provider_status = excluded.provider_status, sync_status = 'synced';
  end loop;

  for t in select value from jsonb_array_elements(transaction_rows) loop
    select id into account_id from public.financial_accounts
      where bank_connection_id = conn.id and provider_account_id = t->>'providerAccountId';
    if account_id is null then raise exception 'Transaction account not found'; end if;
    transaction_date := (t->>'date')::date;
    transaction_amount := (t->>'amount')::numeric;
    insert into public.bank_transactions(household_id,financial_account_id,provider,provider_transaction_id,
      amount,description,category,counterparty_name,transaction_type,status,transaction_date,raw_provider_data)
    values(conn.household_id,account_id,'plaid',t->>'providerTransactionId',transaction_amount,
      left(t->>'description',500),t->>'category',t->>'counterpartyName',t->>'transactionType',
      t->>'status',transaction_date,t->'raw')
    on conflict (financial_account_id,provider_transaction_id) do update set
      amount=excluded.amount,description=excluded.description,category=excluded.category,
      status=excluded.status,transaction_date=excluded.transaction_date,raw_provider_data=excluded.raw_provider_data
    returning id, match_status = 'excluded' into transaction_id, is_excluded;
    if is_excluded then continue; end if;

    if t->>'status'='posted' and transaction_amount<0 and t->>'category' like 'INCOME%' then
      insert into public.income_entries(household_id,description,amount,income_date,owner_label,financial_account_id,provider,provider_transaction_id)
        values(conn.household_id,left(t->>'description',160),-transaction_amount,transaction_date,'Household',account_id,'plaid',t->>'providerTransactionId')
        on conflict(provider,provider_transaction_id) do update set amount=excluded.amount,income_date=excluded.income_date;
    else
      delete from public.income_entries where household_id=conn.household_id and financial_account_id=account_id
        and provider='plaid' and provider_transaction_id=t->>'providerTransactionId';
    end if;
  end loop;
  update public.bank_connections set sync_cursor=next_cursor,status='connected',disconnected_reason=null,last_synced_at=now() where id=conn.id;
end;
$$;

revoke all on function public.apply_bank_sync(uuid,text,text,jsonb,jsonb,text[]) from public,anon,authenticated;
grant execute on function public.apply_bank_sync(uuid,text,text,jsonb,jsonb,text[]) to service_role;
