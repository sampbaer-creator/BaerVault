import "server-only";

import type { IncomeEntry } from "@/lib/finance";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { throwDataError } from "./errors";
import { getCurrentHousehold } from "./households";

export async function createIncomeEntry(description: string, amount: number, incomeDate: string, ownerLabel?: string): Promise<IncomeEntry> {
  const household = await getCurrentHousehold();
  const result = await createServerSupabaseClient().from("income_entries").insert({ household_id: household.id, description, amount, income_date: incomeDate, owner_label: ownerLabel || null }).select("id, description, amount, income_date, owner_label").single();
  if (result.error) throwDataError(result.error, "Could not add the income entry.");
  return { id: result.data.id, source: result.data.description, amount: Number(result.data.amount), date: result.data.income_date, owner: result.data.owner_label ?? "Household" };
}

export async function updateIncomeEntry(id: string, description: string, amount: number, incomeDate: string, ownerLabel?: string): Promise<IncomeEntry> {
  const household = await getCurrentHousehold();
  const result = await createServerSupabaseClient().from("income_entries").update({description,amount,income_date:incomeDate,owner_label:ownerLabel||null}).eq("id",id).eq("household_id",household.id).select("id, description, amount, income_date, owner_label").single();
  if(result.error) throwDataError(result.error,"Could not update the income entry.");
  return {id:result.data.id,source:result.data.description,amount:Number(result.data.amount),date:result.data.income_date,owner:result.data.owner_label??"Household"};
}

export async function deleteIncomeEntry(id:string){
  const household=await getCurrentHousehold();
  const result=await createServerSupabaseClient().from("income_entries").delete().eq("id",id).eq("household_id",household.id);
  if(result.error) throwDataError(result.error,"Could not delete the income entry.");
}
