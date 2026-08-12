"use client";

import { useEffect } from "react";

const selector = ".liquid-gl-pane:not([data-liquid-ready])";

export function LiquidGLRuntime() {
  useEffect(() => {
    const reducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.motion === "reduced";
    const desktop = window.matchMedia("(min-width: 48rem)").matches;
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(selector),
    );
    if (!desktop || reducedMotion || targets.length === 0) return;

    let cancelled = false;
    const start = async () => {
      const { default: liquidGL } = await import("liquid-gl");
      if (cancelled) return;
      targets.forEach((target) => {
        target.dataset.liquidReady = "true";
      });
      liquidGL({
        target: ".liquid-gl-pane[data-liquid-ready='true']",
        snapshot: "body",
        resolution: Math.min(window.devicePixelRatio, 1.5),
        refraction: 0.012,
        aberration: 0.006,
        bevelDepth: 0.075,
        bevelWidth: 0.16,
        frost: 1.15,
        shadow: true,
        specular: true,
        reveal: "fade",
        tilt: false,
        magnify: 1,
      });
    };

    const idleWindow = window as typeof window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const idleId = idleWindow.requestIdleCallback?.(start, { timeout: 900 });
    const timerId =
      idleId === undefined ? window.setTimeout(start, 180) : undefined;
    return () => {
      cancelled = true;
      if (idleId !== undefined) idleWindow.cancelIdleCallback?.(idleId);
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, []);

  return null;
}
