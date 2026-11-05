"use client";

import { motion } from "framer-motion";
import type { Screen } from "@/lib/flow";

type TalkDef = Extract<Screen, { type: "talk" }>;

/** Shown on phones while a speaker's slides are up. */
export function SpeakerScreen({ s, emoji }: { s: TalkDef; emoji: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="relative">
        <motion.div
          animate={{ rotate: [-8, 8, -8] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="grid h-36 w-36 place-items-center rounded-full border-4 border-ink bg-paper text-8xl shadow-hard"
        >
          {s.alert ? "🚨" : "🎤"}
        </motion.div>
        <span className="absolute -bottom-2 -right-3 grid h-14 w-14 place-items-center rounded-full border-[3px] border-ink bg-gold text-3xl">{emoji}</span>
      </div>

      <div className="mt-8 font-mono text-sm font-bold uppercase tracking-widest">👀 Look up at the big screen</div>
      <h1 className="mt-2 text-[2.6rem] font-extrabold leading-[0.95] tracking-tight">
        <span className="text-pen">{s.speaker}</span> is speaking
      </h1>
      <p className="mt-2 text-xl font-bold">about {s.alert ? "the stress test you're about to take" : s.topic}</p>

      <motion.p
        initial={{ rotate: -3, scale: 0.9, opacity: 0 }}
        animate={{ rotate: -2, scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
        className="mt-8 rounded-2xl border-[3px] border-ink bg-ink px-5 py-4 font-marker text-2xl leading-snug text-gold shadow-hard-sm"
      >
        {s.alert ? "Find your pulse now: wrist, just below the thumb." : "Pay attention if you don't wanna go bald."}
      </motion.p>

      {s.of > 1 && <div className="mt-6 font-mono text-xs font-bold uppercase opacity-60">slide {s.part} of {s.of}</div>}
    </div>
  );
}
