"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNow } from "@/hooks/useNow";
import { MATH_DURATION_MS } from "@/lib/flow";
import { mathQuestions } from "@/lib/mathRound";
import type { AnswerValue } from "@/lib/types";
import { cx } from "../ui";
import { Keypad } from "./Keypad";
import { Waiting } from "./Waiting";

interface Props {
  seed: string;
  emoji: string;
  startedAt: string | null;
  saved?: AnswerValue;
  onProgress: (v: AnswerValue) => void;
}

export function MathTask({ seed, emoji, startedAt, saved, onProgress }: Props) {
  const qs = useMemo(() => mathQuestions(seed), [seed]);
  const now = useNow(!!startedAt, 100);
  const [idx, setIdx] = useState(saved?.correct ?? 0);
  const [correct, setCorrect] = useState(saved?.correct ?? 0);
  const [lastMs, setLastMs] = useState(saved?.ms ?? 0);
  const [input, setInput] = useState("");
  const [wrong, setWrong] = useState(0);
  const [finished, setFinished] = useState(!!saved?.done);

  const elapsed = startedAt ? now - Date.parse(startedAt) : 0;
  const timeUp = !!startedAt && elapsed >= MATH_DURATION_MS;
  const left = Math.max(0, Math.ceil((MATH_DURATION_MS - elapsed) / 1000));
  const over = finished || timeUp || idx >= qs.length;

  // Report a final result once when the clock runs out.
  const reported = useRef(!!saved?.done);
  useEffect(() => {
    if (timeUp && !reported.current) {
      reported.current = true;
      onProgress({ correct, ms: correct ? lastMs : MATH_DURATION_MS, done: true });
    }
  }, [timeUp, correct, lastMs, onProgress]);

  if (!startedAt) return <Waiting emoji={emoji} title="Get ready…" sub="30 seconds · 5 questions · no calculators" />;

  if (over) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="font-mono text-sm font-bold uppercase tracking-widest">{timeUp ? "Pencils down" : "Finished!"}</div>
        <div className="mt-2 text-[6rem] font-extrabold leading-none tabular-nums">{correct}/5</div>
        {correct > 0 && <div className="font-mono text-lg font-bold">last answer at {(lastMs / 1000).toFixed(1)}s</div>}
        <p className="mt-6 font-marker text-2xl text-pen">
          {correct === 5 ? "Big brain. Small stress?" : correct >= 3 ? "Respectable under pressure." : "Math is hard when a goose is watching."}
        </p>
        <p className="mt-6 font-bold">Eyes on the big screen 👀</p>
      </div>
    );
  }

  const q = qs[idx];
  const urgent = left <= 10;

  const submit = () => {
    if (!input) return;
    if (Number(input) === q.answer) {
      const c = correct + 1;
      const ms = Math.round(elapsed);
      setCorrect(c);
      setLastMs(ms);
      setInput("");
      const done = idx + 1 >= qs.length;
      setIdx(idx + 1);
      if (done) {
        setFinished(true);
        reported.current = true;
      }
      onProgress({ correct: c, ms, done });
    } else {
      setWrong((w) => w + 1);
      setInput("");
      try {
        navigator.vibrate?.([40, 30, 40]);
      } catch {}
    }
  };

  const skip = () => {
    setInput("");
    const done = idx + 1 >= qs.length;
    setIdx(idx + 1);
    if (done) {
      setFinished(true);
      reported.current = true;
      onProgress({ correct, ms: correct ? lastMs : MATH_DURATION_MS, done: true });
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-bold uppercase">Q{idx + 1} of 5 · {correct} ✓</span>
        <span className={cx("rounded-xl border-[3px] border-ink px-3 py-1 font-mono text-2xl font-bold tabular-nums", urgent ? "animate-shake bg-pen text-paper" : "bg-paper")}>
          {left}s
        </span>
      </div>
      <motion.div
        key={`${idx}-${wrong}`}
        initial={wrong ? { x: 0 } : { scale: 0.8, opacity: 0 }}
        animate={wrong ? { x: [0, -14, 14, -8, 8, 0] } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className={cx("my-4 rounded-3xl border-4 border-ink py-6 text-center shadow-hard", wrong ? "bg-pen/15" : "bg-paper")}
      >
        <div className="text-5xl font-extrabold tabular-nums">{q.text}</div>
        <div className="mt-3 h-14 text-5xl font-extrabold tabular-nums text-pen">{input || "?"}</div>
      </motion.div>
      <Keypad value={input} onChange={setInput} onSubmit={submit} maxLen={4} submitLabel="Go" />
      <button onClick={skip} className="mt-3 font-mono text-sm font-bold underline">
        Skip this one
      </button>
    </div>
  );
}
