"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const routeOrder = ["/cash-flow", "/accounts", "/investments", "/transactions", "/dashboard", "/budget", "/recurring", "/goals"];

export function useMobilePageSwipe(pathname: string, demo = false) {
  const router = useRouter();
  const start = useRef<{ x: number; y: number } | null>(null);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const prefix = demo ? "/demo" : "";
  const normalized = demo ? (pathname === "/demo" ? "/dashboard" : pathname.slice(5)) : pathname;

  function onTouchStart(event: React.TouchEvent<HTMLElement>) {
    if (event.touches.length !== 1 || (event.target as HTMLElement).closest("input,textarea,select,button,a,[role='slider']")) return;
    start.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }

  function onTouchEnd(event: React.TouchEvent<HTMLElement>) {
    if (!start.current || event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - start.current.x;
    const dy = event.changedTouches[0].clientY - start.current.y;
    start.current = null;
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.35) return;
    const index = routeOrder.indexOf(normalized);
    if (index < 0) return;
    const nextIndex = dx < 0 ? index + 1 : index - 1;
    const next = routeOrder[nextIndex];
    if (!next) return;
    setDirection(dx < 0 ? "left" : "right");
    window.setTimeout(() => {
      router.push(demo && next === "/dashboard" ? "/demo" : `${prefix}${next}`);
      setDirection(null);
    }, 110);
  }

  return { onTouchStart, onTouchEnd, direction };
}
