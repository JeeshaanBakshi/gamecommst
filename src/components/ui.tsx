"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/** Chunky game-show button that squishes on tap. */
export function SquishButton({
  className,
  variant = "ink",
  children,
  ...rest
}: HTMLMotionProps<"button"> & { variant?: "ink" | "paper" | "pen" | "gold" }) {
  const styles = {
    ink: "bg-ink text-gold",
    paper: "bg-paper text-ink",
    pen: "bg-pen text-paper",
    gold: "bg-gold text-ink",
  }[variant];
  return (
    <motion.button
      whileTap={{ scale: 0.92, y: 3 }}
      transition={{ type: "spring", stiffness: 600, damping: 22 }}
      className={cx(
        "rounded-2xl border-[3px] border-ink font-extrabold shadow-hard disabled:opacity-40 active:shadow-hard-sm",
        styles,
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

export function Sticker({ children, className, tone = "ink" }: { children: ReactNode; className?: string; tone?: "ink" | "pen" | "paper" }) {
  const t = { ink: "bg-ink text-gold", pen: "bg-pen text-paper", paper: "bg-paper text-ink border-[3px] border-ink" }[tone];
  return <span className={cx("inline-block -rotate-2 rounded-md px-3 py-1 font-mono font-bold uppercase tracking-wider", t, className)}>{children}</span>;
}

/** Hand-drawn red pen loop that draws itself around its children. */
export function RedPenCircle({ children, show = true, className, delay = 0.2 }: { children: ReactNode; show?: boolean; className?: string; delay?: number }) {
  return (
    <span className={cx("relative inline-block", className)}>
      {children}
      {show && (
        <svg className="pointer-events-none absolute -inset-[18%] h-[136%] w-[136%] overflow-visible" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden>
          <motion.path
            d="M 30 18 C 80 2, 170 4, 188 40 C 200 72, 140 96, 90 94 C 40 92, 4 76, 10 46 C 14 26, 50 10, 110 8"
            fill="none"
            stroke="#e2342d"
            strokeWidth="5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay, ease: "easeInOut" }}
          />
        </svg>
      )}
    </span>
  );
}

export function Scribble({ className, delay = 0.3 }: { className?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 300 20" className={cx("h-4 w-full overflow-visible", className)} preserveAspectRatio="none" aria-hidden>
      <motion.path
        d="M2 12 C 60 4, 120 18, 180 9 S 260 6, 298 11"
        fill="none"
        stroke="#e2342d"
        strokeWidth="5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay }}
      />
    </svg>
  );
}

export function CautionTape({ className, label }: { className?: string; label?: string }) {
  return (
    <div className={cx("caution-tape flex items-center justify-center overflow-hidden border-y-4 border-ink", className)}>
      {label && <span className="bg-ink px-4 font-mono font-bold uppercase tracking-[0.3em] text-gold">{label}</span>}
    </div>
  );
}

export function Card({ children, className, dark }: { children: ReactNode; className?: string; dark?: boolean }) {
  return (
    <div className={cx("rounded-[28px] border-4 border-ink shadow-hard-lg transition-colors", dark ? "bg-ink text-gold" : "bg-paper", className)}>
      {children}
    </div>
  );
}

export function StatusDot({ status }: { status: "connecting" | "live" | "offline" }) {
  const c = { live: "bg-mint", connecting: "bg-gold-deep animate-blink", offline: "bg-pen animate-blink" }[status];
  return <span className={cx("inline-block h-3 w-3 rounded-full border-2 border-ink", c)} aria-label={status} />;
}

export const DISCLAIMER = "Just for fun. Stress causes temporary shedding; genetics is the main cause of permanent hair loss.";
