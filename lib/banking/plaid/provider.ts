import "server-only";

import type { BankDataProvider, ProviderAccount, ProviderTransaction } from "@/lib/banking/types";
import { plaidConnectionRequest, PlaidRequestError } from "./client";

type PlaidAccount = { account_id: string; name: string; mask: string | null; type: string; subtype: string | null; balances: { available: number | null; current: number | null } };
type PlaidTransaction = { transaction_id: string; account_id: string; amount: number; name: string; merchant_name: string | null; pending: boolean; date: string; payment_channel?: string; personal_finance_category?: { primary: string; detailed: string }; [key: string]: unknown };

export async function getPlaidTransactionChanges(connection: Parameters<BankDataProvider["getAccounts"]>[0], initialCursor: string | null = null, attempt = 0): Promise<{ rows: ProviderTransaction[]; removed: string[]; cursor: string }> {
  let cursor = initialCursor ?? "";
  const rows: PlaidTransaction[] = [];
  const removed: string[] = [];
  try { do {
    const response = await plaidConnectionRequest<{ added: PlaidTransaction[]; modified: PlaidTransaction[]; removed: Array<{ transaction_id: string }>; next_cursor: string; has_more: boolean }>(connection, "/transactions/sync", { ...(cursor ? { cursor } : {}), count: 500 });
    rows.push(...response.added, ...response.modified);
    removed.push(...response.removed.map((row) => row.transaction_id));
    cursor = response.next_cursor;
    if (!response.has_more) break;
  } while (cursor); } catch (error) {
    if (error instanceof PlaidRequestError && error.code === "TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION" && attempt < 2) return getPlaidTransactionChanges(connection, initialCursor, attempt + 1);
    throw error;
  }
  const deleted = new Set(removed);
  const uniqueRows = [...new Map(rows.map((row) => [row.transaction_id, row])).values()].filter((row) => !deleted.has(row.transaction_id));
  return { cursor, rows: uniqueRows.map((row): ProviderTransaction => ({
    providerTransactionId: row.transaction_id, providerAccountId: row.account_id, amount: row.amount,
    description: row.merchant_name ?? row.name, category: row.personal_finance_category?.detailed ?? row.personal_finance_category?.primary ?? null,
    counterpartyName: row.merchant_name, transactionType: row.payment_channel ?? null,
    status: row.pending ? "pending" : "posted", date: row.date, runningBalance: null, raw: row,
  })), removed };
}

function accountType(account: PlaidAccount): ProviderAccount["type"] {
  if (account.subtype === "checking") return "checking";
  if (account.subtype === "savings" || account.subtype === "money market") return "savings";
  if (account.type === "credit") return "credit_card";
  if (account.type === "loan") return "loan";
  return "other";
}

async function accounts(connection: Parameters<BankDataProvider["getAccounts"]>[0]) {
  return plaidConnectionRequest<{ accounts: PlaidAccount[]; item: { item_id: string } }>(connection, "/accounts/get");
}

export async function getPlaidAccountsWithBalances(connection: Parameters<BankDataProvider["getAccounts"]>[0]) {
  const response = await accounts(connection);
  return response.accounts.filter((account) => account.type !== "investment").map((account) => {
    if (account.balances.current === null) throw new Error("A bank balance is unavailable. Please try again later.");
    return { providerAccountId: account.account_id, name: account.name, type: accountType(account),
      lastFour: account.mask, status: "open", balance: account.balances.current };
  });
}

export const plaidProvider: BankDataProvider = {
  async getAccounts(connection) {
    const response = await accounts(connection);
    return response.accounts.map((account) => ({ providerAccountId: account.account_id, enrollmentId: response.item.item_id,
      name: account.name, institution: connection.institutionName, type: accountType(account), lastFour: account.mask, status: "open" }));
  },
  async getBalances(connection, accountId) {
    const response = await accounts(connection);
    const account = response.accounts.find((candidate) => candidate.account_id === accountId);
    if (!account) throw new Error("Plaid account was not found.");
    return { providerAccountId: accountId, available: account.balances.available, ledger: account.balances.current ?? 0 };
  },
  async getTransactions(connection, accountId, startDate) {
    const { rows } = await getPlaidTransactionChanges(connection);
    return rows.filter((row) => (!accountId || row.providerAccountId === accountId) && (!startDate || row.date >= startDate));
  },
  async disconnect(connection) { await plaidConnectionRequest(connection, "/item/remove"); },
};
