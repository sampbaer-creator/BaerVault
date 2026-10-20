"use client";

import { UserButton } from "@clerk/nextjs";
import { IconBuildingCommunity, IconSettings, IconUserCircle } from "@tabler/icons-react";
import Link from "next/link";
import { useRef } from "react";
import styles from "./ProfileMenu.module.css";

export function ProfileMenu({ demo = false }: { demo?: boolean }) {
  const details = useRef<HTMLDetailsElement>(null);
  const base = demo ? "/demo" : "";
  const close = () => details.current?.removeAttribute("open");
  return <details className={styles.menu} ref={details}>
    <summary aria-label="Open profile menu" title="Profile menu"><IconUserCircle size={25} aria-hidden="true" /></summary>
    <div className={styles.popover}>
      <Link href={`${base}/household`} onClick={close}><IconBuildingCommunity size={18} aria-hidden="true" />Household</Link>
      <Link href={`${base}/settings`} onClick={close}><IconSettings size={18} aria-hidden="true" />Settings</Link>
      {!demo && <div className={styles.account}><span>Account</span><UserButton /></div>}
      {demo && <Link href="/sign-up" onClick={close}>Create account</Link>}
    </div>
  </details>;
}
