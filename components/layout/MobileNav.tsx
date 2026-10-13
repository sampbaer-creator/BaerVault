"use client";

import Link from "next/link";
import type { MotionValue } from "motion/react";
import { mobileRouteOrder, mobileSectionNavigation } from "./navigation";
import { type MonthSelection, withMonth } from "@/lib/helpers/monthSelection";
import styles from "./AppShell.module.css";

type MobileNavProps = {
  pathname: string;
  progress: MotionValue<number>;
  activeIndex: number;
  navigate: (href: string) => void;
  pagerEnabled: boolean;
  selectedMonth?: MonthSelection;
};

export function MobileNav({ pathname, activeIndex, navigate, pagerEnabled, selectedMonth }: MobileNavProps) {
  const activePath = pagerEnabled ? mobileRouteOrder[activeIndex] : pathname;
  return <nav className={styles.mobileNav} aria-label="Mobile sections">
    {mobileSectionNavigation.map(({ href, label, icon: Icon }) => <Link
      key={href}
      href={selectedMonth ? withMonth(href, selectedMonth) : href}
      className={`${styles.mobileLink} ${activePath === href ? styles.mobileLinkActive : ""}`}
      aria-current={activePath === href ? "page" : undefined}
      onClick={(event) => {
        if (pagerEnabled && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
          event.preventDefault(); navigate(href);
        }
      }}
    ><Icon size={22} stroke={1.8} aria-hidden="true" /><span>{label}</span></Link>)}
  </nav>;
}
