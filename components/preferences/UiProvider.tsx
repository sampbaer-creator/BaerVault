"use client";
import { createTheme, Drawer, MantineProvider, Modal } from "@mantine/core";
import { useReducedMotion } from "motion/react";
import { useMemo, type ReactNode } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { usePreferences } from "./PreferencesProvider";

export function UiProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const { preferences } = usePreferences();
  const systemDark = useMediaQuery("(prefers-color-scheme: dark)");
  const colorScheme = preferences.theme === "system" ? (systemDark ? "dark" : "light") : preferences.theme;
  const theme = useMemo(() => createTheme({
    fontFamily: "var(--font-body)",
    headings: { fontFamily: "var(--font-body)", fontWeight: "650" },
    defaultRadius: "lg",
    components: {
      Drawer: Drawer.extend({ defaultProps: { closeButtonProps: { "aria-label": "Close dialog" }, transitionProps: { duration: reduced ? 0 : 200, timingFunction: "cubic-bezier(.2,0,0,1)" }, overlayProps: { backgroundOpacity: .28 } } }),
      Modal: Modal.extend({ defaultProps: { closeButtonProps: { "aria-label": "Close dialog" }, transitionProps: { duration: reduced ? 0 : 200 }, overlayProps: { backgroundOpacity: .28 } } }),
    },
  }), [reduced]);
  return <MantineProvider theme={theme} forceColorScheme={colorScheme}>{children}</MantineProvider>;
}
