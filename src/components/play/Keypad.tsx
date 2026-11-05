"use client";

import { motion } from "framer-motion";
import { buzz } from "./Answering";

/** Big custom number pad — avoids the iOS keyboard covering half the screen. */
export function Keypad({ value, onChange, onSubmit, maxLen = 3, submitLabel = "✓" }: { value: string; onChange: (v: string) => void; onSubmit: () => void; maxLen?: number; submitLabel?: string }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "ok"];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {keys.map((k) => (
        <motion.button
          key={k}
          whileTap={{ scale: 0.88 }}
          transition={{ type: "spring", stiffness: 700, damping: 20 }}
          onClick={() => {
            buzz();
            if (k === "⌫") onChange(value.slice(0, -1));
            else if (k === "ok") onSubmit();
            else if (value.length < maxLen) onChange(value + k);
          }}
          className={`h-16 rounded-2xl border-[3px] border-ink text-3xl font-extrabold shadow-hard-sm active:shadow-none ${
            k === "ok" ? "bg-ink text-gold" : "bg-paper"
          }`}
        >
          {k === "ok" ? submitLabel : k}
        </motion.button>
      ))}
    </div>
  );
}
