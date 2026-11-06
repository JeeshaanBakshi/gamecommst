"use client";

import { motion } from "framer-motion";
import { mathCaption, mathLeaderboard, mathStats } from "@/lib/scoring";
import type { AnswerIndex, Player } from "@/lib/types";
import { BarChart } from "../BarChart";
import { Card, RedPenCircle } from "../../ui";

const FACES = ["💀", "😵", "😬", "🙂", "😎", "🧠"];

/** After the 30s math round: how the room did + the speed leaderboard. */
export function StressResultsScreen({ players, answers }: { players: Player[]; answers: AnswerIndex }) {
  const s = mathStats(answers);
  const board = mathLeaderboard(players, answers).slice(0, 5);

  return (
    <div className="absolute inset-0 px-14 pb-14 pt-[120px]">
      <h1 className="text-[96px] font-extrabold leading-none tracking-tight">
        How did you handle the pressure<span className="text-pen">?</span>
      </h1>

      <div className="mt-10 flex h-[760px] gap-10">
        <Card className="flex min-w-0 flex-1 flex-col pb-8 pt-6">
          <div className="px-10 font-mono text-2xl font-bold uppercase">Questions right out of 5</div>
          <div className="min-h-0 flex-1">
            <BarChart
              total={s.n}
              revealed
              height={560}
              highlightTone="mint"
              bars={s.counts.map((count, i) => ({ label: `${i}/5`, emoji: FACES[i], count, highlight: i === 5 }))}
            />
          </div>
        </Card>

        <div className="flex w-[600px] shrink-0 flex-col gap-6">
          <motion.div initial={{ scale: 0.5, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: -2, opacity: 1 }} transition={{ delay: 0.6, type: "spring", damping: 11 }}>
            <Card className="bg-ruled p-7">
              <div className="flex items-center gap-6">
                <RedPenCircle delay={1}>
                  <span className="text-[96px] font-extrabold leading-none text-pen">{s.avg.toFixed(1)}</span>
                </RedPenCircle>
                <div className="font-mono text-2xl font-bold uppercase leading-tight">
                  room average
                  <br />
                  {s.pctPerfect}% got all 5
                </div>
              </div>
              <p className="mt-4 font-marker text-[34px] leading-tight text-pen">{mathCaption(s.avg)}</p>
            </Card>
          </motion.div>

          <Card className="flex min-h-0 flex-1 flex-col p-6">
            <div className="text-4xl font-extrabold">⚡ Speed demons</div>
            <div className="mt-4 flex flex-col gap-2.5">
              {board.length === 0 && <div className="font-mono text-2xl">No math was attempted. Cowards.</div>}
              {board.map((r, i) => (
                <motion.div
                  key={r.player.id}
                  initial={{ x: 80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.15, type: "spring" }}
                  className={`flex items-center gap-4 rounded-2xl border-[3px] border-ink px-4 py-2 ${i === 0 ? "bg-gold" : "bg-paper"}`}
                >
                  <span className="w-10 text-3xl font-extrabold">{i + 1}</span>
                  <span className="text-4xl">{r.player.emoji}</span>
                  <span className="min-w-0 flex-1 truncate text-[28px] font-extrabold">{r.player.nickname}</span>
                  <span className="font-mono text-xl font-bold tabular-nums">
                    {r.correct}/5{Number.isFinite(r.ms) && r.correct > 0 ? ` · ${(r.ms / 1000).toFixed(1)}s` : ""}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
