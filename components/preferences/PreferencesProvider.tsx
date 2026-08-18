"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark";
type Preferences = {
  theme: ThemeMode;
  currency: string;
};
const defaults: Preferences = {
  theme: "light",
  currency: "USD",
};
type ContextValue = {
  preferences: Preferences;
  update: (next: Partial<Preferences>) => void;
  reset: () => void;
};
const PreferencesContext = createContext<ContextValue | null>(null);

export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preferences, setPreferences] = useState(defaults);
  const [storageReady, setStorageReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem("bearvault-preferences");
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<Preferences>;
          const theme = parsed.theme === "dark" ? "dark" : "light";
          setPreferences({ ...defaults, currency: parsed.currency ?? defaults.currency, theme });
        }
      } catch {}
      setStorageReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!storageReady) return;
    const root = document.documentElement;
    root.dataset.theme = preferences.theme;
    delete root.dataset.palette;
    delete root.dataset.density;
    delete root.dataset.motion;
    localStorage.setItem("bearvault-preferences", JSON.stringify(preferences));
  }, [preferences, storageReady]);
  const value = useMemo(
    () => ({
      preferences,
      update: (next: Partial<Preferences>) =>
        setPreferences((current) => ({ ...current, ...next })),
      reset: () => setPreferences(defaults),
    }),
    [preferences],
  );
  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}
export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("PreferencesProvider is missing.");
  return value;
}
export function useCurrencyFormatter() {
  const { preferences } = usePreferences();
  return useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: preferences.currency,
      }),
    [preferences.currency],
  );
}
