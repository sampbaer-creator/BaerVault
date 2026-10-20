"use client";

import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import { motion, type MotionValue, useMotionValue, useMotionValueEvent } from "motion/react";
import { Fragment, useCallback, useEffect, useRef } from "react";

import { primaryNavigation } from "./navigation";
import styles from "./AppShell.module.css";
import { type MonthSelection, withMonth } from "@/lib/helpers/monthSelection";

type MobileNavProps = {
  pathname: string;
  progress: MotionValue<number>;
  activeIndex: number;
  navigate: (href: string) => void;
  pagerEnabled: boolean;
  selectedMonth?: MonthSelection;
};

const links = primaryNavigation.filter(({ href }) => href !== "/household");

export function MobileNav({ pathname, progress, activeIndex, navigate, pagerEnabled, selectedMonth }: MobileNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const bubbleX = useMotionValue(0);
  const bubbleWidth = useMotionValue(0);

  const positionBubble = useCallback((value: number) => {
    const low = Math.max(0, Math.min(links.length - 1, Math.floor(value)));
    const high = Math.max(0, Math.min(links.length - 1, Math.ceil(value)));
    const from = linkRefs.current[low];
    const to = linkRefs.current[high];
    if (!from || !to) return;
    const amount = value - low;
    bubbleX.set(from.offsetLeft + (to.offsetLeft - from.offsetLeft) * amount);
    bubbleWidth.set(from.offsetWidth + (to.offsetWidth - from.offsetWidth) * amount);
  }, [bubbleWidth, bubbleX]);
  useMotionValueEvent(progress, "change", positionBubble);

  useEffect(() => {
    const nav = navRef.current;
    const active = linkRefs.current[pagerEnabled ? activeIndex : links.findIndex((item) => item.href === pathname)];
    if (nav && active) {
      const center = () => { nav.scrollLeft = active.offsetLeft - nav.clientWidth / 2 + active.clientWidth / 2; };
      requestAnimationFrame(center);
      const timer = window.setTimeout(center, 120);
      return () => window.clearTimeout(timer);
    }
  }, [activeIndex, pagerEnabled, pathname]);

  useEffect(() => {
    const update = () => positionBubble(progress.get());
    requestAnimationFrame(update);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [positionBubble, progress]);

  return (
      <nav ref={navRef} className={`${styles.mobileNav} mobile-nav-enhanced`} aria-label="Mobile sections">
        <motion.span aria-hidden="true" className={styles.mobileActiveIndicator} style={{ x: bubbleX, width: bubbleWidth }} />
        {links.map(({ href, label, icon: Icon }, index) => {
          const isActive = pagerEnabled ? activeIndex === index : pathname === href;

          return <Fragment key={href}>
            {index === 2 && <Link className={styles.mobileAdd} href={selectedMonth ? withMonth("/budget", selectedMonth) : "/budget"} aria-label="Open Budget to add a purchase"><IconPlus size={24} aria-hidden="true" /></Link>}
            <Link
              className={`${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ""}`}
              href={selectedMonth ? withMonth(href, selectedMonth) : href}
              ref={(node) => { linkRefs.current[index] = node; }}
              prefetch={isActive ? false : undefined}
              onClick={(event) => { if (pagerEnabled) { event.preventDefault(); navigate(href); } }}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} stroke={1.9} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          </Fragment>;
        })}
      </nav>
  );
}
