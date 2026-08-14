"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  isFinancePaletteId,
  paletteVariables,
  type FinancePaletteId,
} from "@/lib/themePalettes";

export type ThemeMode = "light" | "dark" | "system";
export type Density = "comfortable" | "compact";
type Preferences = {
  theme: ThemeMode;
  palette: FinancePaletteId;
  density: Density;
  reducedMotion: boolean;
  currency: string;
};
const defaults: Preferences = {
  theme: "system",
  palette: "ledger-navy",
  density: "comfortable",
  reducedMotion: false,
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
          const palette = isFinancePaletteId(parsed.palette)
            ? parsed.palette
            : defaults.palette;
          setPreferences({ ...defaults, ...parsed, palette });
        }
      } catch {}
      setStorageReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!storageReady) return;
    const root = document.documentElement;
    const colorScheme = matchMedia("(prefers-color-scheme: dark)");

    function applyPreferences() {
      const resolvedTheme =
        preferences.theme === "system"
          ? colorScheme.matches
            ? "dark"
            : "light"
          : preferences.theme;
      root.dataset.theme = resolvedTheme;
      root.dataset.palette = preferences.palette;
      root.dataset.density = preferences.density;
      root.dataset.motion = preferences.reducedMotion ? "reduced" : "full";
      for (const [property, value] of Object.entries(
        paletteVariables(preferences.palette, resolvedTheme === "dark"),
      )) {
        root.style.setProperty(property, value);
      }
    }

    applyPreferences();
    colorScheme.addEventListener("change", applyPreferences);
    localStorage.setItem("bearvault-preferences", JSON.stringify(preferences));
    return () => colorScheme.removeEventListener("change", applyPreferences);
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
