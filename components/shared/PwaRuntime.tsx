"use client";

import { useEffect, useRef, useState } from "react";
import { setInstallPrompt, type InstallPromptEvent } from "@/lib/ui/pwaInstall";
import styles from "./PwaRuntime.module.css";

export function PwaRuntime() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [offline, setOffline] = useState(false);
  const updating = useRef(false);
  useEffect(() => {
    const capture = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent); };
    const installed = () => setInstallPrompt(null);
    const updateConnection = () => setOffline(!navigator.onLine);
    updateConnection();
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", installed);
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", installed);
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };
  }, []);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    let disposed = false;
    let registration: ServiceWorkerRegistration | undefined;
    const checkUpdate = () => {
      const worker = registration?.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (!disposed && worker.state === "installed" && navigator.serviceWorker.controller) setWaiting(registration?.waiting ?? null);
      });
    };
    const reload = () => { if (updating.current) window.location.reload(); };
    navigator.serviceWorker.addEventListener("controllerchange", reload);
    const register = () => {
      void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).then((result) => {
        if (disposed) return;
        registration = result;
        setWaiting(result.waiting);
        result.addEventListener("updatefound", checkUpdate);
        checkUpdate();
      }).catch(() => undefined);
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
    return () => {
      disposed = true;
      window.removeEventListener("load", register);
      navigator.serviceWorker.removeEventListener("controllerchange", reload);
      registration?.removeEventListener("updatefound", checkUpdate);
    };
  }, []);
  if (!offline && !waiting) return null;
  return <div className={styles.status} role="status">
    <span>{offline ? "You’re offline. Reconnect to save changes." : "A BearVault update is ready."}</span>
    {!offline && waiting ? <button type="button" onClick={() => { updating.current = true; waiting.postMessage({ type: "SKIP_WAITING" }); }}>Update app</button> : null}
  </div>;
}
