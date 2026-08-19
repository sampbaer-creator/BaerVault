"use server";

import { revalidatePath } from "next/cache";

import {
  type AccountTransferDraft,
  financialAccountTypes,
  type FinancialAccount,
  type FinancialAccountDraft,
} from "@/lib/accounts";
import {
  createFinancialAccount,
  deleteFinancialAccount,
  transferBetweenFinancialAccounts,
  updateFinancialAccount,
} from "@/lib/data/accounts";
import { DataAccessError, errorMessage } from "@/lib/data/errors";

const owners = ["user", "spouse", "joint", "other"];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validate(input: FinancialAccountDraft): FinancialAccountDraft {
  const name = input.name.trim();
  const institution = input.institution.trim();
  if (
    !name ||
    name.length > 100 ||
    institution.length > 100 ||
    !financialAccountTypes.includes(input.type) ||
    !owners.includes(input.owner) ||
    !Number.isFinite(input.balance) ||
    input.balance < 0 ||
    (input.type === "credit_card" &&
      input.creditLimit !== null &&
      (!Number.isFinite(input.creditLimit) || input.creditLimit <= 0))
  ) {
    throw new DataAccessError("Enter valid account details and a balance of zero or more.");
  }
  return {
    ...input,
    name,
    institution,
    creditLimit: input.type === "credit_card" ? input.creditLimit : null,
  };
}

function refreshAccounts() {
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
}

function validateTransfer(input: AccountTransferDraft): AccountTransferDraft {
  const note = input.note.trim();
  const cents = input.amount * 100;
  if (
    !uuidPattern.test(input.fromAccountId) ||
    !uuidPattern.test(input.toAccountId) ||
    input.fromAccountId === input.toAccountId ||
    !Number.isFinite(input.amount) ||
    input.amount <= 0 ||
    input.amount > 999999999999.99 ||
    Math.abs(Math.round(cents) - cents) > 0.000001 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(input.date) ||
    note.length > 160
  ) {
    throw new DataAccessError("Choose two different accounts and enter a valid amount and date.");
  }
  return { ...input, note };
}

export async function addFinancialAccountAction(input: FinancialAccountDraft) {
  try {
    const data = await createFinancialAccount(validate(input));
    refreshAccounts();
    return { ok: true as const, data };
  } catch (error) {
    return { ok: false as const, error: errorMessage(error) };
  }
}

export async function updateFinancialAccountAction(input: FinancialAccount) {
  try {
    if (!input.id) throw new DataAccessError("That account no longer exists.");
    const data = await updateFinancialAccount({ ...input, ...validate(input) });
    refreshAccounts();
    return { ok: true as const, data };
  } catch (error) {
    return { ok: false as const, error: errorMessage(error) };
  }
}

export async function deleteFinancialAccountAction(id: string) {
  try {
    if (!id) throw new DataAccessError("That account no longer exists.");
    await deleteFinancialAccount(id);
    refreshAccounts();
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: errorMessage(error) };
  }
}

export async function transferFundsAction(input: AccountTransferDraft) {
  try {
    const data = await transferBetweenFinancialAccounts(validateTransfer(input));
    refreshAccounts();
    return { ok: true as const, data };
  } catch (error) {
    return { ok: false as const, error: errorMessage(error) };
  }
}
