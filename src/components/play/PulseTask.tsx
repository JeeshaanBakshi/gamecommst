"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PULSE_SECONDS } from "@/lib/flow";
import type { AnswerValue } from "@/lib/types";
import { SquishButton } from "../ui";
import { Keypad } from "./Keypad";
import { Banner, Prompt } from "./Shell";

interface Props {
  round: "pulse_before" | "pulse_after";
  saved?: AnswerValue;
  before?: AnswerValue;
  locked: boolean;
  onSubmit: (v: AnswerValue) => void;
}

type Step = "intro" | "counting" | "enter" | "done";

export function PulseTask({ round, saved, before, locked, onSubmit }: Props) {
  const [step, setStep] = useState<Step>(saved ? "done" : "intro");
  const [endsAt, setEndsAt] = useState(0);
  const [left, setLeft] = useState(PULSE_SECONDS);
  const [count, setCount] = useState("");
  const [warn, setWarn] = useState<string | null>(null);

  useEffect(() => {
    if (step !== "counting") return;
    const id = setInterval(() => {
      const l = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setLeft(l);
      if (l === 0) {
        try {
          navigator.vibrate?.([120, 60, 120]);
        } catch {}
        setStep("enter");
      }
    }, 100);
    return () => clearInterval(id);
  }, [step, endsAt]);

  const after = round === "pulse_after";
  const n = Number(count);
  const bpm = n * 4;

  if (step === "done" && saved?.bpm) {
    const delta = after && before?.bpm ? saved.bpm - before.bpm : null;
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 60 / saved.bpm, repeat: Infinity }} className="text-8xl">
          ❤️
        </motion.div>
        <div className="mt-4 text-7xl font-extrabold tabular-nums">{saved.bpm}</div>
        <div className="font-mono text-lg font-bold">BPM</div>
        {delta != null && (
          <div className={`mt-4 text-2xl font-extrabold ${delta > 0 ? "text-pen" : ""}`}>
            {delta > 0 ? `+${delta} BPM. Math did that to you.` : delta === 0 ? "Exactly the same. Robot?" : `${delta} BPM. Calmer?? Teach us.`}
          </div>
        )}
        <p className="mt-6 font-marker text-xl text-pen">{saved.bpm > 110 ? "Are you okay? Blink twice." : "Eyes on the big screen 👀"}</p>
        {!locked && (
          <button className="mt-8 font-mono text-sm font-bold underline" onClick={() => setStep("intro")}>
            Redo measurement
          </button>
        )}
      </div>
    );
  }

  if (locked && step !== "enter") return <Banner tone="pen">🔒 Pulse check closed.</Banner>;

  if (step === "intro" || step === "done")
    return (
      <div className="flex flex-1 flex-col">
        <Prompt kicker={after ? "Stress test · Pulse #2" : "Stress test · Pulse #1"}>{after ? "Measure your pulse again." : "Find your pulse."}</Prompt>
        <div className="rounded-2xl border-[3px] border-ink bg-paper p-4 text-lg font-bold shadow-hard-sm">
          <p>☝️✌️ Put two fingers on your wrist, just below your thumb.</p>
          <p className="mt-2">Hit start and count every beat for {PULSE_SECONDS} seconds.</p>
        </div>
        <div className="flex flex-1 items-center justify-center py-6">
          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 0.9, repeat: Infinity }} className="text-[8rem] leading-none">
            🫀
          </motion.div>
        </div>
        <SquishButton
          variant="pen"
          className="py-6 text-3xl"
          onClick={() => {
            setEndsAt(Date.now() + PULSE_SECONDS * 1000);
            setLeft(PULSE_SECONDS);
            setCount("");
            setStep("counting");
          }}
        >
          Start {PULSE_SECONDS}s timer
        </SquishButton>
      </div>
    );

  if (step === "counting") {
    const p = left / PULSE_SECONDS;
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="font-mono text-sm font-bold uppercase tracking-widest">Count the beats</div>
        <div className="relative mt-4 h-64 w-64">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="44" fill="#fffcef" stroke="#111" strokeWidth="6" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="#e2342d" strokeWidth="6" strokeDasharray={276.5} strokeDashoffset={276.5 * (1 - p)} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.1s linear" }} />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-8xl font-extrabold tabular-nums">{left}</div>
        </div>
        <p className="mt-6 font-marker text-2xl text-pen">shhh… counting…</p>
        <button className="mt-6 font-mono text-sm font-bold underline" onClick={() => setStep("intro")}>
          Restart
        </button>
      </div>
    );
  }

  // enter
  return (
    <div className="flex flex-1 flex-col">
      <Prompt kicker="Time's up!">How many beats did you count?</Prompt>
      <div className="mb-4 rounded-2xl border-4 border-ink bg-paper py-3 text-center shadow-hard">
        <div className="text-6xl font-extrabold tabular-nums">{count || "–"}</div>
        <div className="font-mono text-sm font-bold">{n ? `= ${bpm} BPM` : "beats in 15s"}</div>
      </div>
      {warn && <div className="mb-3"><Banner tone="pen">{warn}</Banner></div>}
      <Keypad
        value={count}
        maxLen={2}
        onChange={(v) => {
          setWarn(null);
          setCount(v);
        }}
        onSubmit={() => {
          if (n < 8 || n > 55) {
            setWarn(n ? "That's… not a human heart rate. Try again?" : "Type the number you counted.");
            return;
          }
          onSubmit({ count: n, bpm });
          setStep("done");
        }}
      />
      <button className="mt-4 font-mono text-sm font-bold underline" onClick={() => setStep("intro")}>
        Couldn&apos;t find it, redo the timer
      </button>
    </div>
  );
}
