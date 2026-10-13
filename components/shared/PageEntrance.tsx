"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { navigationSpring } from "@/lib/ui/motion";

export function PageEntrance({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return <motion.div initial={{ opacity: .8, transform: reduced ? "none" : "translateY(6px)" }} animate={{ opacity: 1, transform: "none" }} transition={reduced ? { duration: .12 } : navigationSpring}>{children}</motion.div>;
}
