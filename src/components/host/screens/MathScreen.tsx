"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useNow } from "@/hooks/useNow";
import { burst } from "@/lib/confetti";
import { MATH_DURATION_MS } from "@/lib/flow";
import { mathLeaderboard } from "@/lib/scoring";
import { sfx } from "@/lib/sound";
import type { AnswerIndex, Player } from "@/lib/types";
import { Card, CautionTape, cx, Sticker } from "../../ui";

interface Props {
  startedAt: string | null;
  players: Player[];
  answers: AnswerIndex;
}

export function MathScreen({ startedAt, players, answers }: Props) {
  const now = useNow(!!startedAt, 100);
  const elapsed = startedAt ? now - Date.parse(startedAt) : 0;
  const left = Math.max(0, Math.ceil((MATH_DURATION_MS - elapsed) / 1000));
  const phase = !startedAt ? "ready" : elapsed < MATH_DURATION_MS ? "running" : "over";
  const urgent = phase === "running" && left <= 10;

  const lastSec = useRef<number | null>(null);
  useEffect(() => {
    if (phase !== "running") return;
    if (lastSec.current !== left) {
      lastSec.current = left;
      sfx.tick(left <= 10);
    }
  }, [left, phase]);

  const prevPhase = useRef(phase);
  useEffect(() => {
    if (prevPhase.current === "running" && phase === "over") {
      sfx.buzzer();
      burst();
    }
    if (prevPhase.current === "ready" && phase === "running") sfx.whoosh();
    prevPhase.current = phase;
  }, [phase]);

  const math = answers.math ?? {};
  const columns = [0, 1, 2, 3, 4, 5].map((c) => players.filter((p) => (math[p.id]?.correct ?? 0) === c));
  const top = mathLeaderboard(players, answers).slice(0, 3);

  return (
    <div className={cx("absolute inset-0 transition-colors duration-300", urgent && "bg-pen/25")}>
      {urgent && (
        <>
          <CautionTape className="absolute inset-x-0 top-[100px] h-12" label="Hurry up" />
          <CautionTape className="absolute inset-x-0 bottom-0 h-12" label="Your follicles are watching" />
        </>
      )}

      <div className="absolute inset-0 flex gap-10 px-14 pb-20 pt-[170px]">
        {/* clock */}
        <div className="flex w-[640px] shrink-0 flex-col items-center justify-center">
          {phase === "ready" && (
            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <Sticker tone="pen" className="text-3xl">Stress test · Part 2</Sticker>
              <h1 className="mt-6 text-[120px] font-extrabold leading-[0.9]">30-second mental math</h1>
              <p className="mt-6 text-4xl font-bold">5 questions. No calculators. Your hairline is watching.</p>
              <p className="mt-10 animate-blink font-mono text-3xl font-bold uppercase">Pencils up… waiting for host</p>
            </motion.div>
          )}
          {phase !== "ready" && (
            <div className={cx("text-center", urgent && "animate-shake")}>
              <div className="font-mono text-4xl font-bold uppercase tracking-widest">{phase === "over" ? "Pencils down" : "Time remaining"}</div>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={left}
                  initial={{ scale: urgent ? 1.5 : 1.15, opacity: 0.4 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cx(
                    "text-[420px] font-extrabold leading-[0.9] tabular-nums",
                    urgent || phase === "over" ? "text-pen" : "text-ink",
                  )}
                >
                  {phase === "over" ? "0" : left}
                </motion.div>
              </AnimatePresence>
              {phase === "over" && (
                <motion.div initial={{ scale: 2, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: -6, opacity: 1 }} className="font-marker text-7xl text-pen">
                  TIME&apos;S UP!
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* race board */}
        <Card className="flex min-w-0 flex-1 flex-col p-8">
          <div className="flex items-center justify-between">
            <div className="text-5xl font-extrabold">The Race 🏁</div>
            {phase === "over" && top.length > 0 && (
              <div className="flex gap-4 font-mono text-2xl font-bold">
                {top.map((r, i) => (
                  <span key={r.player.id}>
                    {["🥇", "🥈", "🥉"][i]} {r.player.emoji} {r.player.nickname}
                  </span>
                ))}
              </div>
            )}
          </div>
          <LayoutGroup>
            <div className="mt-6 flex min-h-0 flex-1 gap-3">
              {columns.map((col, c) => (
                <div key={c} className={cx("flex flex-1 flex-col rounded-2xl border-[3px] border-ink", c === 5 ? "bg-gold" : "bg-gold-pale")}>
                  <div className="flex flex-1 flex-wrap content-end justify-center gap-1.5 p-2">
                    {col.map((p) => (
                      <motion.div
                        key={p.id}
                        layoutId={`racer-${p.id}`}
                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                        className="grid h-12 w-12 place-items-center rounded-full border-2 border-ink bg-paper text-2xl"
                        title={p.nickname}
                      >
                        {p.emoji}
                      </motion.div>
                    ))}
                  </div>
                  <div className="border-t-[3px] border-ink py-2 text-center text-3xl font-extrabold">{c === 5 ? "5 ✓ 🏆" : `${c} ✓`}</div>
                </div>
              ))}
            </div>
          </LayoutGroup>
        </Card>
      </div>
    </div>
  );
}
