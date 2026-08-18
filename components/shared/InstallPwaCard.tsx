"use client";

import { IconDeviceMobileDown } from "@tabler/icons-react";
import { useEffect, useState, useSyncExternalStore } from "react";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export function InstallPwaCard() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const clientReady = useSyncExternalStore(() => () => undefined, () => true, () => false);
  useEffect(() => {
    const capture = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPromptEvent); };
    window.addEventListener("beforeinstallprompt", capture);
    return () => window.removeEventListener("beforeinstallprompt", capture);
  }, []);
  if (!clientReady) return null;
  const standalone = window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (standalone || (!ios && !prompt)) return null;
  return <section id="install" aria-labelledby="install-title">
    <div className="settings-section-heading">
      <span><IconDeviceMobileDown size={18} aria-hidden="true" /></span>
      <div><h3 id="install-title">Install BearVault</h3><p>{ios ? "In Safari, tap Share, then Add to Home Screen." : "Open BearVault in its own app window."}</p></div>
    </div>
    {prompt && <button type="button" onClick={() => { void prompt.prompt().then(() => prompt.userChoice).then(() => setPrompt(null)); }}>Install app</button>}
  </section>;
}
