"use client";
import { BudgetWorkspace } from "@/components/budget/BudgetWorkspace";import { augustBudget } from "@/lib/mockFinanceData";
const ok=<T,>(data:T)=>Promise.resolve({ok:true as const,data});const id=()=>`demo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const actions={addCategoryAction:(input:{name:string;plannedAmount:number})=>ok({id:id(),name:input.name,plannedAmount:input.plannedAmount,purchases:[]}),deleteBudgetCategoryAction:()=>ok(undefined),deleteBudgetEntryAction:()=>ok(undefined),saveBudgetEntryAction:(input:{id?:string})=>ok({id:input.id??id()}),updateBudgetCategoryAction:()=>ok(undefined)};
export function DemoBudget(){return <BudgetWorkspace initialBudget={{...augustBudget,year:2026,monthNumber:8}} actions={actions}/>}
