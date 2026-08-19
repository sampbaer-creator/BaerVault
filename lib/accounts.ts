export const financialAccountTypes = [
  "checking",
  "savings",
  "cash",
  "credit_card",
  "loan",
  "other",
] as const;

export type FinancialAccountType = (typeof financialAccountTypes)[number];

export type FinancialAccount = {
  id: string;
  name: string;
  institution: string;
  type: FinancialAccountType;
  owner: string;
  balance: number;
  creditLimit: number | null;
  updatedAt: string;
};

export type FinancialAccountDraft = Omit<FinancialAccount, "id" | "updatedAt">;

export type AccountTransferDraft = {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  note: string;
};

export type AccountTransferResult = AccountTransferDraft & {
  id: string;
  fromBalance: number;
  toBalance: number;
  fromUpdatedAt: string;
  toUpdatedAt: string;
};

export const financialAccountTypeLabels: Record<FinancialAccountType, string> = {
  checking: "Checking",
  savings: "Savings",
  cash: "Cash",
  credit_card: "Credit cards",
  loan: "Loans",
  other: "Other",
};

export const demoFinancialAccounts: FinancialAccount[] = [
  {
    id: "demo-savings",
    name: "Household savings",
    institution: "Summit Credit Union",
    type: "savings",
    owner: "joint",
    balance: 12840.25,
    creditLimit: null,
    updatedAt: "2026-08-14T16:18:00.000Z",
  },
  {
    id: "demo-checking",
    name: "Everyday checking",
    institution: "Summit Credit Union",
    type: "checking",
    owner: "joint",
    balance: 4209.44,
    creditLimit: null,
    updatedAt: "2026-08-14T16:18:00.000Z",
  },
  {
    id: "demo-cash",
    name: "Wallet cash",
    institution: "Manual account",
    type: "cash",
    owner: "user",
    balance: 180,
    creditLimit: null,
    updatedAt: "2026-08-10T14:00:00.000Z",
  },
  {
    id: "demo-card",
    name: "Household rewards card",
    institution: "Northstar Bank",
    type: "credit_card",
    owner: "joint",
    balance: 552.3,
    creditLimit: 8500,
    updatedAt: "2026-08-14T16:05:00.000Z",
  },
];

export function isDebtAccount(type: FinancialAccountType) {
  return type === "credit_card" || type === "loan";
}
