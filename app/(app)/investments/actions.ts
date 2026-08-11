"use server";

import { revalidatePath } from "next/cache";
import { createHoldingWithLot, createInvestmentAccount, createPurchaseLot } from "@/lib/data/investments";
import { errorMessage } from "@/lib/data/errors";

export async function addInvestmentAccountAction(input: { name: string; accountType: string; ownership: string }) {
  try {
    const name = input.name.trim(); const accountType = input.accountType.trim();
    if (!name || name.length > 100 || !accountType || accountType.length > 60 || !["user", "spouse", "joint", "other"].includes(input.ownership)) throw new Error("Enter valid account details.");
    const data = await createInvestmentAccount(name, accountType, input.ownership);
    revalidatePath("/investments"); return { ok: true as const, data };
  } catch (error) { return { ok: false as const, error: errorMessage(error) }; }
}

export async function addHoldingAction(input: { accountId: string; symbol: string; name: string; shares: number; price: number; date: string }) {
  try {
    const symbol = input.symbol.trim().toUpperCase(); const name = input.name.trim() || symbol;
    if (!input.accountId || !/^[A-Z0-9./-]{1,15}$/.test(symbol) || name.length > 120 || !Number.isFinite(input.shares) || input.shares <= 0 || !Number.isFinite(input.price) || input.price < 0 || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error("Enter a valid holding and purchase lot.");
    const data = await createHoldingWithLot(input.accountId, symbol, name, input.shares, input.price, input.date);
    revalidatePath("/investments"); revalidatePath("/dashboard"); return { ok: true as const, data };
  } catch (error) { return { ok: false as const, error: errorMessage(error) }; }
}

export async function addPurchaseLotAction(input: { holdingId: string; shares: number; price: number; date: string }) {
  try {
    if (!input.holdingId || !Number.isFinite(input.shares) || input.shares <= 0 || !Number.isFinite(input.price) || input.price < 0 || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error("Enter valid lot details.");
    const data = await createPurchaseLot(input.holdingId, input.shares, input.price, input.date);
    revalidatePath("/investments"); revalidatePath("/dashboard"); return { ok: true as const, data };
  } catch (error) { return { ok: false as const, error: errorMessage(error) }; }
}
