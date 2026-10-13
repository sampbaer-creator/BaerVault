"use client";
import { createTheme, Drawer, MantineProvider, Modal } from "@mantine/core";
import { useReducedMotion } from "motion/react";
import { useMemo, type ReactNode } from "react";

export function UiProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const theme = useMemo(() => createTheme({
    fontFamily: "var(--font-system)",
    headings: { fontFamily: "var(--font-system)", fontWeight: "600" },
    defaultRadius: "lg",
    components: {
      Drawer: Drawer.extend({ defaultProps: { transitionProps: { duration: reduced ? 0 : 240, timingFunction: "cubic-bezier(.32,.72,0,1)" }, overlayProps: { backgroundOpacity: .28 } } }),
      Modal: Modal.extend({ defaultProps: { transitionProps: { duration: reduced ? 0 : 200 }, overlayProps: { backgroundOpacity: .28 } } }),
    },
  }), [reduced]);
  return <MantineProvider theme={theme} defaultColorScheme="auto">{children}</MantineProvider>;
}
