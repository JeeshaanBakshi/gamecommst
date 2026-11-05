"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { WAITING_LINES } from "@/lib/avatars";

export function Waiting({ emoji, title = "Waiting for host…", sub }: { emoji: string; title?: string; sub?: string }) {
  const [i, setI] = useState(() => Math.floor(Math.random() * WAITING_LINES.length));
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % WAITING_LINES.length), 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <motion.div
        animate={{ y: [0, -24, 0], rotate: [-6, 6, -6] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="grid h-36 w-36 place-items-center rounded-full border-4 border-ink bg-paper text-8xl shadow-hard"
      >
        {emoji}
      </motion.div>
      <h1 className="mt-8 text-4xl font-extrabold leading-none tracking-tight">{title}</h1>
      {sub && <p className="mt-2 font-mono text-sm font-bold uppercase">{sub}</p>}
      <div className="mt-8 h-24 w-full">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ y: 12, opacity: 0, rotate: -1 }}
            animate={{ y: 0, opacity: 1, rotate: -1 }}
            exit={{ y: -12, opacity: 0 }}
            className="font-marker text-2xl leading-snug text-pen"
          >
            {WAITING_LINES[i]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
