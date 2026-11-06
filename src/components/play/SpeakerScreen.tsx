"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Screen } from "@/lib/flow";

type TalkDef = Extract<Screen, { type: "talk" }>;

/** Shown on phones while a speaker is presenting: their photo, or a mic if they don't have one. */
export function SpeakerScreen({ s, emoji }: { s: TalkDef; emoji: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="font-mono text-sm font-bold uppercase tracking-widest">👀 Look up at the big screen</div>

      {s.photo ? (
        <motion.div
          initial={{ scale: 0.6, rotate: -10, opacity: 0 }}
          animate={{ scale: 1, rotate: -2, opacity: 1 }}
          transition={{ type: "spring", damping: 12 }}
          className="relative mt-5 aspect-[1295/832] w-full overflow-hidden rounded-2xl border-4 border-ink bg-white shadow-hard-lg"
        >
          <Image src={s.photo} alt={s.speaker} fill sizes="(max-width: 448px) 100vw, 448px" className="object-cover" priority />
        </motion.div>
      ) : (
        <div className="relative mt-6">
          <motion.div
            animate={{ rotate: [-8, 8, -8] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="grid h-36 w-36 place-items-center rounded-full border-4 border-ink bg-paper text-8xl shadow-hard"
          >
            🎤
          </motion.div>
          <span className="absolute -bottom-2 -right-3 grid h-14 w-14 place-items-center rounded-full border-[3px] border-ink bg-gold text-3xl">{emoji}</span>
        </div>
      )}

      <h1 className="mt-6 text-[2.4rem] font-extrabold leading-[0.95] tracking-tight">
        <span className="text-pen">{s.speaker}</span> is up
      </h1>
      <p className="mt-1 text-lg font-bold">talking about {s.topic}</p>

      <motion.p
        initial={{ rotate: -3, scale: 0.9, opacity: 0 }}
        animate={{ rotate: -2, scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
        className="mt-6 rounded-2xl border-[3px] border-ink bg-ink px-5 py-4 font-marker text-2xl leading-snug text-gold shadow-hard-sm"
      >
        Pay attention if you don&apos;t wanna go bald.
      </motion.p>
    </div>
  );
}
