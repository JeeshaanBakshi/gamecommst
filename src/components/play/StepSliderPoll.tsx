"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { QuestionDef } from "@/lib/flow";
import { cx, SquishButton } from "../ui";
import { buzz } from "./Answering";
import { Banner, Prompt } from "./Shell";

interface Props {
  q: QuestionDef;
  value?: number;
  locked: boolean;
  onSubmit: (i: number) => void;
}

/** One-shot slider poll that snaps to fixed steps (e.g. "when do you actually start?"). */
export function StepSliderPoll({ q, value, locked, onSubmit }: Props) {
  const last = q.options.length - 1;
  const [v, setV] = useState(value ?? Math.floor(last / 2));
  const submitted = value != null;
  const shown = submitted ? value : v;
  const color = q.stepPoll?.colors[shown] ?? "#111111";
  const closed = submitted || locked;

  return (
    <div className="flex flex-1 flex-col">
      <Prompt kicker="Poll · be honest">{q.prompt}</Prompt>

      <div className="flex min-h-[9rem] items-center justify-center text-center">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={shown}
            initial={{ scale: 0.7, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="text-[2.6rem] font-extrabold leading-tight text-ink"
          >
            {q.options[shown].label}
            <div className="mx-auto mt-2 h-3 w-24 rounded-full border-2 border-ink" style={{ backgroundColor: color }} />
          </motion.div>
        </AnimatePresence>
      </div>

      <input
        type="range"
        min={0}
        max={last}
        step={1}
        value={shown}
        disabled={closed}
        onChange={(e) => {
          buzz();
          setV(Number(e.target.value));
        }}
        className="wle-range"
        aria-label={q.prompt}
      />
      <div className="mt-1 flex justify-between px-1">
        {q.options.map((o, i) => (
          <button
            key={o.label}
            type="button"
            disabled={closed}
            onClick={() => setV(i)}
            aria-label={o.label}
            className={cx("text-2xl transition-transform", i === shown ? "scale-125" : "opacity-40")}
          >
            {o.emoji}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[11px] font-bold uppercase opacity-60">
        <span>{q.options[0].short ?? q.options[0].label}</span>
        <span>{q.options[last].short ?? q.options[last].label}</span>
      </div>

      <div className="mt-auto pt-6">
        {submitted ? (
          <Banner>Locked in. Look at the big screen 👀</Banner>
        ) : locked ? (
          <Banner tone="pen">🔒 Too slow! Answers are locked.</Banner>
        ) : (
          <SquishButton className="w-full py-5 text-2xl" onClick={() => onSubmit(v)}>
            Submit
          </SquishButton>
        )}
      </div>
    </div>
  );
}
