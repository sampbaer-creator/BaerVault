-- Apply before deploying the matching application release. All import writes and
-- the cursor advance commit together. Retries cannot create a second expense.
alter table public.bank_connections add column sync_cursor text;
alter table public.financial_accounts drop constraint financial_accounts_balance_check;
alter table public.income_entries drop constraint income_entries_financial_account_household_fk;
alter table public.income_entries add constraint income_entries_financial_account_household_fk
  foreign key (financial_account_id, household_id) references public.financial_accounts(id, household_id)
  on delete set null (financial_account_id);
alter table public.budget_entries add column bank_transaction_id uuid unique
  references public.bank_transactions(id) on delete cascade;

-- Backfill only proven links; do not guess that same-day purchases are duplicates.
update public.budget_entries e set bank_transaction_id = t.id
from (select distinct on (matched_budget_entry_id) id, matched_budget_entry_id
      from public.bank_transactions where matched_budget_entry_id is not null
      order by matched_budget_entry_id, created_at, id) t
where e.id = t.matched_budget_entry_id;

create or replace function public.apply_bank_sync(
  connection_id uuid, expected_cursor text, next_cursor text,
  account_rows jsonb, transaction_rows jsonb, removed_ids text[]
) returns void language plpgsql security invoker set search_path = '' as $$
declare
  conn public.bank_connections%rowtype;
  a jsonb; t jsonb; account_id uuid; transaction_id uuid;
  entry_id uuid; category_id uuid; month_id uuid; existing_category uuid;
  transaction_date date; transaction_amount numeric; category_name text;
  is_excluded boolean;
begin
  select * into strict conn from public.bank_connections where id = connection_id for update;
  if conn.sync_cursor is distinct from expected_cursor then
    raise exception 'Sync cursor changed; retry the update' using errcode = '40001';
  end if;
  -- Serialize category creation across different bank connections in a household.
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

    if t->>'status' = 'posted' and transaction_amount > 0
      and coalesce(t->>'category','') not like '%TRANSFER%'
      and coalesce(t->>'category','') not like 'LOAN_PAYMENTS%' then
      insert into public.budget_months(household_id,year,month)
        values(conn.household_id,extract(year from transaction_date),extract(month from transaction_date))
        on conflict(household_id,year,month) do update set year=excluded.year returning id into month_id;
      select e.budget_category_id into existing_category from public.budget_entries e
        join public.budget_categories c on c.id=e.budget_category_id
        where e.bank_transaction_id=transaction_id and c.budget_month_id=month_id;
      category_name := case
        when t->>'category' like '%GROCERIES%' then 'Groceries'
        when t->>'category' like '%RESTAURANT%' then 'Restaurants'
        when t->>'category' like '%RENT%' then 'Rent / Mortgage'
        when t->>'category' like '%TRANSPORTATION%' then 'Transportation'
        else 'Uncategorized' end;
      select id into category_id from public.budget_categories where household_id=conn.household_id
        and budget_month_id=month_id and lower(name)=lower(category_name) order by created_at,id limit 1;
      category_id := coalesce(existing_category,category_id);
      if category_id is null then
        insert into public.budget_categories(household_id,budget_month_id,name,planned_amount,sort_order)
          values(conn.household_id,month_id,category_name,0,999) returning id into category_id;
      end if;
      insert into public.budget_entries(household_id,budget_category_id,description,amount,entry_date,financial_account_id,bank_transaction_id)
        values(conn.household_id,category_id,left(t->>'description',160),transaction_amount,transaction_date,account_id,transaction_id)
        on conflict(bank_transaction_id) do update set amount=excluded.amount,entry_date=excluded.entry_date,
          budget_category_id=excluded.budget_category_id
        returning id into entry_id;
      update public.bank_transactions set matched_budget_entry_id=entry_id,match_status='matched' where id=transaction_id;
    else
      delete from public.budget_entries where bank_transaction_id=transaction_id;
    end if;
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

-- A deleted import stays excluded on subsequent refreshes.
create function public.exclude_deleted_bank_expense() returns trigger language plpgsql
security definer set search_path = '' as $$
begin
  if auth.role() = 'authenticated' then
    update public.bank_transactions set match_status='excluded' where id=old.bank_transaction_id;
  end if;
  return old;
end;
$$;
create trigger exclude_deleted_bank_expense before delete on public.budget_entries
for each row execute function public.exclude_deleted_bank_expense();
