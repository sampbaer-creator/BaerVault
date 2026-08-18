"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

type AnimatedNumberProps = {
  value: number;
  format: (value: number) => string;
};

export function AnimatedNumber({ value, format }: AnimatedNumberProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const current = useRef(0);
  const formatRef = useRef(format);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    formatRef.current = format;
  }, [format]);

  useEffect(() => {
    if (reduceMotion) {
      current.current = value;
      if (elementRef.current) elementRef.current.textContent = formatRef.current(value);
      return;
    }

    const playback = animate(current.current, value, {
      duration: 0.8,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: (latest) => {
        current.current = latest;
        if (elementRef.current) elementRef.current.textContent = formatRef.current(latest);
      },
    });
    return () => playback.stop();
  }, [reduceMotion, value]);

  return <span ref={elementRef}>{format(value)}</span>;
}
