"use client";
import { createTheme, Drawer, MantineProvider, Modal } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useReducedMotion } from "motion/react";
import { useMemo, type ReactNode } from "react";

export function UiProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const theme = useMemo(() => createTheme({
    fontFamily: "var(--font-system)",
    headings: { fontFamily: "var(--font-system)", fontWeight: "600" },
    primaryColor: "baerTeal",
    primaryShade: { light: 7, dark: 4 },
    colors: { baerTeal: ["var(--teal-0)", "var(--teal-1)", "var(--teal-2)", "var(--teal-3)", "var(--teal-4)", "var(--teal-5)", "var(--teal-6)", "var(--teal-7)", "var(--teal-8)", "var(--teal-9)"] },
    defaultRadius: "lg",
    components: {
      Drawer: Drawer.extend({ defaultProps: { transitionProps: { duration: reduced ? 0 : 240, timingFunction: "cubic-bezier(.32,.72,0,1)" }, overlayProps: { backgroundOpacity: .28 } } }),
      Modal: Modal.extend({ defaultProps: { transitionProps: { duration: reduced ? 0 : 200 }, overlayProps: { backgroundOpacity: .28 } } }),
    },
  }), [reduced]);
  return <MantineProvider theme={theme} defaultColorScheme="auto"><Notifications position="bottom-right" />{children}</MantineProvider>;
}
