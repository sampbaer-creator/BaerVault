"use client";

import { IconBuildingBank } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { completeBankConnectionAction, startBankConnectionAction } from "@/app/(app)/accounts/actions";
import type { TellerEnrollmentResult } from "@/lib/banking/teller/signatures";
import { SHELL_QUICK_ADD_EVENT, type ShellQuickAddAction } from "@/lib/shellQuickAdd";

declare global {
  interface Window {
    TellerConnect?: { setup(options: Record<string, unknown>): { open(): void } };
  }
}

let scriptPromise: Promise<void> | null = null;
function loadTellerConnect() {
  if (window.TellerConnect) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://cdn.teller.io/connect/connect.js"]');
    if (existing) { existing.addEventListener("load", () => resolve(), { once: true }); return; }
    const script = document.createElement("script");
    script.src = "https://cdn.teller.io/connect/connect.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Teller Connect could not be loaded."));
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export function BankConnectionButton({ className, onMessage, enrollmentId, label = "Connect bank", listenToShell = false }: {
  className?: string; enrollmentId?: string; label?: string; listenToShell?: boolean;
  onMessage(message: string, success?: boolean): void;
}) {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async () => {
    if (connecting) return;
    setConnecting(true);
    const started = await startBankConnectionAction();
    if (!started.ok) { onMessage(started.error); setConnecting(false); return; }
    try {
      await loadTellerConnect();
      const teller = window.TellerConnect?.setup({
        applicationId: started.data.applicationId,
        environment: started.data.environment,
        products: ["balance", "transactions"],
        selectAccount: "multiple",
        nonce: started.data.nonce,
        ...(enrollmentId ? { enrollmentId } : {}),
        onSuccess: async (enrollment: TellerEnrollmentResult) => {
          const result = await completeBankConnectionAction({ nonce: started.data.nonce, enrollment });
          setConnecting(false);
          if (!result.ok) return onMessage(result.error);
          onMessage("Bank connected. Accounts and recent transactions are now synced.", true);
          router.refresh();
        },
        onExit: () => setConnecting(false),
      });
      if (!teller) throw new Error("Teller Connect is unavailable.");
      teller.open();
    } catch (error) {
      setConnecting(false);
      onMessage(error instanceof Error ? error.message : "Could not open Teller Connect.");
    }
  }, [connecting, enrollmentId, onMessage, router]);

  useEffect(() => {
    const handler = (event: Event) => {
      if (listenToShell && (event as CustomEvent<ShellQuickAddAction>).detail === "account-connect") void connect();
    };
    window.addEventListener(SHELL_QUICK_ADD_EVENT, handler);
    return () => window.removeEventListener(SHELL_QUICK_ADD_EVENT, handler);
  }, [connect, listenToShell]);

  return <button className={className} type="button" onClick={() => void connect()} disabled={connecting}>
    <IconBuildingBank size={17} aria-hidden="true" /> {connecting ? "Connecting…" : label}
  </button>;
}
