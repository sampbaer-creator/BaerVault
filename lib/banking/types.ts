export type BankConnection = {
  id: string;
  householdId: string;
  provider: "teller";
  encryptedAccessToken: string;
  environment: "development" | "production";
};

export type ProviderAccount = {
  providerAccountId: string;
  enrollmentId: string;
  name: string;
  institution: string;
  type: "checking" | "savings" | "credit_card" | "loan" | "other";
  lastFour: string | null;
  status: "open" | "closed";
};

export type ProviderBalance = { providerAccountId: string; available: number | null; ledger: number };

export type ProviderTransaction = {
  providerTransactionId: string;
  providerAccountId: string;
  amount: number;
  description: string;
  category: string | null;
  counterpartyName: string | null;
  transactionType: string | null;
  status: "pending" | "posted";
  date: string;
  runningBalance: number | null;
  raw: Record<string, unknown>;
};

export interface BankDataProvider {
  getAccounts(connection: BankConnection): Promise<ProviderAccount[]>;
  getBalances(connection: BankConnection, accountId: string): Promise<ProviderBalance>;
  getTransactions(connection: BankConnection, accountId: string, startDate?: string): Promise<ProviderTransaction[]>;
  disconnect(connection: BankConnection): Promise<void>;
}
