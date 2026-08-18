"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { mobileSectionNavigation } from "./navigation";
import styles from "./AppShell.module.css";

type MobileNavProps = {
  pathname: string;
};

export function MobileNav({ pathname }: MobileNavProps) {
  const links = mobileSectionNavigation;
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>("[aria-current='page']");
    if (nav && active) {
      const center = () => { nav.scrollLeft = active.offsetLeft - nav.clientWidth / 2 + active.clientWidth / 2; };
      requestAnimationFrame(center);
      const timer = window.setTimeout(center, 120);
      return () => window.clearTimeout(timer);
    }
  }, [pathname]);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 47.999rem)").matches) return;
    const currentIndex = links.findIndex((item) => item.href === pathname);
    [links[currentIndex - 1], links[currentIndex + 1]].forEach((item) => {
      if (item) router.prefetch(item.href);
    });
  }, [links, pathname, router]);

  return (
      <nav ref={navRef} className={`${styles.mobileNav} mobile-nav-enhanced`} aria-label="Mobile sections">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              className={`${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ""}`}
              href={href}
              prefetch={false}
              aria-current={isActive ? "page" : undefined}
              key={href}
              onPointerDown={() => router.prefetch(href)}
              onClick={(event) => {
                if (!window.matchMedia("(max-width: 47.999rem)").matches || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                const currentIndex = links.findIndex((item) => item.href === pathname);
                const nextIndex = links.findIndex((item) => item.href === href);
                document.documentElement.dataset.swipeDirection = nextIndex < currentIndex ? "right" : "left";
                const navigate = () => router.push(href);
                const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                if (!reduceMotion && "startViewTransition" in document) (document as Document & { startViewTransition: (callback: () => void) => void }).startViewTransition(navigate); else navigate();
                window.setTimeout(() => delete document.documentElement.dataset.swipeDirection, 280);
              }}
            >
              <Icon size={18} stroke={1.9} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
  );
}
