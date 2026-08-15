"use client";

import {
  motion,
  type PanInfo,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type ToggleSize = "sm" | "md" | "lg";
export type ToggleColorTheme =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "purple"
  | "cyan";

interface LiquidGlassProps {
  isActive: boolean;
  darkMode: boolean;
  isPressed: boolean;
}

function AnimatedLiquidGlass({
  isActive,
  darkMode,
  isPressed,
}: LiquidGlassProps) {
  const shadowColor = darkMode
    ? "rgba(0, 0, 0, 0.3)"
    : "rgba(0, 0, 0, 0.15)";
  const highlightColor = darkMode
    ? "rgba(255,255,255,0.3)"
    : "rgba(255,255,255,0.5)";

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-full"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(12px) saturate(100%) brightness(1.02)",
        WebkitBackdropFilter: "blur(12px) saturate(100%) brightness(1.02)",
        boxShadow: isPressed
          ? `0 4px 8px ${shadowColor}, 0 0 0 1px rgba(255,255,255,0.2)`
          : `0 2px 4px ${shadowColor}`,
        transition: "box-shadow 0.1s ease-out",
      }}
    >
      <div
        className="absolute top-0 left-0 h-1/2 w-full rounded-t-full"
        style={{
          background: `linear-gradient(145deg, ${highlightColor} 0%, transparent 60%)`,
        }}
      />
      <motion.div
        className="pointer-events-none absolute top-0 left-0 h-full w-full rounded-full"
        initial={false}
        animate={{
          background: isActive
            ? "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)"
            : "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
          x: isActive ? ["0%", "100%"] : ["100%", "0%"],
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{ opacity: 0.6 }}
      />
      <div
        className="absolute bottom-0 left-0 h-1/4 w-full rounded-b-full"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.05) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}

const sizeConfig = {
  sm: {
    trackWidth: 51,
    trackHeight: 31,
    knobWidth: 27,
    knobMargin: 2,
    indicatorWidth: 2,
    indicatorHeight: 9,
    indicatorOffset: 11,
    circleSize: 7,
  },
  md: {
    trackWidth: 60,
    trackHeight: 33,
    knobWidth: 35,
    knobMargin: 2.5,
    indicatorWidth: 2,
    indicatorHeight: 10,
    indicatorOffset: 12,
    circleSize: 8,
  },
  lg: {
    trackWidth: 80,
    trackHeight: 36,
    knobWidth: 47,
    knobMargin: 3,
    indicatorWidth: 2,
    indicatorHeight: 13,
    indicatorOffset: 15.5,
    circleSize: 10.5,
  },
} as const;

const colorThemes = {
  default: {
    light: { active: "#26BF4D", inactive: "hsl(0, 0%, 90%)" },
    dark: { active: "#26BF4D", inactive: "hsl(0, 0%, 25%)" },
  },
  success: {
    light: { active: "hsl(142, 76%, 36%)", inactive: "hsl(0, 0%, 90%)" },
    dark: { active: "hsl(142, 76%, 30%)", inactive: "hsl(0, 0%, 25%)" },
  },
  warning: {
    light: { active: "hsl(38, 92%, 50%)", inactive: "hsl(0, 0%, 90%)" },
    dark: { active: "hsl(38, 92%, 45%)", inactive: "hsl(0, 0%, 25%)" },
  },
  danger: {
    light: { active: "hsl(0, 84%, 60%)", inactive: "hsl(0, 0%, 90%)" },
    dark: { active: "hsl(0, 84%, 50%)", inactive: "hsl(0, 0%, 25%)" },
  },
  purple: {
    light: { active: "hsl(271, 91%, 65%)", inactive: "hsl(0, 0%, 90%)" },
    dark: { active: "hsl(271, 91%, 55%)", inactive: "hsl(0, 0%, 25%)" },
  },
  cyan: {
    light: { active: "hsl(187, 85%, 53%)", inactive: "hsl(0, 0%, 90%)" },
    dark: { active: "hsl(187, 85%, 43%)", inactive: "hsl(0, 0%, 25%)" },
  },
} as const;

const VELOCITY_THRESHOLD = 200;
const noop = () => {};

export interface ToggleSwitchProps {
  className?: string;
  isActive?: boolean;
  onChange?: (isActive: boolean) => void;
  darkMode?: boolean;
  glassEffect?: boolean;
  size?: ToggleSize;
  colorTheme?: ToggleColorTheme;
  label?: string;
  reduceMotion?: boolean;
}

export default function ToggleSwitch({
  className,
  isActive: controlledIsActive,
  onChange = noop,
  darkMode,
  glassEffect = true,
  size = "md",
  colorTheme = "default",
  label = "Toggle setting",
  reduceMotion = false,
}: ToggleSwitchProps) {
  const [uncontrolledIsActive, setUncontrolledIsActive] = useState(false);
  const isActive = controlledIsActive ?? uncontrolledIsActive;
  const [isDragging, setIsDragging] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showSweep, setShowSweep] = useState(false);
  const [sweepDirection, setSweepDirection] = useState<"left" | "right">(
    "right",
  );
  const [detectedDarkMode, setDetectedDarkMode] = useState(false);
  const velocityRef = useRef(0);
  const sweepTimeoutRef = useRef<number | undefined>(undefined);
  const dragTimeoutRef = useRef<number | undefined>(undefined);
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = Boolean(prefersReducedMotion || reduceMotion);
  const resolvedDarkMode = darkMode ?? detectedDarkMode;

  const {
    trackWidth,
    trackHeight,
    knobWidth,
    knobMargin,
    indicatorWidth,
    indicatorHeight,
    indicatorOffset,
    circleSize,
  } = sizeConfig[size];
  const travel = trackWidth - knobWidth - knobMargin * 2;
  const motionX = useMotionValue(isActive ? travel : 0);
  const springX = useSpring(motionX, {
    stiffness: 750,
    damping: 38,
    mass: 0.6,
  });
  const renderedX = shouldReduceMotion ? motionX : springX;

  useEffect(() => {
    motionX.set(isActive ? travel : 0);
  }, [isActive, motionX, travel]);

  useEffect(() => {
    if (darkMode !== undefined) return;

    const root = document.documentElement;
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const syncDarkMode = () => {
      setDetectedDarkMode(
        root.dataset.theme === "dark" ||
          (root.dataset.theme === undefined && colorScheme.matches),
      );
    };
    const observer = new MutationObserver(syncDarkMode);

    syncDarkMode();
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    colorScheme.addEventListener("change", syncDarkMode);

    return () => {
      observer.disconnect();
      colorScheme.removeEventListener("change", syncDarkMode);
    };
  }, [darkMode]);

  useEffect(
    () => () => {
      if (sweepTimeoutRef.current !== undefined) {
        window.clearTimeout(sweepTimeoutRef.current);
      }
      if (dragTimeoutRef.current !== undefined) {
        window.clearTimeout(dragTimeoutRef.current);
      }
    },
    [],
  );

  function getBackgroundColor() {
    const theme = colorThemes[colorTheme];
    const mode = resolvedDarkMode ? theme.dark : theme.light;
    return isActive ? mode.active : mode.inactive;
  }

  function triggerSweep(direction: "left" | "right") {
    if (shouldReduceMotion) return;
    setSweepDirection(direction);
    setShowSweep(true);
    if (sweepTimeoutRef.current !== undefined) {
      window.clearTimeout(sweepTimeoutRef.current);
    }
    sweepTimeoutRef.current = window.setTimeout(() => setShowSweep(false), 150);
  }

  function commitState(nextState: boolean) {
    if (controlledIsActive === undefined) setUncontrolledIsActive(nextState);
    motionX.set(nextState ? travel : 0);
    triggerSweep(nextState ? "right" : "left");
    onChange(nextState);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    setIsPressed(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleComponentClick() {
    if (!isDragging) commitState(!isActive);
  }

  function handleDragStart() {
    setIsDragging(true);
    velocityRef.current = 0;
  }

  function handleDrag(
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) {
    const currentX = motionX.get() + info.delta.x;
    motionX.set(Math.max(0, Math.min(currentX, travel)));
    velocityRef.current = info.velocity.x;
  }

  function handleDragEnd() {
    const velocity = velocityRef.current;
    const nextState =
      Math.abs(velocity) > VELOCITY_THRESHOLD
        ? velocity > 0
        : motionX.get() > travel / 2;

    if (nextState !== isActive) triggerSweep(nextState ? "right" : "left");
    if (controlledIsActive === undefined) setUncontrolledIsActive(nextState);
    motionX.set(nextState ? travel : 0);
    onChange(nextState);
    dragTimeoutRef.current = window.setTimeout(() => setIsDragging(false), 10);
  }

  const pressTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.1, ease: [0.25, 0.1, 0.25, 1] as const };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      aria-label={label}
      className={cn(
        "relative cursor-pointer touch-none overflow-visible !border-0 !bg-transparent !p-0 !shadow-none before:!hidden hover:!border-0 hover:!bg-transparent hover:!shadow-none hover:!filter-none active:!scale-100",
        className,
      )}
      style={{ width: Math.max(44, trackWidth), height: Math.max(44, trackHeight) }}
      onClick={handleComponentClick}
      onPointerDown={handlePointerDown}
      onPointerUp={() => setIsPressed(false)}
      onPointerCancel={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      data-name={isActive ? "Toggle-On" : "Toggle-Off"}
    >
      <motion.span
        className="absolute z-0 block rounded-full"
        style={{
          width: trackWidth,
          height: trackHeight,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          backgroundColor: getBackgroundColor(),
          boxShadow: isPressed
            ? "0 0 0 2px rgba(0,0,0,0.08)"
            : "0 0 0 0px rgba(0,0,0,0)",
        }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.2, ease: "easeOut" }
        }
        data-name="Track"
      >
        {glassEffect ? (
          <span
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ boxShadow: "inset 0 1px 2px rgba(255,255,255,0.15)" }}
          />
        ) : null}

        <motion.span
          className="pointer-events-none absolute flex items-center justify-center"
          style={{
            left: indicatorOffset,
            top: "50%",
            transform: "translateY(-50%)",
            width: indicatorWidth,
            height: indicatorHeight,
          }}
          animate={{ opacity: isActive ? 1 : 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
        >
          <span className="h-full w-full rounded-full bg-white" />
        </motion.span>

        <motion.span
          className="pointer-events-none absolute flex items-center justify-center"
          style={{
            right: indicatorOffset,
            top: "50%",
            transform: "translateY(-50%)",
            width: circleSize,
            height: circleSize,
          }}
          animate={{ opacity: isActive ? 0 : 0.5 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
        >
          <span
            className="rounded-full"
            style={{
              width: circleSize,
              height: circleSize,
              border: `${Math.max(1.5, circleSize * 0.15)}px solid`,
              borderColor: resolvedDarkMode
                ? "rgba(255,255,255,0.5)"
                : "rgba(0,0,0,0.3)",
            }}
          />
        </motion.span>

        {showSweep && !shouldReduceMotion ? (
          <motion.span
            className="pointer-events-none absolute rounded-full"
            style={{
              height: 2,
              top: "50%",
              marginTop: -1,
              background: "rgba(255,255,255,0.5)",
            }}
            initial={{
              width: "0%",
              left: sweepDirection === "right" ? "10%" : "90%",
              opacity: 0,
            }}
            animate={{ width: "80%", left: "10%", opacity: [0, 0.7, 0] }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          />
        ) : null}
      </motion.span>

      <motion.span
        className="absolute z-20 cursor-grab rounded-full active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: travel }}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{
          x: renderedX,
          width: knobWidth,
          height: trackHeight - knobMargin * 2,
          top: (Math.max(44, trackHeight) - trackHeight) / 2 + knobMargin,
          left: (Math.max(44, trackWidth) - trackWidth) / 2 + knobMargin,
          overflow: "visible",
        }}
        animate={{
          scale: isDragging ? 1.25 : 1,
          boxShadow: isDragging
            ? "0 12px 40px -8px rgba(0, 0, 0, 0.35), 0 6px 16px -4px rgba(0, 0, 0, 0.2)"
            : "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
        transition={pressTransition}
        data-name="Knob"
      >
        <motion.span
          className="relative block h-full w-full overflow-hidden rounded-full"
          animate={{
            backgroundColor: isDragging
              ? "rgba(255, 255, 255, 0.08)"
              : "#FAFAFA",
          }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.15, ease: "easeOut" }}
          style={{
            backdropFilter: isDragging
              ? "blur(32px) brightness(1.1)"
              : "blur(0px)",
            WebkitBackdropFilter: isDragging
              ? "blur(32px) brightness(1.1)"
              : "blur(0px)",
            boxShadow: isDragging
              ? "0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 0.5px rgba(255, 255, 255, 0.25), inset 0 0 20px rgba(255, 255, 255, 0.12), inset 0 -2px 8px rgba(0, 0, 0, 0.1), inset 0 2px 8px rgba(255, 255,255,0.3)"
              : "0 4px 12px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1), inset 0 -4px 8px rgba(0, 0, 0, 0.06)",
          }}
        >
          <span
            className="pointer-events-none absolute top-0 left-[10%] h-[45%] w-[80%] rounded-t-full"
            style={{
              background: isDragging
                ? "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)"
                : "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.6) 40%, transparent 100%)",
            }}
          />
          <span
            className="pointer-events-none absolute top-[5%] left-[15%] h-[25%] w-[70%] rounded-full"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, transparent 100%)",
              filter: "blur(2px)",
            }}
          />
          <span
            className="pointer-events-none absolute bottom-0 left-0 h-[40%] w-full rounded-b-full"
            style={{
              background: isDragging
                ? "linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 100%)"
                : "linear-gradient(to top, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.04) 50%, transparent 100%)",
            }}
          />
        </motion.span>

        {glassEffect ? (
          <span className="pointer-events-none absolute inset-0">
            <AnimatedLiquidGlass
              isActive={isActive}
              darkMode={resolvedDarkMode}
              isPressed={isPressed || isDragging}
            />
          </span>
        ) : null}

        <motion.span
          className="pointer-events-none absolute inset-0 rounded-full"
          animate={{ opacity: isDragging ? 1 : 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.1 }}
          style={{
            border: "1px solid rgba(255, 255, 255, 0.35)",
            boxShadow:
              "inset 0 0 12px -2px rgba(255, 255, 255, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.4)",
          }}
        />
      </motion.span>
    </button>
  );
}
