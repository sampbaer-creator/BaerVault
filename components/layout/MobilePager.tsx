"use client";

import { animate, motion, type MotionValue, useMotionValue, useReducedMotion } from "motion/react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { mobileRouteOrder } from "./navigation";
import type { MobileShellData } from "@/lib/mobileShell";
import { MOBILE_SHELL_INVALIDATE_EVENT } from "@/lib/mobileShell";
import styles from "./AppShell.module.css";

const loaders = {
  "/cash-flow": () => import("@/features/cash-flow/CashFlowWorkspace").then((m) => ({ default: m.CashFlowWorkspace })),
  "/accounts": () => import("@/features/accounts/AccountsWorkspace").then((m) => ({ default: m.AccountsWorkspace })),
  "/investments": () => import("@/features/investments/InvestmentsWorkspace").then((m) => ({ default: m.InvestmentsWorkspace })),
  "/transactions": () => import("@/features/transactions/TransactionsWorkspace").then((m) => ({ default: m.TransactionsWorkspace })),
  "/dashboard": () => import("@/features/dashboard/DashboardOverview").then((m) => ({ default: m.DashboardOverview })),
  "/budget": () => import("@/features/budget/BudgetWorkspace").then((m) => ({ default: m.BudgetWorkspace })),
  "/goals": () => import("@/features/goals/GoalsWorkspace").then((m) => ({ default: m.GoalsWorkspace })),
} as const;

const CashFlowScreen = lazy(loaders["/cash-flow"]);
const AccountsScreen = lazy(loaders["/accounts"]);
const InvestmentsScreen = lazy(loaders["/investments"]);
const TransactionsScreen = lazy(loaders["/transactions"]);
const DashboardScreen = lazy(loaders["/dashboard"]);
const BudgetScreen = lazy(loaders["/budget"]);
const GoalsScreen = lazy(loaders["/goals"]);

function preloadRoute(route: string | undefined) {
  const loader = route ? loaders[route as keyof typeof loaders] : undefined;
  return loader ? loader() : Promise.resolve(null);
}

const AXIS_LOCK = 10;
const EDGE_WIDTH = 24;

function blocksPageSwipe(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest("input,textarea,select,button,a,[role='slider'],[data-page-swipe-ignore]"));
}

function Screen({ route, data }: { route: string; data: MobileShellData }) {
  if (route === "/cash-flow") return <CashFlowScreen month={data.currentMonth} />;
  if (route === "/accounts") return <AccountsScreen initialAccounts={data.financialAccounts} />;
  if (route === "/investments") return <InvestmentsScreen initialAccounts={data.investmentAccounts} />;
  if (route === "/transactions") return <TransactionsScreen initialMonth={data.currentMonth} />;
  if (route === "/dashboard") return <DashboardScreen model={data.dashboard} />;
  if (route === "/budget") return <BudgetScreen initialBudget={data.selectedBudget} accounts={data.financialAccounts.map(({ id, name, institution, type }) => ({ id, name, institution, type }))} />;
  return <GoalsScreen initialGoals={data.goals} />;
}

type Gesture = { pointerId: number; startX: number; startY: number; lastX: number; lastTime: number; velocity: number; axis: "x" | "y" | null };

export function MobilePager({ children, pathname, progress, onActiveIndex }: {
  children: React.ReactNode;
  pathname: string;
  progress: MotionValue<number>;
  onActiveIndex: (index: number, navigate: (href: string) => void, enabled: boolean) => void;
}) {
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const initialIndex = Math.max(0, mobileRouteOrder.indexOf(pathname));
  const activeRef = useRef(initialIndex);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [data, setData] = useState<MobileShellData | null>(null);
  const [revision, setRevision] = useState(0);
  const [mobile, setMobile] = useState(false);
  const requestRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    const query = new URLSearchParams();
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    if (year) query.set("year", year);
    if (month) query.set("month", month);
    try {
      const response = await fetch(`/api/mobile-shell?${query}`, { cache: "no-store", signal: controller.signal });
      const next = await response.json();
      if (!response.ok) throw new Error(next.error ?? "Could not load the mobile app shell.");
      const index = activeRef.current;
      await Promise.all([mobileRouteOrder[index - 1], mobileRouteOrder[index], mobileRouteOrder[index + 1]].map(preloadRoute));
      if (controller.signal.aborted) return;
      setData(next as MobileShellData);
      setRevision((value) => value + 1);
      window.setTimeout(() => { void Promise.all(Object.values(loaders).map((loader) => loader())); }, 0);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) console.error(error);
    }
  }, [searchParams]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 47.999rem)");
    const update = () => setMobile(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!mobile) return;
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [mobile, load]);
  useEffect(() => {
    const invalidate = () => { if (mobile) void load(); };
    window.addEventListener(MOBILE_SHELL_INVALIDATE_EVENT, invalidate);
    return () => window.removeEventListener(MOBILE_SHELL_INVALIDATE_EVENT, invalidate);
  }, [mobile, load]);

  const enabled = mobile && Boolean(data) && mobileRouteOrder.includes(pathname);
  const width = () => viewportRef.current?.clientWidth ?? window.innerWidth;

  const commit = useCallback((nextIndex: number, velocity = 0) => {
    const current = activeRef.current;
    const bounded = Math.max(0, Math.min(mobileRouteOrder.length - 1, nextIndex));
    if (bounded === current) {
      animate(x, -width(), reduceMotion ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.32, velocity });
      animate(progress, current, reduceMotion ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.32, velocity: -velocity / Math.max(width(), 1) });
      return;
    }
    const direction = bounded > current ? -1 : 1;
    const target = direction < 0 ? -2 * width() : 0;
    animate(x, target, reduceMotion ? { duration: 0 } : { type: "spring", bounce: 0.08, duration: 0.36, velocity }).then(() => {
      activeRef.current = bounded;
      setActiveIndex(bounded);
      x.set(-width());
      progress.set(bounded);
      window.history.replaceState(null, "", mobileRouteOrder[bounded]);
      document.getElementById("main-content")?.focus({ preventScroll: true });
    });
  }, [progress, reduceMotion, x]);

  const navigate = useCallback((href: string) => {
    const target = mobileRouteOrder.indexOf(href);
    if (target < 0 || target === activeRef.current) return;
    if (Math.abs(target - activeRef.current) === 1) commit(target);
    else {
      activeRef.current = target; setActiveIndex(target); x.set(-width()); progress.set(target);
      window.history.replaceState(null, "", href);
    }
  }, [commit, progress, x]);

  useEffect(() => { onActiveIndex(activeIndex, navigate, enabled); }, [activeIndex, enabled, navigate, onActiveIndex]);
  useEffect(() => {
    const index = mobileRouteOrder.indexOf(pathname);
    if (index >= 0 && index !== activeRef.current) { activeRef.current = index; setActiveIndex(index); progress.set(index); }
  }, [pathname, progress]);
  useEffect(() => {
    if (!enabled) return;
    const reset = () => x.set(-width());
    reset(); window.addEventListener("resize", reset);
    return () => window.removeEventListener("resize", reset);
  }, [enabled, x]);

  const routes = useMemo(() => [activeIndex - 1, activeIndex, activeIndex + 1].map((i) => mobileRouteOrder[i] ?? null), [activeIndex]);
  if (!enabled || !data) return <>{children}</>;

  function pointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" || event.clientX <= EDGE_WIDTH || event.clientX >= window.innerWidth - EDGE_WIDTH || blocksPageSwipe(event.target)) return;
    gesture.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastTime: performance.now(), velocity: 0, axis: null };
  }
  function pointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const state = gesture.current;
    if (!state || state.pointerId !== event.pointerId) return;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    if (!state.axis && Math.max(Math.abs(dx), Math.abs(dy)) >= AXIS_LOCK) state.axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? "x" : "y";
    if (state.axis !== "x") return;
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.setPointerCapture(event.pointerId);
    let offset = dx;
    if ((activeRef.current === 0 && dx > 0) || (activeRef.current === mobileRouteOrder.length - 1 && dx < 0)) offset = dx * 0.24;
    x.set(-width() + offset);
    progress.set(activeRef.current - offset / width());
    const time = performance.now();
    state.velocity = ((event.clientX - state.lastX) / Math.max(time - state.lastTime, 1)) * 1000;
    state.lastX = event.clientX; state.lastTime = time;
  }
  function pointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const state = gesture.current; gesture.current = null;
    if (!state || state.pointerId !== event.pointerId || state.axis !== "x") return;
    const dx = event.clientX - state.startX;
    const velocity = performance.now() - state.lastTime < 100 ? state.velocity : 0;
    const projected = dx + velocity * 0.18;
    const direction = projected < 0 ? 1 : -1;
    const shouldCommit = Math.abs(projected) > Math.min(width() * 0.22, 92);
    commit(activeRef.current + (shouldCommit ? direction : 0), velocity);
  }

  return <div className={styles.mobilePager} ref={viewportRef} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={() => { gesture.current = null; commit(activeRef.current); }}>
    <motion.div className={styles.mobilePagerTrack} style={{ x }}>
      {routes.map((route, slot) => <section key={route ?? `empty-${slot}`} className={styles.mobilePagerPanel} aria-hidden={slot !== 1} inert={slot !== 1} onScroll={(event) => { if (slot === 1) window.dispatchEvent(new CustomEvent("bearvault:mobile-scroll", { detail: event.currentTarget.scrollTop > 10 })); }}>
        {route ? <Suspense fallback={<div className={styles.mobilePagerLoading} aria-label="Loading screen" />}><Screen key={`${route}-${revision}`} route={route} data={data} /></Suspense> : null}
      </section>)}
    </motion.div>
  </div>;
}
