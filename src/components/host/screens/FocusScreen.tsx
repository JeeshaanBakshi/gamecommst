"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useNow } from "@/hooks/useNow";
import { FOCUS_MS } from "@/lib/flow";
import { focusStats } from "@/lib/scoring";
import type { AnswerIndex, Player } from "@/lib/types";
import { Card, cx, Sticker } from "../../ui";

interface Props {
  players: Player[];
  answers: AnswerIndex;
  startedAt: string | null;
  revealed: boolean;
}

/** Focus Challenge on the big screen: live counter, a goose per player, then the results. */
export function FocusScreen({ players, answers, startedAt, revealed }: Props) {
  const now = useNow(!!startedAt && !revealed, 100);
  const s = focusStats(players, answers);
  const elapsed = startedAt ? now - Date.parse(startedAt) : 0;
  const left = Math.max(0, Math.ceil((FOCUS_MS - elapsed) / 1000));
  const f = answers.focus ?? {};
  const n = players.length;
  const tile = n <= 8 ? 210 : n <= 20 ? 150 : n <= 42 ? 118 : 96;

  return (
    <div className="absolute inset-0 flex gap-10 px-14 pb-12 pt-[120px]">
      {/* left: title, live state, results */}
      <div className="flex w-[760px] shrink-0 flex-col">
        <div className="flex items-center gap-4">
          <span className="text-outline text-[110px] font-extrabold leading-[0.8]">04</span>
          <Sticker tone="pen" className="text-2xl">Focus Challenge</Sticker>
        </div>
        <h1 className="mt-5 whitespace-nowrap text-[82px] font-extrabold leading-[0.9] tracking-tight">Focus Challenge 🧠</h1>
        <p className="mt-4 text-[34px] font-bold leading-snug">Hold the button for 15 seconds. Don&apos;t let go. Don&apos;t tap anything.</p>

        <div className="mt-8 flex-1">
          <AnimatePresence mode="wait">
            {revealed ? (
              <motion.div key="results" initial={{ scale: 0.6, rotate: -6, opacity: 0 }} animate={{ scale: 1, rotate: -1, opacity: 1 }} transition={{ type: "spring", damping: 11 }}>
                <div className="flex items-baseline gap-4">
                  <span className="text-[130px] font-extrabold leading-none text-mint">{s.pctFocused}%</span>
                  <span className="font-mono text-3xl font-bold uppercase">stayed focused</span>
                </div>
                {s.avgFailMs != null && (
                  <div className="mt-2 text-[38px] font-extrabold">
                    The rest lasted <span className="text-pen">{(s.avgFailMs / 1000).toFixed(1)}s</span> on average
                  </div>
                )}
                <Card className="mt-6 bg-ruled p-7">
                  <p className="font-marker text-[40px] leading-tight text-pen">
                    Fake notifications. 15 seconds. Now imagine a real study night. Phone goes away.
                  </p>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="live" exit={{ opacity: 0 }}>
                {!startedAt ? (
                  <div className="text-[56px] font-extrabold leading-tight">
                    📱 Phones out.
                    <div className="animate-blink font-mono text-3xl uppercase tracking-widest">Waiting to start…</div>
                  </div>
                ) : (
                  <div className="flex items-end gap-6">
                    <span className={cx("text-[200px] font-extrabold leading-[0.8] tabular-nums", left <= 5 && left > 0 && "text-pen")}>{left}</span>
                    <span className="mb-4 font-mono text-3xl font-bold uppercase">{left > 0 ? "seconds" : "time!"}</span>
                  </div>
                )}
                <div className="mt-8 inline-block rounded-2xl border-4 border-ink bg-ink px-6 py-4 text-[44px] font-extrabold text-gold shadow-hard">
                  {startedAt ? (
                    <>
                      🧠 Still focused: <span className="tabular-nums">{s.stillFocused}</span> / <span className="tabular-nums">{s.participants}</span> holding
                    </>
                  ) : (
                    <>
                      🪿 <span className="tabular-nums">{n}</span> {n === 1 ? "goose" : "geese"} ready to focus
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* right: a goose per player */}
      <Card className="relative flex min-w-0 flex-1 flex-col overflow-hidden p-6">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold">🪿 The flock</span>
          <span className="font-mono text-xl font-bold uppercase">
            {!startedAt ? `${n} ready` : revealed ? `${s.done} locked in · ${s.failed} distracted` : `${s.stillFocused} still focused`}
          </span>
        </div>
        <div className="flex flex-1 flex-wrap content-center justify-center gap-3">
          {players.length === 0 && <div className="m-auto font-mono text-2xl font-bold">Waiting for geese to join…</div>}
          {players.map((p, i) => {
            const st = f[p.id]?.focus;
            const out = st === "failed";
            const done = st === "done";
            // waddle while waiting, bob fast while holding, stand proud when locked in, drop when distracted
            const motionClass = out ? "" : st === "holding" ? "animate-[bob_0.9s_ease-in-out_infinite]" : done ? "" : "animate-[bob_2.6s_ease-in-out_infinite]";
            return (
              <motion.div
                key={p.id}
                initial={false}
                animate={
                  out
                    ? { y: 70, rotate: 40, opacity: 0.15, scale: 0.8 }
                    : { y: 0, rotate: 0, opacity: st || !startedAt ? 1 : 0.4, scale: done ? 1.12 : 1 }
                }
                transition={{ type: "spring", damping: 12, stiffness: 140 }}
                className="relative flex flex-col items-center"
                style={{ width: tile }}
              >
                {done && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 right-2 text-2xl">
                    ✨
                  </motion.span>
                )}
                <span
                  className={cx("leading-none", motionClass, startedAt && !st && "grayscale")}
                  style={{ fontSize: tile * 0.55, animationDelay: `${(i % 7) * 0.15}s` }}
                >
                  🪿
                </span>
                <span className={cx("mt-1 w-full truncate text-center text-base font-bold", done && "text-mint")}>{p.nickname}</span>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
