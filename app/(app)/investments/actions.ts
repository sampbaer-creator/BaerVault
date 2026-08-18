"use server";

import { revalidatePath } from "next/cache";
import { createHoldingWithLot, createInvestmentAccount, createPurchaseLot, deleteHolding, deleteInvestmentAccount, deletePurchaseLot, updateHolding, updateInvestmentAccount, updatePurchaseLot } from "@/lib/data/investments";
import { DataAccessError, errorMessage } from "@/lib/data/errors";

export async function addInvestmentAccountAction(input: { name: string; accountType: string; ownership: string }) {
  try {
    const name = input.name.trim(); const accountType = input.accountType.trim();
    if (!name || name.length > 100 || !accountType || accountType.length > 60 || !["user", "spouse", "joint", "other"].includes(input.ownership)) throw new DataAccessError("Enter valid account details.");
    const data = await createInvestmentAccount(name, accountType, input.ownership);
    revalidatePath("/investments"); return { ok: true as const, data };
  } catch (error) { return { ok: false as const, error: errorMessage(error) }; }
}

const refresh=()=>{revalidatePath("/investments");revalidatePath("/dashboard")};
export async function updateInvestmentAccountAction(input:{id:string;name:string;accountType:string;ownership:string}){try{const name=input.name.trim(),type=input.accountType.trim();if(!input.id||!name||!type||!["user","spouse","joint","other"].includes(input.ownership))throw new DataAccessError("Enter valid account details.");await updateInvestmentAccount(input.id,name,type,input.ownership);refresh();return{ok:true as const}}catch(error){return{ok:false as const,error:errorMessage(error)}}}
export async function deleteInvestmentAccountAction(id:string){try{await deleteInvestmentAccount(id);refresh();return{ok:true as const}}catch(error){return{ok:false as const,error:errorMessage(error)}}}
export async function updateHoldingAction(input:{id:string;symbol:string;name:string}){try{const symbol=input.symbol.trim().toUpperCase(),name=input.name.trim()||symbol;if(!input.id||!/^[A-Z0-9./-]{1,15}$/.test(symbol)||name.length>120)throw new DataAccessError("Enter valid holding details.");await updateHolding(input.id,symbol,name);refresh();return{ok:true as const}}catch(error){return{ok:false as const,error:errorMessage(error)}}}
export async function deleteHoldingAction(id:string){try{await deleteHolding(id);refresh();return{ok:true as const}}catch(error){return{ok:false as const,error:errorMessage(error)}}}
export async function updatePurchaseLotAction(input:{id:string;shares:number;price:number;date:string}){try{if(!input.id||input.shares<=0||input.price<0||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(input.date))throw new DataAccessError("Enter valid lot details.");await updatePurchaseLot(input.id,input.shares,input.price,input.date);refresh();return{ok:true as const}}catch(error){return{ok:false as const,error:errorMessage(error)}}}
export async function deletePurchaseLotAction(id:string){try{await deletePurchaseLot(id);refresh();return{ok:true as const}}catch(error){return{ok:false as const,error:errorMessage(error)}}}

export async function addHoldingAction(input: { accountId: string; symbol: string; name: string; shares: number; price: number; date: string }) {
  try {
    const symbol = input.symbol.trim().toUpperCase(); const name = input.name.trim() || symbol;
    if (!input.accountId || !/^[A-Z0-9./-]{1,15}$/.test(symbol) || name.length > 120 || !Number.isFinite(input.shares) || input.shares <= 0 || !Number.isFinite(input.price) || input.price < 0 || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new DataAccessError("Enter a valid holding and purchase lot.");
    const data = await createHoldingWithLot(input.accountId, symbol, name, input.shares, input.price, input.date);
    revalidatePath("/investments"); revalidatePath("/dashboard"); return { ok: true as const, data };
  } catch (error) { return { ok: false as const, error: errorMessage(error) }; }
}

export async function addPurchaseLotAction(input: { holdingId: string; shares: number; price: number; date: string }) {
  try {
    if (!input.holdingId || !Number.isFinite(input.shares) || input.shares <= 0 || !Number.isFinite(input.price) || input.price < 0 || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new DataAccessError("Enter valid lot details.");
    const data = await createPurchaseLot(input.holdingId, input.shares, input.price, input.date);
    revalidatePath("/investments"); revalidatePath("/dashboard"); return { ok: true as const, data };
  } catch (error) { return { ok: false as const, error: errorMessage(error) }; }
}
