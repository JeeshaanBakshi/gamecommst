"use client";

import { motion } from "framer-motion";
import { useNow } from "@/hooks/useNow";
import { QUIZ_MS, type QuestionDef } from "@/lib/flow";
import { cx } from "../ui";
import { ChoiceList } from "./Answering";
import { Banner, Prompt } from "./Shell";

interface Props {
  q: QuestionDef;
  value?: number;
  locked: boolean;
  revealed: boolean;
  startedAt: string | null;
  onPick: (i: number) => void;
}

/** Kahoot-style: 15s clock, one shot, then right/wrong when the host reveals. */
export function QuizQuestion({ q, value, locked, revealed, startedAt, onPick }: Props) {
  const now = useNow(!revealed, 100);
  const elapsed = startedAt ? now - Date.parse(startedAt) : 0;
  const left = Math.max(0, Math.ceil((QUIZ_MS - elapsed) / 1000));
  const p = Math.max(0, Math.min(1, 1 - elapsed / QUIZ_MS));
  const timeUp = !!startedAt && elapsed >= QUIZ_MS;
  const answered = value != null;
  const closed = locked || revealed || timeUp || answered;
  const gotIt = answered && value === q.correct;

  return (
    <div className="flex flex-1 flex-col">
      {!revealed && (
        <div className="mb-4 flex items-center gap-3">
          <div className="h-5 flex-1 overflow-hidden rounded-full border-[3px] border-ink bg-paper">
            <div className={cx("h-full transition-[width] duration-100 ease-linear", left <= 5 ? "bg-pen" : "bg-ink")} style={{ width: `${p * 100}%` }} />
          </div>
          <span className={cx("w-12 text-right font-mono text-2xl font-bold tabular-nums", left <= 5 && "text-pen")}>{left}s</span>
        </div>
      )}
      <Prompt kicker="⚡ Quiz · one shot, be quick">{q.prompt}</Prompt>
      <ChoiceList q={q} value={value} locked={closed} onPick={onPick} correct={revealed ? q.correct : undefined} />
      <div className="mt-auto pt-5">
        {revealed ? (
          <motion.div initial={{ scale: 0.6, rotate: -6 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 10 }}>
            <Banner tone={gotIt ? "ink" : "pen"}>
              {gotIt ? "✅ Correct! Big brain." : answered ? "❌ Nope! Hairline -1 (not really)." : "😶 No answer. The geese are disappointed."}
            </Banner>
            <p className="mt-3 text-center text-base font-bold">{q.explain}</p>
          </motion.div>
        ) : answered ? (
          <Banner tone="paper">🔒 Locked in! Wait for the reveal…</Banner>
        ) : timeUp || locked ? (
          <Banner tone="pen">⏰ Too slow! Time&apos;s up.</Banner>
        ) : null}
      </div>
    </div>
  );
}
