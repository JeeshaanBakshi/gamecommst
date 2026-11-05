"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cx } from "../ui";

export interface Bar {
  label: string;
  emoji: string;
  count: number;
  highlight?: boolean;
}

interface Props {
  bars: Bar[];
  total: number;
  revealed: boolean;
  height?: number;
}

/** Live vote bars: grow with a springy bounce as each vote lands. */
export function BarChart({ bars, total, revealed, height = 560 }: Props) {
  const max = Math.max(1, ...bars.map((b) => b.count));
  return (
    <div className="flex h-full items-end justify-around gap-8 px-10">
      {bars.map((b, i) => {
        const pct = total ? Math.round((b.count / total) * 100) : 0;
        const red = revealed && b.highlight;
        return (
          <div key={b.label} className="flex flex-1 flex-col items-center">
            <div className="relative flex w-full flex-col items-center justify-end" style={{ height }}>
              <div className="mb-2 flex items-baseline gap-2">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={b.count}
                    initial={{ scale: 1.6, y: -10, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    className="text-6xl font-extrabold tabular-nums"
                  >
                    {b.count}
                  </motion.span>
                </AnimatePresence>
                <span className="font-mono text-2xl font-bold opacity-60">{pct}%</span>
              </div>
              <motion.div
                className={cx(
                  "relative w-full max-w-[220px] rounded-t-2xl border-4 border-b-0 border-ink",
                  red ? "bg-pen" : "bg-ink",
                )}
                initial={{ height: 8 }}
                animate={{ height: Math.max(8, (b.count / max) * (height - 90)) }}
                transition={{ type: "spring", stiffness: 140, damping: 14, delay: i * 0.03 }}
              >
                <div className="absolute inset-x-3 top-3 h-3 rounded-full bg-white/15" />
              </motion.div>
            </div>
            <div className="w-full max-w-[260px] border-t-4 border-ink pt-3 text-center">
              <div className="text-6xl leading-none">{b.emoji}</div>
              <div className={cx("mt-2 text-3xl font-extrabold", red && "text-pen")}>{b.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
