import "server-only";

import { auth } from "@clerk/nextjs/server";

import { decryptBankToken, encryptBankToken } from "@/lib/banking/crypto";
import { plaidRequest } from "@/lib/banking/plaid/client";
import { getPlaidTransactionChanges, plaidProvider } from "@/lib/banking/plaid/provider";
import type { BankConnection, ProviderTransaction } from "@/lib/banking/types";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DataAccessError, throwDataError } from "./errors";
import { getCurrentHousehold } from "./households";

const environment = (process.env.PLAID_ENV === "production" ? "production" : "sandbox") as BankConnection["environment"];
export type BankConnectionSummary = { id: string; institutionName: string; status: "connected" | "disconnected" | "sync_error"; disconnectedReason: string | null; lastSyncedAt: string | null; providerEnrollmentId: string };

export async function getBankConnections(): Promise<BankConnectionSummary[]> {
  const household = await getCurrentHousehold();
  const result = await createServerSupabaseClient().from("bank_connections").select("id, institution_name, status, disconnected_reason, last_synced_at, provider_enrollment_id").eq("household_id", household.id).order("created_at");
  if (result.error) throwDataError(result.error, "Could not load bank connections.");
  return (result.data ?? []).map((row) => ({ id: row.id, institutionName: row.institution_name, status: row.status, disconnectedReason: row.disconnected_reason, lastSyncedAt: row.last_synced_at, providerEnrollmentId: row.provider_enrollment_id })) as BankConnectionSummary[];
}

export async function createPlaidLinkToken(connectionId?: string) {
  const { userId } = await auth.protect();
  if (!userId) throw new DataAccessError("Sign in before connecting a bank.");
  const household = await getCurrentHousehold();
  const connection = connectionId ? await getAuthorizedConnection(connectionId) : null;
  const response = await plaidRequest<{ link_token: string }>("/link/token/create", {
    client_name: "BearVault", language: "en", country_codes: ["US"], user: { client_user_id: `${household.id}:${userId}` },
    ...(connection ? { access_token: decryptBankToken(connection.encryptedAccessToken) } : { products: ["transactions"], transactions: { days_requested: 90 } }),
    ...(process.env.PLAID_WEBHOOK_URL ? { webhook: process.env.PLAID_WEBHOOK_URL } : {}),
  }, environment);
  return { linkToken: response.link_token };
}

export async function completePlaidConnection(publicToken: string, institution: { id: string; name: string }) {
  const { userId } = await auth.protect();
  if (!userId || !publicToken || !institution.id || !institution.name.trim()) throw new DataAccessError("Plaid did not return a valid bank connection.");
  const household = await getCurrentHousehold();
  const exchanged = await plaidRequest<{ access_token: string; item_id: string }>("/item/public_token/exchange", { public_token: publicToken }, environment);
  const admin = createAdminSupabaseClient();
  const existing = await admin.from("bank_connections").select("household_id").eq("provider", "plaid").eq("provider_enrollment_id", exchanged.item_id).maybeSingle();
  if (existing.error) throwDataError(existing.error, "Could not validate the existing bank connection.");
  if (existing.data && existing.data.household_id !== household.id) throw new DataAccessError("That Plaid Item already belongs to another household.");
  const saved = await admin.from("bank_connections").upsert({ household_id: household.id, provider: "plaid", provider_enrollment_id: exchanged.item_id, provider_user_id: userId,
    institution_name: institution.name.trim().slice(0, 160), encrypted_access_token: encryptBankToken(exchanged.access_token), environment, status: "connected", disconnected_reason: null, created_by: userId },
    { onConflict: "provider,provider_enrollment_id" }).select("id, household_id, institution_name, encrypted_access_token, environment").single();
  if (saved.error) throwDataError(saved.error, "Could not save the bank connection.");
  await syncBankConnection({ id: saved.data.id, householdId: saved.data.household_id, institutionName: saved.data.institution_name, provider: "plaid", encryptedAccessToken: saved.data.encrypted_access_token, environment: saved.data.environment } as BankConnection);
}

export async function getAuthorizedConnection(connectionId: string): Promise<BankConnection> {
  const household = await getCurrentHousehold();
  const result = await createAdminSupabaseClient().from("bank_connections").select("id, household_id, institution_name, encrypted_access_token, environment").eq("id", connectionId).eq("household_id", household.id).eq("provider", "plaid").single();
  if (result.error) throwDataError(result.error, "That bank connection could not be found.");
  return { id: result.data.id, householdId: result.data.household_id, institutionName: result.data.institution_name, provider: "plaid", encryptedAccessToken: result.data.encrypted_access_token, environment: result.data.environment } as BankConnection;
}

export async function refreshBankConnection(connectionId: string) { await syncBankConnection(await getAuthorizedConnection(connectionId)); }
export async function disconnectBankConnection(connectionId: string) {
  const connection = await getAuthorizedConnection(connectionId);
  await plaidProvider.disconnect(connection);
  const result = await createAdminSupabaseClient().from("bank_connections").delete().eq("id", connection.id).eq("household_id", connection.householdId);
  if (result.error) throwDataError(result.error, "Plaid was disconnected, but BearVault could not remove the local connection.");
}

function budgetCategoryCandidates(value: string | null) {
  const category = (value ?? "").toLowerCase();
  const mappings: Array<[string, string[]]> = [["groceries", ["Groceries", "Food"]], ["restaurant", ["Restaurants", "Food"]], ["coffee", ["Coffee", "Food"]], ["food", ["Food", "Groceries", "Restaurants"]], ["rent", ["Rent / Mortgage", "Housing"]], ["transportation", ["Transportation", "Gas"]], ["travel", ["Travel"]], ["medical", ["Medical", "Health"]], ["entertainment", ["Entertainment"]], ["personal_care", ["Personal Care"]], ["general_merchandise", ["Shopping"]], ["home_improvement", ["Home Maintenance"]]];
  return mappings.find(([key]) => category.includes(key))?.[1] ?? [];
}

async function postExpense(transaction: ProviderTransaction, householdId: string, accountId: string) {
  if (transaction.status !== "posted" || transaction.amount <= 0 || transaction.category?.includes("TRANSFER")) return;
  const admin = createAdminSupabaseClient();
  const existing = await admin.from("bank_transactions").select("matched_budget_entry_id").eq("financial_account_id", accountId).eq("provider_transaction_id", transaction.providerTransactionId).maybeSingle();
  if (existing.error) throw existing.error;
  const date = new Date(`${transaction.date}T00:00:00Z`);
  const month = await admin.from("budget_months").upsert({ household_id: householdId, year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 }, { onConflict: "household_id,year,month" }).select("id").single();
  if (month.error) throw month.error;
  const categories = await admin.from("budget_categories").select("id, name").eq("household_id", householdId).eq("budget_month_id", month.data.id);
  if (categories.error) throw categories.error;
  const candidates = budgetCategoryCandidates(transaction.category).map((name) => name.toLowerCase());
  let categoryId = categories.data.find((category) => candidates.includes(category.name.toLowerCase()))?.id;
  categoryId ??= categories.data.find((category) => category.name.toLowerCase() === "uncategorized")?.id;
  if (!categoryId) {
    const uncategorized = await admin.from("budget_categories").insert({ household_id: householdId, budget_month_id: month.data.id, name: "Uncategorized", planned_amount: 0, sort_order: 999 }).select("id").single();
    if (uncategorized.error) throw uncategorized.error;
    categoryId = uncategorized.data.id;
  }
  if (existing.data?.matched_budget_entry_id) {
    const updated = await admin.from("budget_entries").update({ budget_category_id: categoryId, description: transaction.description, amount: transaction.amount, entry_date: transaction.date, financial_account_id: accountId }).eq("id", existing.data.matched_budget_entry_id).eq("household_id", householdId);
    if (updated.error) throw updated.error;
    return;
  }
  const manualMatch = await admin.from("budget_entries").select("id").eq("household_id", householdId).eq("financial_account_id", accountId).eq("entry_date", transaction.date).eq("amount", transaction.amount).ilike("description", transaction.description).limit(1).maybeSingle();
  if (manualMatch.error) throw manualMatch.error;
  if (manualMatch.data) {
    const linked = await admin.from("bank_transactions").update({ match_status: "matched", matched_budget_entry_id: manualMatch.data.id }).eq("financial_account_id", accountId).eq("provider_transaction_id", transaction.providerTransactionId);
    if (linked.error) throw linked.error;
    return;
  }
  const entry = await admin.from("budget_entries").insert({ household_id: householdId, budget_category_id: categoryId, description: transaction.description, amount: transaction.amount, entry_date: transaction.date, financial_account_id: accountId }).select("id").single();
  if (entry.error) throw entry.error;
  const linked = await admin.from("bank_transactions").update({ match_status: "matched", matched_budget_entry_id: entry.data.id }).eq("financial_account_id", accountId).eq("provider_transaction_id", transaction.providerTransactionId);
  if (linked.error) throw linked.error;
}

async function postIncome(transaction: ProviderTransaction, householdId: string, accountId: string) {
  if (transaction.status !== "posted" || transaction.amount >= 0 || !transaction.category?.startsWith("INCOME")) return;
  const admin = createAdminSupabaseClient();
  const result = await admin.from("income_entries").upsert({ household_id: householdId, description: transaction.description.slice(0, 160), amount: Math.abs(transaction.amount), income_date: transaction.date, owner_label: "Household", financial_account_id: accountId, provider: "plaid", provider_transaction_id: transaction.providerTransactionId }, { onConflict: "provider,provider_transaction_id" });
  if (result.error) throw result.error;
  await admin.from("bank_transactions").update({ match_status: "matched" }).eq("financial_account_id", accountId).eq("provider_transaction_id", transaction.providerTransactionId);
}

export async function syncBankConnection(connection: BankConnection) {
  const admin = createAdminSupabaseClient();
  try {
    const start = new Date(); start.setUTCDate(start.getUTCDate() - 90);
    const changes = await getPlaidTransactionChanges(connection);
    const transactions = changes.rows.filter((transaction) => transaction.date >= start.toISOString().slice(0, 10));
    if (changes.removed.length) {
      const removed = await admin.from("bank_transactions").select("id, matched_budget_entry_id").eq("household_id", connection.householdId).eq("provider", "plaid").in("provider_transaction_id", changes.removed);
      if (removed.error) throw removed.error;
      const budgetEntryIds = removed.data.map((row) => row.matched_budget_entry_id).filter((id): id is string => Boolean(id));
      if (budgetEntryIds.length) {
        const deletedEntries = await admin.from("budget_entries").delete().eq("household_id", connection.householdId).in("id", budgetEntryIds);
        if (deletedEntries.error) throw deletedEntries.error;
      }
      const deletedIncome = await admin.from("income_entries").delete().eq("household_id", connection.householdId).eq("provider", "plaid").in("provider_transaction_id", changes.removed);
      if (deletedIncome.error) throw deletedIncome.error;
      const deletedTransactions = await admin.from("bank_transactions").delete().eq("household_id", connection.householdId).eq("provider", "plaid").in("provider_transaction_id", changes.removed);
      if (deletedTransactions.error) throw deletedTransactions.error;
    }
    for (const account of await plaidProvider.getAccounts(connection)) {
      const balance = await plaidProvider.getBalances(connection, account.providerAccountId);
      const saved = await admin.from("financial_accounts").upsert({ household_id: connection.householdId, bank_connection_id: connection.id, provider_account_id: account.providerAccountId, name: account.name, institution: account.institution, account_type: account.type, ownership: "joint", balance: Math.abs(balance.ledger), credit_limit: null, provider_status: account.status, last_four: account.lastFour, sync_status: "synced" }, { onConflict: "bank_connection_id,provider_account_id" }).select("id").single();
      if (saved.error) throw saved.error;
      const accountTransactions = transactions.filter((transaction) => transaction.providerAccountId === account.providerAccountId);
      if (accountTransactions.length) {
        const imported = await admin.from("bank_transactions").upsert(accountTransactions.map((transaction) => ({ household_id: connection.householdId, financial_account_id: saved.data.id, provider: "plaid", provider_transaction_id: transaction.providerTransactionId, amount: transaction.amount, description: transaction.description, category: transaction.category, counterparty_name: transaction.counterpartyName, transaction_type: transaction.transactionType, status: transaction.status, transaction_date: transaction.date, running_balance: transaction.runningBalance, raw_provider_data: transaction.raw })), { onConflict: "financial_account_id,provider_transaction_id" });
        if (imported.error) throw imported.error;
        for (const transaction of accountTransactions) {
          await postExpense(transaction, connection.householdId, saved.data.id);
          await postIncome(transaction, connection.householdId, saved.data.id);
        }
      }
    }
    const updated = await admin.from("bank_connections").update({ status: "connected", disconnected_reason: null, last_synced_at: new Date().toISOString() }).eq("id", connection.id).eq("household_id", connection.householdId);
    if (updated.error) throw updated.error;
  } catch (error) {
    await admin.from("bank_connections").update({ status: "sync_error" }).eq("id", connection.id).eq("household_id", connection.householdId);
    throw error;
  }
}
