import "server-only";

import type {
  AccountTransferDraft,
  AccountTransferResult,
  FinancialAccount,
  FinancialAccountDraft,
} from "@/lib/accounts";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { DataAccessError, throwDataError } from "./errors";
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
  bank_connection_id: string | null;
  provider_status: "open" | "closed" | null;
};

const selection = "id, name, institution, account_type, ownership, balance, credit_limit, updated_at, bank_connection_id, provider_status";

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
    bankConnectionId: row.bank_connection_id,
    providerStatus: row.provider_status,
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
  const existing = await createServerSupabaseClient().from("financial_accounts").select("bank_connection_id")
    .eq("id", input.id).eq("household_id", household.id).single();
  if (existing.error) throwDataError(existing.error, "Could not load the account.");
  if (existing.data.bank_connection_id) throw new DataAccessError("Connected accounts are updated from the bank and cannot be edited manually.");
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
  const existing = await createServerSupabaseClient().from("financial_accounts").select("bank_connection_id")
    .eq("id", id).eq("household_id", household.id).single();
  if (existing.error) throwDataError(existing.error, "Could not load the account.");
  if (existing.data.bank_connection_id) throw new DataAccessError("Disconnect the bank instead of deleting a connected account.");
  const result = await createServerSupabaseClient()
    .from("financial_accounts")
    .delete()
    .eq("id", id)
    .eq("household_id", household.id);
  if (result.error) throwDataError(result.error, "Could not delete the account.");
}

type TransferRpcResult = {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number | string;
  date: string;
  fromBalance: number | string;
  toBalance: number | string;
  fromUpdatedAt: string;
  toUpdatedAt: string;
};

export async function transferBetweenFinancialAccounts(
  input: AccountTransferDraft,
): Promise<AccountTransferResult> {
  const result = await createServerSupabaseClient().rpc(
    "transfer_between_financial_accounts",
    {
      p_from_account_id: input.fromAccountId,
      p_to_account_id: input.toAccountId,
      p_amount: input.amount,
      p_transfer_date: input.date,
      p_note: input.note,
    },
  );

  if (result.error) {
    if (result.error.message.includes("insufficient funds")) {
      throw new DataAccessError("The source account does not have enough money for that transfer.");
    }
    if (result.error.message.includes("Debt payments")) {
      throw new DataAccessError("Choose two cash accounts. Card and loan payments are not transfers yet.");
    }
    throwDataError(result.error, "Could not complete the transfer. Your account balances were not changed.");
  }

  const data = result.data as TransferRpcResult;
  return {
    id: data.id,
    fromAccountId: data.fromAccountId,
    toAccountId: data.toAccountId,
    amount: Number(data.amount),
    date: data.date,
    note: input.note,
    fromBalance: Number(data.fromBalance),
    toBalance: Number(data.toBalance),
    fromUpdatedAt: data.fromUpdatedAt,
    toUpdatedAt: data.toUpdatedAt,
  };
}
