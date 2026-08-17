"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { IconPlus, IconRefresh } from "@tabler/icons-react";

import { augustBudget } from "@/lib/mockFinanceData";
import { investmentAccounts } from "@/lib/investmentData";
import styles from "./DemoWorkspace.module.css";

type DemoState = {
  categories: Array<{ id:string; name:string; planned:number; entries:Array<{id:string;description:string;amount:number}> }>;
  accounts: Array<{id:string;name:string;type:string;holdings:Array<{id:string;symbol:string;shares:number;cost:number}>}>;
};

const initialState: DemoState = {
  categories: augustBudget.categories.map((category) => ({ id:category.id, name:category.name, planned:category.plannedAmount, entries:category.purchases.map((entry)=>({id:entry.id,description:entry.description,amount:entry.amount})) })),
  accounts: investmentAccounts.map((account)=>({id:account.id,name:account.name,type:account.type,holdings:account.holdings.map((holding)=>({id:holding.id,symbol:holding.symbol,shares:holding.lots.reduce((sum,lot)=>sum+lot.shares,0),cost:holding.lots.reduce((sum,lot)=>sum+lot.shares*lot.price,0)}))})),
};

const money = new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"});
const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function DemoWorkspace({ view }: { view:"budget"|"investments"|"household"|"settings" }) {
  const [state,setState] = useState(initialState); const [ready,setReady] = useState(false); const [notice,setNotice] = useState("");
  useEffect(()=>{const timer=window.setTimeout(()=>{const saved=sessionStorage.getItem("bearvault-demo"); if(saved){try{setState(JSON.parse(saved));}catch{}} setReady(true);},0);return()=>window.clearTimeout(timer);},[]);
  useEffect(()=>{if(ready)sessionStorage.setItem("bearvault-demo",JSON.stringify(state));},[state,ready]);
  const spending=useMemo(()=>state.categories.reduce((sum,c)=>sum+c.entries.reduce((s,e)=>s+e.amount,0),0),[state]);
  function reset(){setState(initialState);sessionStorage.removeItem("bearvault-demo");setNotice("Demo data reset.");}
  function submit(event:FormEvent<HTMLFormElement>,kind:string){event.preventDefault();const form=new FormData(event.currentTarget);const name=String(form.get("name")??"").trim();const amount=Number(form.get("amount"));if(!name||!Number.isFinite(amount)||amount<=0)return;
    if(kind==="expense")setState(s=>({...s,categories:s.categories.map((c,i)=>i===0?{...c,entries:[{id:createId(),description:name,amount},...c.entries]}:c)}));
    if(kind==="account")setState(s=>({...s,accounts:[...s.accounts,{id:createId(),name,type:"Brokerage",holdings:[]}]}));
    if(kind==="holding"&&state.accounts[0])setState(s=>({...s,accounts:s.accounts.map((a,i)=>i===0?{...a,holdings:[...a.holdings,{id:createId(),symbol:name.toUpperCase(),shares:amount,cost:amount*100}]}:a)}));
    event.currentTarget.reset();setNotice("Added for this demo session.");}
  if(!ready)return <div className={styles.loading}>Loading demo…</div>;
  if(view==="household")return <Page title="Demo Household" intro="See how a shared Clerk household will appear in the real application."><div className={styles.grid}><Card title="Members"><Row label="Sam" value="Organizer"/><Row label="Bailey" value="Member"/></Card><Card title="Sharing"><p>Both members see the same budgets, income, accounts, and holdings in the authenticated version.</p><p className={styles.note}>This public demo has no real members and never contacts Clerk Organizations or Supabase.</p></Card></div></Page>;
  if(view==="settings")return <Page title="Demo settings" intro="Preview account preferences without changing a real account."><div className={styles.grid}><Card title="Preferences"><label className={styles.toggle}><input type="checkbox" defaultChecked/> Monthly budget reminders</label><label className={styles.toggle}><input type="checkbox" defaultChecked/> Portfolio summary</label></Card><Card title="Demo controls"><p>Changes are stored only in this browser tab.</p><button className={styles.secondary} onClick={reset}><IconRefresh size={16}/>Reset demo data</button></Card></div></Page>;
  if(view==="budget")return <Page title="August budget" intro="Add an expense and watch actual spending update. Nothing is saved to the production database."><Notice text={notice}/><Stats items={[["Planned",money.format(state.categories.reduce((s,c)=>s+c.planned,0))],["Spent",money.format(spending)],["Remaining",money.format(state.categories.reduce((s,c)=>s+c.planned,0)-spending)]]}/><DemoForm onSubmit={(e)=>submit(e,"expense")} action="Add expense" nameLabel="Description" amountLabel="Amount"/><div className={styles.list}>{state.categories.map(c=>{const actual=c.entries.reduce((s,e)=>s+e.amount,0);return <Card key={c.id} title={c.name}><Row label={`${c.entries.length} entries`} value={`${money.format(actual)} / ${money.format(c.planned)}`}/><div className={styles.progress}><span style={{width:`${Math.min(actual/c.planned*100,100)}%`}}/></div></Card>})}</div></Page>;
  return <Page title="Investment accounts" intro="Try adding accounts and holdings. Market examples are mock values in this database-free demo."><Notice text={notice}/><Stats items={[["Accounts",String(state.accounts.length)],["Holdings",String(state.accounts.reduce((s,a)=>s+a.holdings.length,0))],["Amount invested",money.format(state.accounts.reduce((s,a)=>s+a.holdings.reduce((x,h)=>x+h.cost,0),0))]]}/><div className={styles.forms}><DemoForm onSubmit={(e)=>submit(e,"account")} action="Add account" nameLabel="Account name"/><DemoForm onSubmit={(e)=>submit(e,"holding")} action="Add holding" nameLabel="Ticker symbol" amountLabel="Shares"/></div><div className={styles.list}>{state.accounts.map(a=><Card key={a.id} title={a.name}><p className={styles.note}>{a.type}</p>{a.holdings.length?a.holdings.map(h=><Row key={h.id} label={`${h.symbol} · ${h.shares} shares`} value={money.format(h.cost)}/>):<p>No holdings yet.</p>}</Card>)}</div></Page>;
}

function Page({title,intro,children}:{title:string;intro:string;children:React.ReactNode}){return <div className={styles.page}><div className={styles.banner}><strong>Demo mode</strong><span>Mock data · no sign-in · no database writes</span></div><header><h1>{title}</h1><p>{intro}</p></header>{children}</div>}
function Card({title,children}:{title:string;children:React.ReactNode}){return <section className={styles.card}><h2>{title}</h2>{children}</section>}
function Row({label,value}:{label:string;value:string}){return <div className={styles.row}><span>{label}</span><strong>{value}</strong></div>}
function Notice({text}:{text:string}){return text?<p className={styles.notice}>{text}</p>:null}
function Stats({items}:{items:string[][]}){return <div className={styles.stats}>{items.map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>}
function DemoForm({onSubmit,action,nameLabel,amountLabel}:{onSubmit:(e:FormEvent<HTMLFormElement>)=>void;action:string;nameLabel:string;amountLabel?:string}){return <form className={styles.form} onSubmit={onSubmit}><label>{nameLabel}<input name="name" required/></label>{amountLabel&&<label>{amountLabel}<input name="amount" type="number" min="0.01" step="0.01" required/></label>}<button><IconPlus size={16}/>{action}</button></form>}
