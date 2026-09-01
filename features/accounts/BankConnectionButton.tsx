"use client";

import { IconBuildingBank } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completeBankConnectionAction, refreshBankConnectionAction, startBankConnectionAction } from "@/app/(app)/accounts/actions";
import { SHELL_QUICK_ADD_EVENT, type ShellQuickAddAction } from "@/lib/shellQuickAdd";

type PlaidMetadata = { institution: { institution_id: string; name: string } | null };
declare global { interface Window { Plaid?: { create(options: { token: string; onSuccess(publicToken: string, metadata: PlaidMetadata): void; onExit(): void }): { open(): void; destroy(): void } } } }
let scriptPromise: Promise<void> | null = null;
function loadPlaid() {
  if (window.Plaid) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"]');
    if (existing) { existing.addEventListener("load", () => resolve(), { once: true }); return; }
    const script = document.createElement("script"); script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
    script.onload = () => resolve(); script.onerror = () => reject(new Error("Plaid Link could not be loaded.")); document.body.appendChild(script);
  });
  return scriptPromise;
}

export function BankConnectionButton({ className, onMessage, connectionId, label = "Connect bank", listenToShell = false }: { className?: string; connectionId?: string; label?: string; listenToShell?: boolean; onMessage(message: string, success?: boolean): void }) {
  const router = useRouter(); const [connecting, setConnecting] = useState(false);
  const connect = useCallback(async () => {
    if (connecting) return; setConnecting(true);
    const started = await startBankConnectionAction(connectionId);
    if (!started.ok) { onMessage(started.error); setConnecting(false); return; }
    try {
      await loadPlaid();
      const handler = window.Plaid?.create({ token: started.data.linkToken,
        onSuccess: async (publicToken, metadata) => {
          const result = connectionId ? await refreshBankConnectionAction(connectionId) : await completeBankConnectionAction({ publicToken, institution: { id: metadata.institution?.institution_id ?? "unknown", name: metadata.institution?.name ?? "Connected bank" } });
          handler?.destroy(); setConnecting(false);
          if (!result.ok) return onMessage(result.error);
          onMessage(connectionId ? "Bank connection repaired." : "Bank connected. Posted spending is syncing into your budgets.", true); router.refresh();
        }, onExit: () => { handler?.destroy(); setConnecting(false); } });
      if (!handler) throw new Error("Plaid Link is unavailable."); handler.open();
    } catch (error) { setConnecting(false); onMessage(error instanceof Error ? error.message : "Could not open Plaid Link."); }
  }, [connecting, connectionId, onMessage, router]);
  useEffect(() => { const handler = (event: Event) => { if (listenToShell && (event as CustomEvent<ShellQuickAddAction>).detail === "account-connect") void connect(); }; window.addEventListener(SHELL_QUICK_ADD_EVENT, handler); return () => window.removeEventListener(SHELL_QUICK_ADD_EVENT, handler); }, [connect, listenToShell]);
  return <button className={className} type="button" onClick={() => void connect()} disabled={connecting}><IconBuildingBank size={17} aria-hidden="true" /> {connecting ? "Connecting…" : label}</button>;
}
