"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { QuestionDef } from "@/lib/flow";
import { countOptions, familyCaption, mealsCaption, pct, sleepCaption, stressCaption } from "@/lib/scoring";
import type { AnswerIndex } from "@/lib/types";
import { AnsweredMeter } from "../AnsweredMeter";
import { BarChart } from "../BarChart";
import { Card, RedPenCircle } from "../../ui";

interface Props {
  q: QuestionDef;
  answers: AnswerIndex;
  playerCount: number;
  revealed: boolean;
  locked: boolean;
}

function callout(q: QuestionDef, counts: number[], total: number) {
  const bad = q.bad.reduce((s, i) => s + counts[i], 0);
  switch (q.key) {
    case "stress": {
      const avg15 = total ? counts.reduce((s, c, i) => s + c * (i + 1), 0) / total : 0;
      return { big: `${avg15.toFixed(1)}/5`, label: "average stress", caption: stressCaption(avg15) };
    }
    case "sleep": {
      const p = pct(bad, total);
      return { big: `${p}%`, label: "sleep less than 6h", caption: sleepCaption(p) };
    }
    case "meals": {
      const p = pct(bad, total);
      return { big: `${p}%`, label: "skip 4+ meals a week", caption: mealsCaption(p) };
    }
    case "family": {
      const p = pct(bad, total);
      return { big: `${p}%`, label: "have baldness in the family", caption: familyCaption(p) };
    }
    default:
      return { big: `${total}`, label: "answers", caption: "" };
  }
}

export function QuestionScreen({ q, answers, playerCount, revealed, locked }: Props) {
  const counts = countOptions(answers, q.key, q.options.length);
  const total = counts.reduce((a, b) => a + b, 0);
  const c = callout(q, counts, total);

  return (
    <div className="absolute inset-0 px-14 pb-14 pt-[120px]">
      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-[88px] font-extrabold leading-none tracking-tight"
      >
        {q.prompt}
      </motion.h1>

      <div className="mt-10 flex h-[760px] gap-10">
        <Card className="flex-1 pb-8 pt-6">
          <BarChart
            total={total}
            revealed={revealed}
            height={560}
            bars={q.options.map((o, i) => ({
              label: q.kind === "slider" ? `${i + 1} · ${o.label}` : o.label,
              emoji: o.emoji,
              count: counts[i],
              highlight: q.bad.includes(i),
            }))}
          />
        </Card>

        <div className="flex w-[520px] shrink-0 flex-col justify-between">
          <AnsweredMeter answered={total} total={Math.max(playerCount, total)} locked={locked} />
          <AnimatePresence>
            {revealed && (
              <motion.div
                initial={{ scale: 0.4, rotate: -8, opacity: 0 }}
                animate={{ scale: 1, rotate: -2, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", damping: 11, stiffness: 180 }}
              >
                <Card className="bg-ruled p-8">
                  <div className="text-center">
                    <RedPenCircle>
                      <span className="text-[120px] font-extrabold leading-none text-pen">{c.big}</span>
                    </RedPenCircle>
                  </div>
                  <div className="mt-4 text-center font-mono text-2xl font-bold uppercase">{c.label}</div>
                  <p className="mt-4 font-marker text-[40px] leading-tight text-pen">{c.caption}</p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
