"use client";

import { motion } from "framer-motion";

export function AnsweredMeter({ answered, total, locked, label = "answered", compact }: { answered: number; total: number; locked: boolean; label?: string; compact?: boolean }) {
  const p = total ? Math.min(1, answered / total) : 0;
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className={`${compact ? "text-[72px]" : "text-[120px]"} font-extrabold leading-none tabular-nums`}>{answered}</span>
        <span className="font-mono text-3xl font-bold">/ {total} {label}</span>
      </div>
      <div className="mt-3 h-8 overflow-hidden rounded-full border-4 border-ink bg-paper">
        <motion.div className="h-full bg-ink" animate={{ width: `${p * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
      </div>
      <div className="mt-3 font-mono text-2xl font-bold uppercase tracking-widest">
        {locked ? "🔒 Answers locked" : <span className="animate-blink">● Voting open</span>}
      </div>
    </div>
  );
}
