"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useNow } from "@/hooks/useNow";
import { burst } from "@/lib/confetti";
import { finaleTimeline } from "@/lib/finale";
import { MAX_SCORE, rankPlayers, tierFor, TIERS, type Ranked } from "@/lib/scoring";
import { sfx } from "@/lib/sound";
import type { AnswerIndex, Player } from "@/lib/types";
import { BaldHead } from "../../BaldHead";
import { Card, cx, DISCLAIMER, Sticker } from "../../ui";

interface Props {
  startedAt: string | null;
  players: Player[];
  answers: AnswerIndex;
}

const RUBRIC = [
  ["😵", "Stress 4 or 5"],
  ["🥱", "Under 6h sleep"],
  ["🍽️", "Skip 4+ meals/week"],
  ["📱", "Doomscroll > study"],
  ["🧬", "Family history"],
];

export function FinaleScreen({ startedAt, players, answers }: Props) {
  const ranked = rankPlayers(players, answers);
  const tl = finaleTimeline(ranked.length);
  const now = useNow(!!startedAt, 100);
  const elapsed = startedAt ? now - Date.parse(startedAt) : -1;
  const done = startedAt != null && elapsed >= tl.totalMs;

  // Sound/confetti cues, fired once each as the timeline passes them.
  const cues = [
    ...Array.from({ length: tl.n - 1 }, (_, i) => ({ at: tl.revealAt(tl.n - i), kind: "row" as const })),
    { at: tl.drumAt, kind: "drum" as const },
    { at: tl.winnerAt, kind: "winner" as const },
  ];
  const step = startedAt ? cues.filter((c) => elapsed >= c.at).length : 0;
  const lastStep = useRef<number | null>(null);
  useEffect(() => {
    if (lastStep.current === null) {
      lastStep.current = step; // don't replay cues after a page reload
      return;
    }
    for (let i = lastStep.current; i < step; i++) {
      const c = cues[i];
      if (c.kind === "row") sfx.whoosh();
      if (c.kind === "drum") sfx.drumroll(2.9);
      if (c.kind === "winner") {
        sfx.fanfare();
        burst(true);
      }
    }
    lastStep.current = step;
  });

  if (!startedAt) return <FinaleIntro />;

  const top = ranked.slice(0, tl.n);
  const winner = top[0];
  const winnerShown = elapsed >= tl.winnerAt;
  const drumming = elapsed >= tl.drumAt && !winnerShown;
  const tierCounts = TIERS.map((t) => ({ t, n: ranked.filter((r) => tierFor(r.result.score) === t).length }));

  return (
    <div className="absolute inset-0 px-14 pb-10 pt-[110px]">
      <h1 className="text-[84px] font-extrabold leading-none tracking-tight">
        Closest to Bald <span className="font-marker text-pen">— the official rankings</span>
      </h1>

      <div className="mt-6 flex h-[700px] gap-10">
        {/* #1 spotlight */}
        <Card dark={winnerShown} className="relative flex w-[680px] shrink-0 flex-col items-center justify-center overflow-hidden p-8">
          <AnimatePresence mode="wait">
            {!winnerShown ? (
              <motion.div key="mystery" exit={{ scale: 0, opacity: 0 }} className={cx("flex flex-col items-center", drumming && "animate-shake")}>
                <div className="grid h-[320px] w-[320px] place-items-center rounded-full border-[6px] border-dashed border-ink text-[200px] font-extrabold">?</div>
                <div className="mt-8 font-mono text-4xl font-bold uppercase">{drumming ? "🥁 Drumroll…" : "#1 is coming…"}</div>
              </motion.div>
            ) : (
              winner && (
                <motion.div
                  key="winner"
                  initial={{ scale: 0.2, rotate: -20, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: "spring", damping: 9, stiffness: 140 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="font-mono text-3xl font-bold uppercase tracking-widest">#1 closest to bald</div>
                  <div className="mt-4">
                    <BaldHead score={winner.result.score} size={300} emoji={winner.player.emoji} recede delay={0.3} />
                  </div>
                  <div className="mt-4 max-w-[600px] truncate text-7xl font-extrabold text-paper">{winner.player.nickname}</div>
                  <div className="mt-3 text-4xl font-extrabold">
                    {tierFor(winner.result.score).emoji} {tierFor(winner.result.score).name}
                  </div>
                  <div className="mt-2 font-mono text-3xl font-bold">{winner.result.score}/{MAX_SCORE} bald points</div>
                  {winner.result.score === MAX_SCORE && (
                  <motion.div
                    initial={{ scale: 3, opacity: 0, rotate: -40 }}
                    animate={{ scale: 1, opacity: 1, rotate: -16 }}
                    transition={{ delay: 1.2, type: "spring", damping: 8 }}
                    className="absolute left-4 top-[150px] rounded-xl border-[5px] border-pen bg-ink px-3 py-1 font-extrabold uppercase text-pen"
                  >
                    <span className="text-3xl">Certified</span>
                  </motion.div>
                  )}
                </motion.div>
              )
            )}
          </AnimatePresence>
        </Card>

        {/* 2..N */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {top.slice(1).map((r) => (
            <Row key={r.player.id} r={r} shown={elapsed >= tl.revealAt(r.rank)} />
          ))}
          {top.length <= 1 && <div className="font-mono text-3xl font-bold">Need more contestants for a full leaderboard!</div>}
        </div>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-6 flex items-center justify-between gap-4">
            <div className="flex gap-3">
              {tierCounts.map(({ t, n }) => (
                <span key={t.name} className="whitespace-nowrap rounded-xl border-[3px] border-ink bg-paper px-3 py-1.5 text-xl font-extrabold">
                  {t.emoji} {t.name}: <span className="tabular-nums">{n}</span>
                </span>
              ))}
            </div>
            <span className="whitespace-nowrap font-marker text-3xl text-pen">📱 Check your phone!</span>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="absolute bottom-3 left-14 font-mono text-base font-bold opacity-70">{DISCLAIMER}</p>
    </div>
  );
}

function Row({ r, shown }: { r: Ranked; shown: boolean }) {
  const tier = tierFor(r.result.score);
  return (
    <div className="relative h-[92px]">
      {!shown && <div className="absolute inset-0 rounded-2xl border-[3px] border-dashed border-ink/40" />}
      <AnimatePresence>
        {shown && (
          <motion.div
            initial={{ x: 200, opacity: 0, rotate: 3 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 14, stiffness: 200 }}
            className="absolute inset-0 flex items-center gap-5 rounded-2xl border-[3px] border-ink bg-paper px-5 shadow-hard"
          >
            <span className="w-16 text-5xl font-extrabold">#{r.rank}</span>
            <BaldHead score={r.result.score} size={70} emoji={r.player.emoji} recede delay={0.2} />
            <span className="min-w-0 flex-1 truncate text-4xl font-extrabold">{r.player.nickname}</span>
            <span className="flex gap-1.5">
              {Array.from({ length: MAX_SCORE }, (_, i) => (
                <span key={i} className={cx("h-6 w-6 rounded-full border-[3px] border-ink", i < r.result.score ? "bg-ink" : "bg-paper")} />
              ))}
            </span>
            <span className="w-[380px] truncate text-right text-2xl font-extrabold" style={{ color: tier.color }}>
              {tier.emoji} {tier.name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FinaleIntro() {
  return (
    <div className="absolute inset-0 flex items-center gap-16 px-20 pt-[100px]">
      <div className="flex-1">
        <Sticker tone="pen" className="text-3xl">The Finale</Sticker>
        <h1 className="mt-6 text-[150px] font-extrabold leading-[0.85] tracking-tight">
          Who&apos;s closest
          <br />
          to bald<span className="text-pen">?</span>
        </h1>
        <div className="mt-10 flex items-end gap-6">
          {[0, 2, 4, 5].map((s, i) => (
            <motion.div key={s} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.15 }} className="text-center">
              <BaldHead score={s} size={150} />
              <div className="mt-2 w-[170px] text-xl font-extrabold leading-tight">{TIERS[i].name}</div>
            </motion.div>
          ))}
        </div>
        <p className="mt-10 animate-blink font-mono text-3xl font-bold uppercase">🥁 Drumroll please…</p>
      </div>
      <Card className="w-[620px] shrink-0 rotate-2 bg-ruled p-10">
        <div className="font-mono text-2xl font-bold uppercase tracking-widest text-pen">Marking scheme</div>
        <ul className="mt-4 space-y-3">
          {RUBRIC.map(([e, t]) => (
            <li key={t} className="flex items-center gap-4 text-[34px] font-bold">
              <span className="text-4xl">{e}</span>
              <span className="flex-1">{t}</span>
              <span className="font-marker text-4xl text-pen">+1</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
