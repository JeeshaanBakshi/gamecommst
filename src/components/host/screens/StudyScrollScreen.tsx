"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Q } from "@/lib/flow";
import { avgHours, countOptions } from "@/lib/scoring";
import type { AnswerIndex } from "@/lib/types";
import { AnimatedNumber } from "../../AnimatedNumber";
import { AnsweredMeter } from "../AnsweredMeter";
import { Card } from "../../ui";

interface Props {
  answers: AnswerIndex;
  playerCount: number;
  revealed: boolean;
  locked: boolean;
}

export function StudyScrollScreen({ answers, playerCount, revealed, locked }: Props) {
  const study = countOptions(answers, "study", 5);
  const scroll = countOptions(answers, "scroll", 5);
  const sTotal = study.reduce((a, b) => a + b, 0);
  const dTotal = scroll.reduce((a, b) => a + b, 0);
  const sAvg = avgHours(answers, "study");
  const dAvg = avgHours(answers, "scroll");
  const max = Math.max(1, ...study, ...scroll);
  const scrollWins = dAvg > sAvg;
  const answered = Object.keys(answers.scroll ?? {}).filter((id) => answers.study?.[id]).length;

  return (
    <div className="absolute inset-0 px-14 pb-14 pt-[120px]">
      <div className="flex items-end justify-between">
        <h1 className="text-[92px] font-extrabold leading-none tracking-tight">
          Study <span className="font-marker text-pen">vs</span> Doomscroll
        </h1>
        <div className="w-[440px]">
          <AnsweredMeter compact answered={answered} total={Math.max(playerCount, answered)} locked={locked} />
        </div>
      </div>

      <div className="mt-6 flex h-[700px] gap-10">
        {/* fighters */}
        <div className="flex w-[520px] shrink-0 flex-col gap-4">
          <Fighter label="📚 Studying" hours={sAvg} n={sTotal} dark win={revealed && !scrollWins && sAvg > 0} />
          <div className="text-center font-marker text-6xl leading-none text-pen">VS</div>
          <Fighter label="📱 Doomscrolling" hours={dAvg} n={dTotal} win={revealed && scrollWins} />
        </div>

        {/* grouped bars */}
        <Card className="relative flex flex-1 items-end justify-around gap-6 px-10 pb-8 pt-10">
          {Q.study.options.map((o, i) => (
            <div key={o.label} className="flex flex-1 flex-col items-center">
              <div className="flex h-[500px] w-full items-end justify-center gap-3">
                <GBar count={study[i]} max={max} cls="bg-ink" />
                <GBar count={scroll[i]} max={max} cls="bg-pen" />
              </div>
              <div className="w-full border-t-4 border-ink pt-3 text-center text-4xl font-extrabold">{o.label}</div>
            </div>
          ))}
          <div className="absolute right-8 top-6 flex gap-6 font-mono text-2xl font-bold">
            <span className="flex items-center gap-2"><i className="h-6 w-6 rounded bg-ink" /> study</span>
            <span className="flex items-center gap-2"><i className="h-6 w-6 rounded bg-pen" /> doomscroll</span>
          </div>

          <AnimatePresence>
            {revealed && (
              <motion.div
                initial={{ scale: 3, rotate: -30, opacity: 0 }}
                animate={{ scale: 1, rotate: -12, opacity: 1 }}
                transition={{ type: "spring", damping: 10, stiffness: 160 }}
                className={`absolute left-1/2 top-1/3 -translate-x-1/2 rounded-2xl border-[6px] px-10 py-4 text-center font-extrabold uppercase ${
                  scrollWins ? "border-pen bg-paper/90 text-pen" : "border-ink bg-paper/90 text-ink"
                }`}
              >
                <div className="text-[84px] leading-none">{scrollWins ? "Scrolling wins" : "Studying wins"}</div>
                <div className="mt-2 font-marker text-4xl normal-case">
                  {scrollWins
                    ? `by ${(dAvg - sAvg).toFixed(1)}h a day. The algorithm thanks you.`
                    : "…allegedly. We trust you. Mostly."}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}

function Fighter({ label, hours, n, dark, win }: { label: string; hours: number; n: number; dark?: boolean; win?: boolean }) {
  return (
    <motion.div
      animate={{ scale: win ? 1.06 : 1, rotate: win ? -2 : 0 }}
      className={`flex-1 rounded-[28px] border-4 border-ink px-8 py-6 shadow-hard-lg ${dark ? "bg-ink text-gold" : "bg-pen text-paper"}`}
    >
      <div className="font-mono text-3xl font-bold uppercase">{label}</div>
      <div className="mt-2 text-[110px] font-extrabold leading-none tabular-nums">
        <AnimatedNumber value={hours} decimals={1} suffix="h" />
      </div>
      <div className="font-mono text-xl font-bold opacity-80">avg per day · {n} votes {win && "👑"}</div>
    </motion.div>
  );
}

function GBar({ count, max, cls }: { count: number; max: number; cls: string }) {
  return (
    <div className="flex h-full w-[42%] max-w-[90px] flex-col items-center justify-end">
      <span className="mb-1 text-4xl font-extrabold tabular-nums">{count}</span>
      <motion.div
        className={`w-full rounded-t-xl border-4 border-b-0 border-ink ${cls}`}
        initial={{ height: 6 }}
        animate={{ height: Math.max(6, (count / max) * 420) }}
        transition={{ type: "spring", stiffness: 140, damping: 14 }}
      />
    </div>
  );
}
