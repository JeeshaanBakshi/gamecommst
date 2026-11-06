"use client";

import { motion } from "framer-motion";
import type { Screen } from "@/lib/flow";
import { Card, Scribble } from "../../ui";

type TalkDef = Extract<Screen, { type: "talk" }>;

/** A speaker's slide. Phones show "<speaker> is speaking" while this is up. */
export function TalkScreen({ s }: { s: TalkDef }) {
  return (
    <div className="absolute inset-0 flex gap-14 px-24 pb-24 pt-[150px]">
      <div className="min-w-0 flex-1">
        <motion.div initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", damping: 15 }} className="flex items-end gap-6">
          <span className="text-outline text-[150px] font-extrabold leading-[0.8]">{s.num}</span>
          {s.of > 1 && <span className="mb-3 font-mono text-3xl font-bold uppercase tracking-widest opacity-70">slide {s.part}/{s.of}</span>}
        </motion.div>
        <motion.h1
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.08, type: "spring", damping: 15 }}
          className="mt-6 text-[112px] font-extrabold leading-[0.9] tracking-tight"
        >
          {s.title}
        </motion.h1>

        <ul className="mt-12 space-y-7">
          {s.bullets.map((b, i) => (
            <motion.li
              key={b}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.18, type: "spring", damping: 16 }}
              className="flex items-start gap-6 text-[46px] font-bold leading-[1.15]"
            >
              <span className="mt-2 grid h-12 w-12 shrink-0 place-items-center rounded-lg border-4 border-ink bg-paper font-marker text-3xl text-pen">✓</span>
              <span>{b}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <motion.div
        initial={{ rotate: 10, scale: 0.7, opacity: 0 }}
        animate={{ rotate: 3, scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", damping: 12 }}
        className="flex w-[480px] shrink-0 flex-col items-center justify-center"
      >
        <div className="animate-bob text-[220px] leading-none">{s.emoji}</div>
        <Card className="mt-10 w-full px-8 py-6 text-center">
          <div className="font-mono text-xl font-bold uppercase tracking-widest">🎤 Now speaking</div>
          <div className="mt-1 font-marker text-6xl text-pen">{s.speaker}</div>
          <Scribble className="mt-1" delay={0.6} />
        </Card>
      </motion.div>
    </div>
  );
}
