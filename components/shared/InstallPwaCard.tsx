"use client";

import { IconDeviceMobileDown } from "@tabler/icons-react";
import { useState, useSyncExternalStore } from "react";
import { getInstallPrompt, getServerInstallPrompt, setInstallPrompt, subscribeInstallPrompt } from "@/lib/ui/pwaInstall";

export function InstallPwaCard() {
  const prompt = useSyncExternalStore(subscribeInstallPrompt, getInstallPrompt, getServerInstallPrompt);
  const [error, setError] = useState("");
  const clientReady = useSyncExternalStore(() => () => undefined, () => true, () => false);
  if (!clientReady) return null;
  const standalone = window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (standalone || (!ios && !prompt && !error)) return null;
  return <section id="install" aria-labelledby="install-title">
    <div className="settings-section-heading">
      <span><IconDeviceMobileDown size={18} aria-hidden="true" /></span>
      <div><h3 id="install-title">Install BearVault</h3><p>{ios ? "In Safari, tap Share, then Add to Home Screen." : "Open BearVault in its own app window."}</p></div>
    </div>
    {prompt && <button type="button" onClick={() => {
      setError("");
      void prompt.prompt().then(() => prompt.userChoice).catch(() => setError("Installation could not start. Try your browser’s install menu.")).finally(() => setInstallPrompt(null));
    }}>Install app</button>}
    {error ? <p role="alert">{error}</p> : null}
  </section>;
}
