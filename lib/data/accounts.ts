import "server-only";

import type { FinancialAccount, FinancialAccountDraft } from "@/lib/accounts";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { throwDataError } from "./errors";
import { getCurrentHousehold } from "./households";

type AccountRow = {
  id: string;
  name: string;
  institution: string;
  account_type: FinancialAccount["type"];
  ownership: string;
  balance: number | string;
  credit_limit: number | string | null;
  updated_at: string;
};

const selection = "id, name, institution, account_type, ownership, balance, credit_limit, updated_at";

function mapAccount(row: AccountRow): FinancialAccount {
  return {
    id: row.id,
    name: row.name,
    institution: row.institution,
    type: row.account_type,
    owner: row.ownership,
    balance: Number(row.balance),
    creditLimit: row.credit_limit === null ? null : Number(row.credit_limit),
    updatedAt: row.updated_at,
  };
}

function toRow(input: FinancialAccountDraft) {
  return {
    name: input.name,
    institution: input.institution,
    account_type: input.type,
    ownership: input.owner,
    balance: input.balance,
    credit_limit: input.type === "credit_card" ? input.creditLimit : null,
  };
}

export async function getFinancialAccounts(): Promise<FinancialAccount[]> {
  const household = await getCurrentHousehold();
  const result = await createServerSupabaseClient()
    .from("financial_accounts")
    .select(selection)
    .eq("household_id", household.id)
    .order("account_type")
    .order("created_at");
  if (result.error) throwDataError(result.error, "Could not load your accounts.");
  return ((result.data ?? []) as AccountRow[]).map(mapAccount);
}

export async function createFinancialAccount(input: FinancialAccountDraft) {
  const household = await getCurrentHousehold();
  const result = await createServerSupabaseClient()
    .from("financial_accounts")
    .insert({ household_id: household.id, ...toRow(input) })
    .select(selection)
    .single();
  if (result.error) throwDataError(result.error, "Could not add the account.");
  return mapAccount(result.data as AccountRow);
}

export async function updateFinancialAccount(input: FinancialAccount) {
  const household = await getCurrentHousehold();
  const result = await createServerSupabaseClient()
    .from("financial_accounts")
    .update(toRow(input))
    .eq("id", input.id)
    .eq("household_id", household.id)
    .select(selection)
    .single();
  if (result.error) throwDataError(result.error, "Could not update the account.");
  return mapAccount(result.data as AccountRow);
}

export async function deleteFinancialAccount(id: string) {
  const household = await getCurrentHousehold();
  const result = await createServerSupabaseClient()
    .from("financial_accounts")
    .delete()
    .eq("id", id)
    .eq("household_id", household.id);
  if (result.error) throwDataError(result.error, "Could not delete the account.");
}
