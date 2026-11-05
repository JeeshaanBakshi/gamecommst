"use client";

import { useEffect, useRef } from "react";
import { serverNow } from "@/lib/clock";
import { botChoice, botMathPlan, botPulse } from "@/lib/demo";
import { isQuiz, QUIZ_MS, SCREENS, screenKeys } from "@/lib/flow";
import type { HostGame } from "./useHostGame";

/**
 * Rehearsal mode: fake players answer each screen with staggered delays,
 * written through the real backend so the realtime path gets exercised too.
 */
export function useDemoBots(game: HostGame, enabled: boolean) {
  const { backend, room, state, players, answers } = game;
  const answersRef = useRef(answers);
  const playersRef = useRef(players);
  useEffect(() => {
    answersRef.current = answers;
    playersRef.current = players;
  });

  const screenIdx = state?.screen ?? -1;
  const startedAt = state?.started_at ?? null;
  const locked = state?.locked ?? false;
  const fakeCount = players.filter((p) => p.is_fake).length;

  useEffect(() => {
    if (!enabled || !room || screenIdx < 0 || locked) return;
    const screen = SCREENS[screenIdx];
    const keys = screenKeys(screen);
    if (!keys.length) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const fakes = playersRef.current.filter((p) => p.is_fake);

    if (screen.type === "math") {
      if (!startedAt) return;
      const elapsed = serverNow() - Date.parse(startedAt);
      for (const p of fakes) {
        if (answersRef.current.math?.[p.id]?.done) continue;
        for (const step of botMathPlan()) {
          const wait = step.atMs - elapsed;
          if (wait < 0) continue;
          timers.push(
            setTimeout(() => {
              void backend
                .upsertAnswers([
                  { room_id: room.id, player_id: p.id, question: "math", value: { correct: step.correct, ms: step.atMs, done: step.done } },
                ])
                .catch(() => {});
            }, wait),
          );
        }
      }
    } else {
      for (const p of fakes) {
        keys.forEach((key, k) => {
          if (answersRef.current[key]?.[p.id]) return;
          const spread = screen.type === "pulse" ? 14000 : isQuiz(screen) ? QUIZ_MS - 3000 : 6500;
          const wait = 600 + Math.random() * spread + k * 2500;
          timers.push(
            setTimeout(() => {
              const value =
                key === "pulse_before" || key === "pulse_after"
                  ? botPulse(key, answersRef.current.pulse_before?.[p.id]?.bpm)
                  : botChoice(key, serverNow());
              void backend.upsertAnswers([{ room_id: room.id, player_id: p.id, question: key, value }]).catch(() => {});
            }, wait),
          );
        });
      }
    }
    return () => timers.forEach(clearTimeout);
  }, [enabled, room, backend, screenIdx, startedAt, locked, fakeCount]);
}
