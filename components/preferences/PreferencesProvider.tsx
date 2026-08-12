"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode="light"|"dark"|"system";export type Accent="green"|"blue"|"bronze";export type Density="comfortable"|"compact";
type Preferences={theme:ThemeMode;accent:Accent;density:Density;reducedMotion:boolean;currency:string};
const defaults:Preferences={theme:"system",accent:"green",density:"comfortable",reducedMotion:false,currency:"USD"};
type ContextValue={preferences:Preferences;update:(next:Partial<Preferences>)=>void;reset:()=>void};
const PreferencesContext=createContext<ContextValue|null>(null);

export function PreferencesProvider({children}:{children:React.ReactNode}){const[preferences,setPreferences]=useState(defaults);useEffect(()=>{const timer=window.setTimeout(()=>{try{const saved=localStorage.getItem("bearvault-preferences");if(saved)setPreferences({...defaults,...JSON.parse(saved)});}catch{}},0);return()=>clearTimeout(timer)},[]);useEffect(()=>{const root=document.documentElement;const system=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";root.dataset.theme=preferences.theme==="system"?system:preferences.theme;root.dataset.accent=preferences.accent;root.dataset.density=preferences.density;root.dataset.motion=preferences.reducedMotion?"reduced":"full";localStorage.setItem("bearvault-preferences",JSON.stringify(preferences));},[preferences]);const value=useMemo(()=>({preferences,update:(next:Partial<Preferences>)=>setPreferences(current=>({...current,...next})),reset:()=>setPreferences(defaults)}),[preferences]);return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>}
export function usePreferences(){const value=useContext(PreferencesContext);if(!value)throw new Error("PreferencesProvider is missing.");return value}
export function useCurrencyFormatter(){const{preferences}=usePreferences();return useMemo(()=>new Intl.NumberFormat("en-US",{style:"currency",currency:preferences.currency}),[preferences.currency])}
