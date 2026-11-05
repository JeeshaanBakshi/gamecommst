"use client";

import { motion } from "framer-motion";
import { mathLeaderboard, pulseStats } from "@/lib/scoring";
import type { AnswerIndex, Player } from "@/lib/types";
import { AnimatedNumber } from "../../AnimatedNumber";
import { Card, RedPenCircle } from "../../ui";

export function StressResultsScreen({ players, answers }: { players: Player[]; answers: AnswerIndex }) {
  const s = pulseStats(answers);
  const board = mathLeaderboard(players, answers).slice(0, 5);
  const max = Math.max(120, s.avgBefore, s.avgAfter);
  const diff = s.avgAfter - s.avgBefore;

  return (
    <div className="absolute inset-0 px-14 pb-14 pt-[120px]">
      <h1 className="text-[96px] font-extrabold leading-none tracking-tight">
        Did math raise your heart rate<span className="text-pen">?</span>
      </h1>

      <div className="mt-10 flex h-[760px] gap-10">
        {/* before / after */}
        <Card className="flex w-[640px] shrink-0 items-end justify-around px-10 pb-10 pt-8">
          {[
            { label: "Before", v: s.avgBefore, cls: "bg-ink", n: s.nBefore },
            { label: "After", v: s.avgAfter, cls: "bg-pen", n: s.nAfter },
          ].map((b, i) => (
            <div key={b.label} className="flex w-[220px] flex-col items-center">
              <div className="text-[90px] font-extrabold leading-none tabular-nums">
                <AnimatedNumber value={b.v} duration={1.4} />
              </div>
              <div className="mb-3 font-mono text-2xl font-bold">BPM</div>
              <motion.div
                className={`w-full rounded-t-2xl border-4 border-b-0 border-ink ${b.cls}`}
                initial={{ height: 10 }}
                animate={{ height: Math.max(10, (b.v / max) * 440) }}
                transition={{ type: "spring", stiffness: 70, damping: 13, delay: 0.3 + i * 0.6 }}
              />
              <div className="w-full border-t-4 border-ink pt-3 text-center text-4xl font-extrabold">{b.label}</div>
              <div className="font-mono text-lg font-bold opacity-60">{b.n} pulses</div>
            </div>
          ))}
        </Card>

        {/* percent up */}
        <div className="flex w-[480px] shrink-0 flex-col items-center justify-center text-center">
          <motion.div initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.6, type: "spring", damping: 10 }}>
            <RedPenCircle delay={2}>
              <span className="text-[190px] font-extrabold leading-none text-pen tabular-nums">{s.pctUp}%</span>
            </RedPenCircle>
          </motion.div>
          <div className="mt-8 text-5xl font-extrabold leading-tight">of the room&apos;s heart rate went up</div>
          <div className="mt-6 font-marker text-4xl text-pen">
            {diff > 0 ? `+${diff} BPM from five tiny math questions.` : "Ice in your veins. Or you miscounted."}
          </div>
        </div>

        {/* leaderboard */}
        <Card className="flex min-w-0 flex-1 flex-col p-8">
          <div className="text-4xl font-extrabold">⚡ Speed demons</div>
          <div className="mt-6 flex flex-col gap-4">
            {board.length === 0 && <div className="font-mono text-2xl">No math was attempted. Cowards.</div>}
            {board.map((r, i) => (
              <motion.div
                key={r.player.id}
                initial={{ x: 80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.15, type: "spring" }}
                className={`flex items-center gap-4 rounded-2xl border-[3px] border-ink px-5 py-3 ${i === 0 ? "bg-gold" : "bg-paper"}`}
              >
                <span className="w-12 text-4xl font-extrabold">{i + 1}</span>
                <span className="text-5xl">{r.player.emoji}</span>
                <span className="min-w-0 flex-1 truncate text-3xl font-extrabold">{r.player.nickname}</span>
                <span className="font-mono text-2xl font-bold tabular-nums">
                  {r.correct}/5{Number.isFinite(r.ms) && r.correct > 0 ? ` · ${(r.ms / 1000).toFixed(1)}s` : ""}
                </span>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
