"use client";

import LiquidGlass from "liquid-glass-react";
import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./LiquidGlassLink.module.css";

export function LiquidGlassLink({
  href,
  children,
  tone = "primary",
  compact = false,
}: {
  href: string;
  children: ReactNode;
  tone?: "primary" | "clear";
  compact?: boolean;
}) {
  return (
    <LiquidGlass
      displacementScale={compact ? 42 : 58}
      blurAmount={0.09}
      saturation={135}
      aberrationIntensity={1.4}
      elasticity={0.22}
      cornerRadius={compact ? 12 : 14}
      padding="0"
      overLight
      mode={tone === "primary" ? "prominent" : "standard"}
      className={styles.material}
    >
      <Link
        className={`${styles.link} ${styles[tone]} ${compact ? styles.compact : ""}`}
        href={href}
      >
        {children}
      </Link>
    </LiquidGlass>
  );
}
