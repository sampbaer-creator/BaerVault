"use server";

import { revalidatePath } from "next/cache";

import {
  financialAccountTypes,
  type FinancialAccount,
  type FinancialAccountDraft,
} from "@/lib/accounts";
import {
  createFinancialAccount,
  deleteFinancialAccount,
  updateFinancialAccount,
} from "@/lib/data/accounts";
import { DataAccessError, errorMessage } from "@/lib/data/errors";

const owners = ["user", "spouse", "joint", "other"];

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
