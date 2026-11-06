"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useNow } from "@/hooks/useNow";
import { QUIZ_MS, type QuestionDef } from "@/lib/flow";
import { countOptions, familyCaption, mealsCaption, pct, quizStats, sleepCaption, stressCaption } from "@/lib/scoring";
import type { AnswerIndex, Player } from "@/lib/types";
import { AnsweredMeter } from "../AnsweredMeter";
import { BarChart } from "../BarChart";
import { Card, cx, RedPenCircle, Sticker } from "../../ui";

interface Props {
  q: QuestionDef;
  answers: AnswerIndex;
  players: Player[];
  revealed: boolean;
  locked: boolean;
  startedAt: string | null;
}

function pollCallout(q: QuestionDef, counts: number[], total: number) {
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

export function QuestionScreen({ q, answers, players, revealed, locked, startedAt }: Props) {
  const quiz = q.correct != null;
  const counts = countOptions(answers, q.key, q.options.length);
  const total = counts.reduce((a, b) => a + b, 0);
  const top = Math.max(...counts);
  const step = q.stepPoll;
  const meterTotal = Math.max(players.length, total);

  return (
    <div className="absolute inset-0 px-14 pb-14 pt-[120px]">
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-start gap-6">
        {quiz && <Sticker tone="pen" className="mt-4 shrink-0 text-3xl">Quiz</Sticker>}
        <h1 className={cx("font-extrabold leading-[0.95] tracking-tight", q.prompt.length > 50 ? "text-[72px]" : "text-[88px]")}>{q.prompt}</h1>
      </motion.div>

      <div className="mt-10 flex h-[740px] gap-10">
        <Card className="flex-1 pb-8 pt-6">
          {quiz && !revealed ? (
            <AnswerTiles q={q} />
          ) : (
            <BarChart
              total={total}
              revealed={revealed}
              height={quiz ? 540 : 560}
              highlightTone={quiz ? "mint" : "pen"}
              dimOthers={quiz || !!step}
              bars={q.options.map((o, i) => ({
                label: step ? (o.short ?? o.label) : q.kind === "slider" ? `${i + 1} · ${o.label}` : o.label,
                emoji: o.emoji,
                count: counts[i],
                highlight: quiz ? i === q.correct : step ? total > 0 && counts[i] === top : q.bad.includes(i),
                color: step?.colors[i],
              }))}
            />
          )}
        </Card>

        <div className="flex w-[520px] shrink-0 flex-col justify-between">
          {quiz && !revealed ? (
            <QuizClock startedAt={startedAt} />
          ) : (
            <AnsweredMeter compact={quiz} answered={total} total={meterTotal} locked={locked} />
          )}
          {quiz && !revealed && <AnsweredMeter compact answered={total} total={meterTotal} locked={locked} />}
          <AnimatePresence>
            {revealed && (
              <motion.div
                initial={{ scale: 0.4, rotate: -8, opacity: 0 }}
                animate={{ scale: 1, rotate: -2, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", damping: 11, stiffness: 180 }}
              >
                {quiz ? (
                  <QuizCallout q={q} answers={answers} players={players} startedAt={startedAt} />
                ) : step ? (
                  <Card className="bg-ruled p-8">
                    <div className="whitespace-nowrap text-[52px] font-extrabold leading-none text-pen">{step.revealTitle}</div>
                    <p className="mt-4 font-marker text-[40px] leading-tight text-pen">{step.revealNote}</p>
                  </Card>
                ) : (
                  <PollCallout c={pollCallout(q, counts, total)} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function PollCallout({ c }: { c: { big: string; label: string; caption: string } }) {
  return (
    <Card className="bg-ruled p-8">
      <div className="text-center">
        <RedPenCircle>
          <span className="text-[120px] font-extrabold leading-none text-pen">{c.big}</span>
        </RedPenCircle>
      </div>
      <div className="mt-4 text-center font-mono text-2xl font-bold uppercase">{c.label}</div>
      <p className="mt-4 font-marker text-[40px] leading-tight text-pen">{c.caption}</p>
    </Card>
  );
}

function QuizCallout({ q, answers, players, startedAt }: { q: QuestionDef; answers: AnswerIndex; players: Player[]; startedAt: string | null }) {
  const s = quizStats(players, answers, q.key, q.correct!, startedAt);
  return (
    <Card className="bg-ruled p-7">
      <div className="flex items-baseline gap-4">
        <span className="text-[96px] font-extrabold leading-none text-mint">{s.pctRight}%</span>
        <span className="font-mono text-2xl font-bold uppercase">got it right</span>
      </div>
      <p className="mt-3 text-[28px] font-bold leading-snug">{q.explain}</p>
      {s.fastest.length > 0 && (
        <div className="mt-4 border-t-[3px] border-ink pt-3">
          <div className="font-mono text-xl font-bold uppercase">⚡ Fastest correct</div>
          {s.fastest.map((f, i) => (
            <div key={f.player.id} className="mt-1 flex items-center gap-3 text-[28px] font-extrabold">
              <span>{["🥇", "🥈", "🥉"][i]}</span>
              <span>{f.player.emoji}</span>
              <span className="min-w-0 flex-1 truncate">{f.player.nickname}</span>
              {Number.isFinite(f.ms) && <span className="font-mono text-xl">{(f.ms / 1000).toFixed(1)}s</span>}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

const LETTERS = "ABCD";

/** Quiz options before the reveal — no counts shown so nobody copies the crowd. */
function AnswerTiles({ q }: { q: QuestionDef }) {
  return (
    <div className="grid h-full grid-cols-2 gap-6 px-8 py-4">
      {q.options.map((o, i) => (
        <motion.div
          key={o.label}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 + i * 0.08, type: "spring", damping: 14 }}
          className="flex items-center gap-6 rounded-3xl border-4 border-ink bg-gold-pale px-8 shadow-hard"
        >
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-4 border-ink font-mono text-4xl font-bold">{LETTERS[i]}</span>
          <span className="flex-1 text-[52px] font-extrabold leading-tight">{o.label}</span>
          <span className="text-7xl">{o.emoji}</span>
        </motion.div>
      ))}
    </div>
  );
}

function QuizClock({ startedAt }: { startedAt: string | null }) {
  const now = useNow(true, 100);
  const elapsed = startedAt ? now - Date.parse(startedAt) : 0;
  const left = Math.max(0, Math.ceil((QUIZ_MS - elapsed) / 1000));
  const p = Math.max(0, Math.min(1, 1 - elapsed / QUIZ_MS));
  const urgent = left <= 5;
  return (
    <div className="flex items-center gap-8">
      <div className={cx("relative h-[260px] w-[260px]", urgent && left > 0 && "animate-shake")}>
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="44" fill="#fffcef" stroke="#111" strokeWidth="6" />
          <circle cx="50" cy="50" r="44" fill="none" stroke={urgent ? "#e2342d" : "#111"} strokeWidth="6" strokeDasharray={276.5} strokeDashoffset={276.5 * (1 - p)} strokeLinecap="round" />
        </svg>
        <div className={cx("absolute inset-0 grid place-items-center text-[120px] font-extrabold tabular-nums", urgent && "text-pen")}>{left}</div>
      </div>
      <div className="font-mono text-2xl font-bold uppercase leading-snug">
        {left > 0 ? (
          <>
            Answer on
            <br />
            your phone!
          </>
        ) : (
          "Time's up!"
        )}
      </div>
    </div>
  );
}
