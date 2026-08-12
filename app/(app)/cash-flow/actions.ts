"use server";

import { revalidatePath } from "next/cache";
import { createIncomeEntry, deleteIncomeEntry, updateIncomeEntry } from "@/lib/data/cash-flow";
import { errorMessage } from "@/lib/data/errors";

export async function addIncomeAction(input: { description: string; amount: number; date: string; ownerLabel?: string }) {
  try {
    const description = input.description.trim(); const ownerLabel = input.ownerLabel?.trim();
    if (!description || description.length > 160 || !Number.isFinite(input.amount) || input.amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(input.date) || (ownerLabel?.length ?? 0) > 80) throw new Error("Enter a valid income source, amount, and date.");
    const data = await createIncomeEntry(description, input.amount, input.date, ownerLabel);
    revalidatePath("/cash-flow"); revalidatePath("/transactions"); revalidatePath("/dashboard"); return { ok: true as const, data };
  } catch (error) { return { ok: false as const, error: errorMessage(error) }; }
}

export async function saveIncomeAction(input:{id?:string;description:string;amount:number;date:string;ownerLabel?:string}){
  try{const description=input.description.trim();const ownerLabel=input.ownerLabel?.trim();if(!description||description.length>160||!Number.isFinite(input.amount)||input.amount<=0||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(input.date)||(ownerLabel?.length??0)>80)throw new Error("Enter a valid income source, amount, and date.");const data=input.id?await updateIncomeEntry(input.id,description,input.amount,input.date,ownerLabel):await createIncomeEntry(description,input.amount,input.date,ownerLabel);revalidatePath("/cash-flow");revalidatePath("/transactions");revalidatePath("/dashboard");return{ok:true as const,data};}catch(error){return{ok:false as const,error:errorMessage(error)}}
}
export async function deleteIncomeAction(id:string){try{await deleteIncomeEntry(id);revalidatePath("/cash-flow");revalidatePath("/transactions");revalidatePath("/dashboard");return{ok:true as const}}catch(error){return{ok:false as const,error:errorMessage(error)}}}
