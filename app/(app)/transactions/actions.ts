"use server";

import { revalidatePath } from "next/cache";

import { DataAccessError, errorMessage } from "@/lib/data/errors";
import {
  createIncomeEntry,
  deleteIncomeEntry,
  updateIncomeEntry,
} from "@/lib/data/income";

type IncomeInput = {
  id?: string;
  description: string;
  amount: number;
  date: string;
  ownerLabel?: string;
};

function validateIncome(input: IncomeInput) {
  const description = input.description.trim();
  const ownerLabel = input.ownerLabel?.trim();

  if (
    !description ||
    description.length > 160 ||
    !Number.isFinite(input.amount) ||
    input.amount <= 0 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(input.date) ||
    (ownerLabel?.length ?? 0) > 80
  ) {
    throw new DataAccessError("Enter a valid income source, amount, and date.");
  }

  return { description, ownerLabel };
}

export async function saveIncomeAction(input: IncomeInput) {
  try {
    const { description, ownerLabel } = validateIncome(input);
    const data = input.id
      ? await updateIncomeEntry(
          input.id,
          description,
          input.amount,
          input.date,
          ownerLabel,
        )
      : await createIncomeEntry(
          description,
          input.amount,
          input.date,
          ownerLabel,
        );

    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/budget");
    return { ok: true as const, data };
  } catch (error) {
    return { ok: false as const, error: errorMessage(error) };
  }
}

export async function deleteIncomeAction(id: string) {
  try {
    await deleteIncomeEntry(id);
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/budget");
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: errorMessage(error) };
  }
}
