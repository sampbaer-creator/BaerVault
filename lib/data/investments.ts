import "server-only";

import type { Holding, InvestmentAccount, InvestmentLot } from "@/lib/investmentData";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { DataAccessError, throwDataError } from "./errors";
import { getCurrentHousehold } from "./households";

type LotRow = { id: string; shares: number | string; price_per_share: number | string; purchase_date: string };
type HoldingRow = { id: string; symbol: string; investment_name: string; purchase_lots?: LotRow[] };
type AccountRow = { id: string; name: string; account_type: string; ownership: string; contribution_amount: number | string; holdings?: HoldingRow[] };

export async function getInvestmentAccounts(): Promise<InvestmentAccount[]> {
  const household = await getCurrentHousehold();
  const result = await createServerSupabaseClient().from("investment_accounts").select("id, name, account_type, ownership, contribution_amount, holdings(id, symbol, investment_name, purchase_lots(id, shares, price_per_share, purchase_date))").eq("household_id", household.id).order("created_at");
  if (result.error) throwDataError(result.error, "Could not load investment accounts.");
  return ((result.data ?? []) as AccountRow[]).map((account) => ({
    id: account.id,
    name: account.name,
    institution: "",
    type: account.account_type,
    owner: account.ownership,
    contributionAmount: Number(account.contribution_amount),
    holdings: (account.holdings ?? []).map((holding) => ({
      id: holding.id,
      symbol: holding.symbol,
      name: holding.investment_name,
      fallbackPrice: 0,
      lots: (holding.purchase_lots ?? []).map((lot) => ({ id: lot.id, shares: Number(lot.shares), price: Number(lot.price_per_share), date: lot.purchase_date })),
    })),
  }));
}

export async function createInvestmentAccount(name: string, accountType: string, ownership: string): Promise<InvestmentAccount> {
  const household = await getCurrentHousehold();
  const result = await createServerSupabaseClient().from("investment_accounts").insert({ household_id: household.id, name, account_type: accountType, ownership }).select("id, name, account_type, ownership").single();
  if (result.error) throwDataError(result.error, "Could not add the investment account.");
  return { id: result.data.id, name: result.data.name, institution: "", type: result.data.account_type, owner: result.data.ownership, holdings: [] };
}

export async function createHoldingWithLot(accountId: string, symbol: string, name: string, shares: number, price: number, date: string): Promise<Holding> {
  const household = await getCurrentHousehold();
  const supabase = createServerSupabaseClient();
  const account = await supabase.from("investment_accounts").select("id").eq("id", accountId).eq("household_id", household.id).maybeSingle();
  if (account.error) throwDataError(account.error, "Could not verify the investment account.");
  if (!account.data) throw new DataAccessError("That investment account no longer exists.");
  const holding = await supabase.from("holdings").insert({ household_id: household.id, investment_account_id: accountId, symbol, investment_name: name }).select("id, symbol, investment_name").single();
  if (holding.error) throwDataError(holding.error, "Could not add the holding.");
  const lot = await supabase.from("purchase_lots").insert({ household_id: household.id, holding_id: holding.data.id, shares, price_per_share: price, purchase_date: date }).select("id, shares, price_per_share, purchase_date").single();
  if (lot.error) {
    await supabase.from("holdings").delete().eq("id", holding.data.id).eq("household_id", household.id);
    throwDataError(lot.error, "Could not save the purchase lot.");
  }
  return { id: holding.data.id, symbol: holding.data.symbol, name: holding.data.investment_name, fallbackPrice: 0, lots: [{ id: lot.data.id, shares: Number(lot.data.shares), price: Number(lot.data.price_per_share), date: lot.data.purchase_date }] };
}

export async function createPurchaseLot(holdingId: string, shares: number, price: number, date: string): Promise<InvestmentLot> {
  const household = await getCurrentHousehold();
  const result = await createServerSupabaseClient().from("purchase_lots").insert({ household_id: household.id, holding_id: holdingId, shares, price_per_share: price, purchase_date: date }).select("id, shares, price_per_share, purchase_date").single();
  if (result.error) throwDataError(result.error, "Could not add the purchase lot.");
  return { id: result.data.id, shares: Number(result.data.shares), price: Number(result.data.price_per_share), date: result.data.purchase_date };
}
