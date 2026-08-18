"use client";

import { animate, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { navigateMobileRoute } from "./mobileRouteTransition";

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

const AXIS_LOCK_DISTANCE = 9;
const MIN_COMMIT_DISTANCE = 26;
const COMMIT_VELOCITY = 560;

type Point = { x: number; y: number; time: number };

function isGestureControl(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(
    target.closest("input,textarea,select,button,a,[role='slider'],[data-page-swipe-ignore]"),
  );
}

export function useMobilePageSwipe(pathname: string, demo = false) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const dragX = useMotionValue(0);
  const transform = useMotionTemplate`translate3d(${dragX}px, 0, 0)`;
  const start = useRef<Point | null>(null);
  const sample = useRef<Point | null>(null);
  const axis = useRef<"horizontal" | "vertical" | null>(null);
  const committed = useRef(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const normalized = demo ? (pathname === "/demo" ? "/dashboard" : pathname.slice(5)) : pathname;

  const routeAt = useCallback((index: number) => {
    const route = routeOrder[index];
    if (!route) return null;
    if (!demo) return route;
    return route === "/dashboard" ? "/demo" : `/demo${route}`;
  }, [demo]);

  const routeForDelta = useCallback((dx: number) => {
    const index = routeOrder.indexOf(normalized);
    if (index < 0 || dx === 0) return null;
    return routeAt(dx < 0 ? index + 1 : index - 1);
  }, [normalized, routeAt]);

  const adjacentRoutes = useCallback(() => {
    const index = routeOrder.indexOf(normalized);
    if (index < 0) return [];
    return [routeAt(index - 1), routeAt(index + 1)].filter((route): route is string => Boolean(route));
  }, [normalized, routeAt]);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 47.999rem)").matches) return;
    adjacentRoutes().forEach((route) => router.prefetch(route));
  }, [adjacentRoutes, router]);

  useEffect(() => {
    dragX.set(0);
    committed.current = false;
    start.current = null;
    sample.current = null;
    axis.current = null;
  }, [dragX, pathname]);

  function settle() {
    if (reduceMotion) {
      dragX.set(0);
      return;
    }
    animate(dragX, 0, { type: "spring", duration: 0.5, bounce: 0.2 });
  }

  function finishGesture() {
    start.current = null;
    sample.current = null;
    axis.current = null;
    document.documentElement.removeAttribute("data-swipe-dragging");
  }

  function navigate(next: string, nextDirection: "left" | "right") {
    if (committed.current) return;
    committed.current = true;
    router.prefetch(next);
    finishGesture();
    dragX.set(0);
    setDirection(nextDirection);

    navigateMobileRoute(router, next, nextDirection, Boolean(reduceMotion));

    window.setTimeout(() => {
      setDirection(null);
    }, 220);
  }

  function onPointerDown(event: React.PointerEvent<HTMLElement>) {
    if (
      event.pointerType === "mouse" ||
      !window.matchMedia("(max-width: 47.999rem)").matches ||
      isGestureControl(event.target)
    ) return;

    const point = { x: event.clientX, y: event.clientY, time: performance.now() };
    committed.current = false;
    start.current = point;
    sample.current = point;
    axis.current = null;
    adjacentRoutes().forEach((route) => router.prefetch(route));
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLElement>) {
    const origin = start.current;
    if (!origin || committed.current) return;

    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    if (!axis.current && Math.max(Math.abs(dx), Math.abs(dy)) >= AXIS_LOCK_DISTANCE) {
      axis.current = Math.abs(dx) > Math.abs(dy) * 1.18 ? "horizontal" : "vertical";
    }
    if (axis.current !== "horizontal") return;

    const next = routeForDelta(dx);
    const resistedDx = next ? dx * 0.82 : dx * 0.12;
    dragX.set(resistedDx);
    document.documentElement.dataset.swipeDragging = "true";
    if (next) router.prefetch(next);

    const now = performance.now();
    const previous = sample.current ?? origin;
    const elapsed = Math.max(now - previous.time, 1);
    const velocity = ((event.clientX - previous.x) / elapsed) * 1000;
    sample.current = { x: event.clientX, y: event.clientY, time: now };

    const distanceThreshold = Math.min(window.innerWidth * 0.2, 78);
    const projectedDistance = Math.abs(dx + velocity * 0.12);
    if (
      next &&
      (Math.abs(dx) >= distanceThreshold ||
        (Math.abs(dx) >= MIN_COMMIT_DISTANCE && Math.abs(velocity) >= COMMIT_VELOCITY && projectedDistance >= distanceThreshold))
    ) {
      navigate(next, dx < 0 ? "left" : "right");
    }
  }

  function onPointerUp(event: React.PointerEvent<HTMLElement>) {
    const origin = start.current;
    if (!origin || committed.current) {
      finishGesture();
      return;
    }

    const dx = event.clientX - origin.x;
    const next = axis.current === "horizontal" ? routeForDelta(dx) : null;
    const last = sample.current ?? origin;
    const velocity = ((event.clientX - last.x) / Math.max(performance.now() - last.time, 1)) * 1000;
    const distanceThreshold = Math.min(window.innerWidth * 0.2, 78);
    const shouldCommit = next && (
      Math.abs(dx) >= distanceThreshold ||
      (Math.abs(dx) >= MIN_COMMIT_DISTANCE && Math.abs(velocity) >= COMMIT_VELOCITY)
    );

    finishGesture();
    if (shouldCommit) navigate(next, dx < 0 ? "left" : "right");
    else settle();
  }

  function onPointerCancel() {
    finishGesture();
    settle();
  }

  return {
    direction,
    motionStyle: { transform },
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  };
}
