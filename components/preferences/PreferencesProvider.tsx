"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type Accent = "navy" | "gold" | "bright-gold";
export type Palette = "vault" | "palm" | "coffee" | "powder-blue" | "water";
export type Density = "comfortable" | "compact";
type Preferences = {
  theme: ThemeMode;
  accent: Accent;
  palette: Palette;
  density: Density;
  reducedMotion: boolean;
  currency: string;
};
const defaults: Preferences = {
  theme: "system",
  accent: "navy",
  palette: "vault",
  density: "comfortable",
  reducedMotion: false,
  currency: "USD",
};
const accents: Accent[] = ["navy", "gold", "bright-gold"];
const palettes: Palette[] = ["vault", "palm", "coffee", "powder-blue", "water"];
function isAccent(value: unknown): value is Accent {
  return typeof value === "string" && accents.includes(value as Accent);
}
function isPalette(value: unknown): value is Palette {
  return typeof value === "string" && palettes.includes(value as Palette);
}
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
          const accent = isAccent(parsed.accent)
            ? parsed.accent
            : defaults.accent;
          const palette = isPalette(parsed.palette)
            ? parsed.palette
            : defaults.palette;
          setPreferences({ ...defaults, ...parsed, accent, palette });
        }
      } catch {}
      setStorageReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!storageReady) return;
    const root = document.documentElement;
    const system = matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    root.dataset.theme =
      preferences.theme === "system" ? system : preferences.theme;
    root.dataset.accent = preferences.accent;
    root.dataset.palette = preferences.palette;
    root.dataset.density = preferences.density;
    root.dataset.motion = preferences.reducedMotion ? "reduced" : "full";
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
