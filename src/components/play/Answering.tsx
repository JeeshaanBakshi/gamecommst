"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { QuestionDef } from "@/lib/flow";
import { cx, SquishButton } from "../ui";
import { Banner, Prompt } from "./Shell";

const LETTERS = "ABCDE";

export const buzz = () => {
  try {
    navigator.vibrate?.(15);
  } catch {}
};

/** Scantron-style options: tap fills the bubble. */
export function ChoiceList({ q, value, locked, onPick, compact }: { q: QuestionDef; value?: number; locked: boolean; onPick: (i: number) => void; compact?: boolean }) {
  return (
    <div className={cx("flex flex-col", compact ? "gap-2" : "gap-3")}>
      {q.options.map((o, i) => {
        const on = value === i;
        return (
          <motion.button
            key={o.label}
            disabled={locked}
            whileTap={{ scale: 0.94, y: 2 }}
            transition={{ type: "spring", stiffness: 600, damping: 20 }}
            onClick={() => {
              buzz();
              onPick(i);
            }}
            className={cx(
              "flex items-center gap-4 rounded-2xl border-[3px] border-ink px-4 text-left font-extrabold disabled:opacity-60",
              compact ? "py-2.5 text-xl" : "py-4 text-2xl",
              on ? "bg-ink text-gold shadow-none" : "bg-paper shadow-hard",
            )}
            aria-pressed={on}
          >
            <span
              className={cx(
                "grid shrink-0 place-items-center rounded-full border-[3px] font-mono text-base",
                compact ? "h-9 w-9" : "h-11 w-11",
                on ? "border-gold bg-gold text-ink" : "border-ink",
              )}
            >
              {on ? "●" : LETTERS[i]}
            </span>
            <span className="flex-1">{o.label}</span>
            <span className={compact ? "text-2xl" : "text-3xl"}>{o.emoji}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

export function ChoiceQuestion({ q, value, locked, revealed, onPick }: { q: QuestionDef; value?: number; locked: boolean; revealed: boolean; onPick: (i: number) => void }) {
  return (
    <div className="flex flex-1 flex-col">
      <Prompt kicker={q.short}>{q.prompt}</Prompt>
      <ChoiceList q={q} value={value} locked={locked} onPick={onPick} />
      <div className="mt-auto pt-5">
        <Status answered={value != null} locked={locked} revealed={revealed} />
      </div>
    </div>
  );
}

export function SliderQuestion({ q, value, locked, revealed, onSubmit }: { q: QuestionDef; value?: number; locked: boolean; revealed: boolean; onSubmit: (i: number) => void }) {
  const [v, setV] = useState(value ?? 2);
  const o = q.options[v];
  const dirty = value !== v;
  return (
    <div className="flex flex-1 flex-col">
      <Prompt kicker={q.short}>{q.prompt}</Prompt>
      <div className="flex flex-col items-center">
        <AnimatePresence mode="popLayout">
          <motion.div key={v} initial={{ scale: 0.5, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 500, damping: 15 }} className="text-[7.5rem] leading-none">
            {o.emoji}
          </motion.div>
        </AnimatePresence>
        <div className="mt-2 text-3xl font-extrabold">
          {v + 1} · {o.label}
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={q.options.length - 1}
        step={1}
        value={v}
        disabled={locked}
        onChange={(e) => {
          buzz();
          setV(Number(e.target.value));
        }}
        className="wle-range mt-6"
        aria-label={q.prompt}
      />
      <div className="mt-1 flex justify-between px-1">
        {q.options.map((opt, i) => (
          <button key={i} disabled={locked} onClick={() => setV(i)} className={cx("text-3xl transition-transform", i === v ? "scale-125" : "opacity-50")} aria-label={opt.label}>
            {opt.emoji}
          </button>
        ))}
      </div>
      <div className="mt-auto flex flex-col gap-3 pt-6">
        {!locked && (value == null || dirty) && (
          <SquishButton className="py-5 text-2xl" onClick={() => onSubmit(v)}>
            {value == null ? "Lock it in 🔒" : "Update answer"}
          </SquishButton>
        )}
        <Status answered={value != null} locked={locked} revealed={revealed} />
      </div>
    </div>
  );
}

export function Status({ answered, locked, revealed }: { answered: boolean; locked: boolean; revealed: boolean }) {
  if (revealed) return <Banner>👀 Results are on the big screen!</Banner>;
  if (locked && !answered) return <Banner tone="pen">🔒 Too slow! Answers are locked.</Banner>;
  if (locked) return <Banner>🔒 Locked in. No take-backs.</Banner>;
  if (answered) return <Banner tone="paper">✓ Locked in! Tap another to change.</Banner>;
  return null;
}
