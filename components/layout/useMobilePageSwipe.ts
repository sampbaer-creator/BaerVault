"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

const routeOrder = [
  "/cash-flow",
  "/accounts",
  "/investments",
  "/transactions",
  "/dashboard",
  "/budget",
  "/goals",
  "/household",
];

const AXIS_LOCK_DISTANCE = 10;
const EDGE_GESTURE_WIDTH = 24;
const MIN_COMMIT_DISTANCE = 48;
const COMMIT_VELOCITY = 650;

type Point = { x: number; y: number; time: number };

function isGestureControl(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(
    target.closest("input,textarea,select,button,a,[role='slider'],[data-page-swipe-ignore]"),
  );
}

export function useMobilePageSwipe(pathname: string, demo = false) {
  const router = useRouter();
  const start = useRef<Point | null>(null);
  const last = useRef<Point | null>(null);
  const axis = useRef<"horizontal" | "vertical" | null>(null);
  const normalized = demo ? (pathname === "/demo" ? "/dashboard" : pathname.slice(5)) : pathname;

  function routeForDelta(dx: number) {
    const currentIndex = routeOrder.indexOf(normalized);
    if (currentIndex < 0 || dx === 0) return null;
    const route = routeOrder[dx < 0 ? currentIndex + 1 : currentIndex - 1];
    if (!route) return null;
    return demo ? (route === "/dashboard" ? "/demo" : `/demo${route}`) : route;
  }

  function reset() {
    start.current = null;
    last.current = null;
    axis.current = null;
  }

  function onPointerDown(event: React.PointerEvent<HTMLElement>) {
    if (
      event.pointerType === "mouse" ||
      !window.matchMedia("(max-width: 47.999rem)").matches ||
      event.clientX <= EDGE_GESTURE_WIDTH ||
      event.clientX >= window.innerWidth - EDGE_GESTURE_WIDTH ||
      isGestureControl(event.target)
    ) return;

    const point = { x: event.clientX, y: event.clientY, time: performance.now() };
    start.current = point;
    last.current = point;
    axis.current = null;
  }

  function onPointerMove(event: React.PointerEvent<HTMLElement>) {
    const origin = start.current;
    if (!origin) return;
    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    if (!axis.current && Math.max(Math.abs(dx), Math.abs(dy)) >= AXIS_LOCK_DISTANCE) {
      axis.current = Math.abs(dx) > Math.abs(dy) * 1.2 ? "horizontal" : "vertical";
    }
    if (axis.current === "horizontal") {
      last.current = { x: event.clientX, y: event.clientY, time: performance.now() };
    }
  }

  function onPointerUp(event: React.PointerEvent<HTMLElement>) {
    const origin = start.current;
    const sample = last.current ?? origin;
    if (!origin || !sample || axis.current !== "horizontal") {
      reset();
      return;
    }

    const dx = event.clientX - origin.x;
    const elapsed = Math.max(performance.now() - sample.time, 1);
    const velocity = ((event.clientX - sample.x) / elapsed) * 1000;
    const distanceThreshold = Math.min(window.innerWidth * 0.22, 80);
    const next = routeForDelta(dx);
    const shouldNavigate = next && (
      Math.abs(dx) >= distanceThreshold ||
      (Math.abs(dx) >= MIN_COMMIT_DISTANCE && Math.abs(velocity) >= COMMIT_VELOCITY)
    );

    reset();
    if (shouldNavigate) router.push(next);
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: reset,
  };
}
