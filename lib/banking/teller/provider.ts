import "server-only";

import type { BankDataProvider, ProviderAccount } from "@/lib/banking/types";

import { tellerRequest } from "./client";

type TellerAccount = {
  id: string; enrollment_id: string; name: string; type: string; subtype: string;
  institution: { name: string }; last_four: string | null; status: "open" | "closed";
};
type TellerBalance = { account_id: string; available: string | null; ledger: string };
type TellerTransaction = {
  id: string; account_id: string; amount: string; date: string; description: string;
  status: "pending" | "posted"; type?: string; running_balance: string | null;
  details?: { category?: string; counterparty?: { name?: string } };
  [key: string]: unknown;
};

function accountType(account: TellerAccount): ProviderAccount["type"] {
  if (account.subtype === "checking") return "checking";
  if (account.subtype === "savings") return "savings";
  if (account.subtype === "credit_card") return "credit_card";
  if (account.type === "credit") return "loan";
  return "other";
}

export const tellerProvider: BankDataProvider = {
  async getAccounts(connection) {
    const rows = await tellerRequest<TellerAccount[]>(connection, "/accounts");
    return rows.map((row) => ({ providerAccountId: row.id, enrollmentId: row.enrollment_id, name: row.name,
      institution: row.institution.name, type: accountType(row), lastFour: row.last_four, status: row.status }));
  },
  async getBalances(connection, accountId) {
    const row = await tellerRequest<TellerBalance>(connection, `/accounts/${encodeURIComponent(accountId)}/balances`);
    return { providerAccountId: row.account_id, available: row.available === null ? null : Number(row.available), ledger: Number(row.ledger) };
  },
  async getTransactions(connection, accountId, startDate) {
    const query = startDate ? `?start_date=${encodeURIComponent(startDate)}` : "";
    const rows = await tellerRequest<TellerTransaction[]>(connection, `/accounts/${encodeURIComponent(accountId)}/transactions${query}`);
    return rows.map((row) => ({ providerTransactionId: row.id, providerAccountId: row.account_id,
      amount: Number(row.amount), description: row.description, category: row.details?.category ?? null,
      counterpartyName: row.details?.counterparty?.name ?? null, transactionType: row.type ?? null,
      status: row.status, date: row.date, runningBalance: row.running_balance === null ? null : Number(row.running_balance), raw: row }));
  },
  async disconnect(connection) { await tellerRequest<void>(connection, "/accounts", "DELETE"); },
};
