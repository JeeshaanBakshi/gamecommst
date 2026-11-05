"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PULSE_SECONDS } from "@/lib/flow";
import { avg } from "@/lib/scoring";
import type { AnswerIndex } from "@/lib/types";
import { AnimatedNumber } from "../../AnimatedNumber";
import { AnsweredMeter } from "../AnsweredMeter";
import { Card, Sticker } from "../../ui";

interface Props {
  round: "pulse_before" | "pulse_after";
  answers: AnswerIndex;
  playerCount: number;
  locked: boolean;
}

export function PulseScreen({ round, answers, playerCount, locked }: Props) {
  const reduce = useReducedMotion();
  const vals = Object.values(answers[round] ?? {}).map((a) => a.bpm ?? 0).filter(Boolean);
  const bpm = Math.round(avg(vals));
  const beat = 60 / Math.max(50, bpm || 70);
  const after = round === "pulse_after";

  return (
    <div className="absolute inset-0 flex items-center gap-16 px-20 pt-[100px]">
      <div className="flex-1">
        <Sticker tone="pen" className="text-3xl">
          {after ? "Round 2 · Post-math trauma" : "Round 1 · Resting (ish)"}
        </Sticker>
        <h1 className="mt-6 text-[110px] font-extrabold leading-[0.9] tracking-tight">
          {after ? "Check your pulse again." : "Find your pulse."}
        </h1>
        <ol className="mt-10 space-y-5 text-[44px] font-bold leading-tight">
          <li>
            <span className="mr-4 inline-grid h-16 w-16 place-items-center rounded-full bg-ink text-3xl text-gold">1</span>
            Two fingers on your wrist, just below your thumb
          </li>
          <li>
            <span className="mr-4 inline-grid h-16 w-16 place-items-center rounded-full bg-ink text-3xl text-gold">2</span>
            Tap start on your phone, count beats for {PULSE_SECONDS}s
          </li>
          <li>
            <span className="mr-4 inline-grid h-16 w-16 place-items-center rounded-full bg-ink text-3xl text-gold">3</span>
            Type your count. We do the ×4. You&apos;re welcome.
          </li>
        </ol>
        <div className="mt-12 w-[700px]">
          <AnsweredMeter answered={vals.length} total={Math.max(playerCount, vals.length)} locked={locked} label="measured" />
        </div>
      </div>

      <Card className="flex w-[640px] shrink-0 rotate-2 flex-col items-center p-10">
        <motion.svg
          viewBox="0 0 100 90"
          className="w-[380px]"
          animate={reduce ? undefined : { scale: [1, 1.14, 0.98, 1.06, 1] }}
          transition={{ duration: beat, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M50 86 C 18 64, 2 44, 6 24 C 10 6, 34 0, 50 18 C 66 0, 90 6, 94 24 C 98 44, 82 64, 50 86 Z"
            fill="#e2342d"
            stroke="#111"
            strokeWidth="4"
          />
          <path d="M22 26 q 4 -10 14 -8" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
        </motion.svg>
        <div className="mt-6 font-mono text-3xl font-bold uppercase">Room average</div>
        <div className="text-[150px] font-extrabold leading-none tabular-nums">
          {bpm ? <AnimatedNumber value={bpm} /> : "—"}
          <span className="ml-3 text-5xl">BPM</span>
        </div>
      </Card>
    </div>
  );
}
