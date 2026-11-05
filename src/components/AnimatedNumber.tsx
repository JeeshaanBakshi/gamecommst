"use client";

import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

/** Counts up/down smoothly to `value`. */
export function AnimatedNumber({ value, decimals = 0, duration = 0.9, suffix = "" }: { value: number; decimals?: number; duration?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctrl = animate(from.current, value, {
      duration: reduce ? 0 : duration,
      ease: "easeOut",
      onUpdate: (v) => {
        el.textContent = v.toFixed(decimals) + suffix;
      },
    });
    from.current = value;
    return () => ctrl.stop();
  }, [value, decimals, duration, suffix, reduce]);

  return <span ref={ref}>{(0).toFixed(decimals) + suffix}</span>;
}
