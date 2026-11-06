"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback } from "react";
import { usePlayerGame } from "@/hooks/usePlayerGame";
import { serverNow } from "@/lib/clock";
import { SCREENS, type Screen } from "@/lib/flow";
import type { AnswerValue, QuestionKey } from "@/lib/types";
import { ChoiceList, ChoiceQuestion, SliderQuestion, Status } from "./Answering";
import { EnterCode, JoinForm } from "./JoinScreens";
import { MathTask } from "./MathTask";
import { QuizQuestion } from "./QuizQuestion";
import { ResultCard } from "./ResultCard";
import { Prompt, Shell } from "./Shell";
import { SpeakerScreen } from "./SpeakerScreen";
import { Waiting } from "./Waiting";

export function PlayApp() {
  const g = usePlayerGame();
  const { phase, room, state, player, mine, status, notice, backend } = g;
  const answer = g.answer;
  const save = useCallback((k: QuestionKey, v: AnswerValue) => void answer(k, v), [answer]);
  const saveMath = useCallback((v: AnswerValue) => save("math", v), [save]);

  if (phase === "loading") {
    return (
      <Shell>
        <Waiting emoji="🪿" title="Connecting…" />
      </Shell>
    );
  }
  if (phase === "enterCode") {
    return (
      <Shell>
        <EnterCode notice={notice} onSubmit={g.enterCode} />
      </Shell>
    );
  }
  if (phase === "join" || !player || !room || !state) {
    return (
      <Shell>
        <JoinForm code={room?.code ?? ""} notice={notice} onJoin={g.join} />
      </Shell>
    );
  }

  const screen = SCREENS[state.screen] ?? SCREENS[0];
  const { locked, revealed } = state;

  function body(s: Screen) {
    switch (s.type) {
      case "lobby":
        return <Waiting emoji={player!.emoji} title="You're in!" sub="Find your face on the big screen" />;
      case "talk":
        return <SpeakerScreen s={s} emoji={player!.emoji} />;
      case "question": {
        const v = mine[s.q.key]?.v;
        if (s.q.correct != null) {
          return (
            <QuizQuestion
              key={`${s.id}-${state!.started_at}`}
              q={s.q}
              value={v}
              locked={locked}
              revealed={revealed}
              startedAt={state!.started_at}
              onPick={(i) => save(s.q.key, { v: i, t: serverNow() })}
            />
          );
        }
        return s.q.kind === "slider" ? (
          <SliderQuestion key={s.id} q={s.q} value={v} locked={locked} revealed={revealed} onSubmit={(i) => save(s.q.key, { v: i })} />
        ) : (
          <ChoiceQuestion q={s.q} value={v} locked={locked} revealed={revealed} onPick={(i) => save(s.q.key, { v: i })} />
        );
      }
      case "double": {
        const [a, b] = s.qs;
        return (
          <div className="flex flex-1 flex-col">
            <Prompt kicker="Be honest. We can't check. (We can.)">{a.prompt}</Prompt>
            <ChoiceList compact q={a} value={mine[a.key]?.v} locked={locked} onPick={(i) => save(a.key, { v: i })} />
            <h2 className="mb-3 mt-6 text-[1.7rem] font-extrabold leading-tight">{b.prompt}</h2>
            <ChoiceList compact q={b} value={mine[b.key]?.v} locked={locked} onPick={(i) => save(b.key, { v: i })} />
            <div className="mt-5">
              <Status answered={mine[a.key] != null && mine[b.key] != null} locked={locked} revealed={revealed} />
            </div>
          </div>
        );
      }
      case "math":
        return <MathTask key={`${s.id}-${state!.started_at ?? "wait"}`} seed={room!.code} emoji={player!.emoji} startedAt={state!.started_at} saved={mine.math} onProgress={saveMath} />;
      case "stressResults": {
        const m = mine.math;
        return (
          <Waiting
            emoji={player!.emoji}
            title={m ? `You got ${m.correct ?? 0}/5` : "Results on the big screen!"}
            sub={m ? (m.correct === 5 ? "Perfect score. Your hairline thanks you 🧠" : "Eyes up for the leaderboard 👀") : undefined}
          />
        );
      }
      case "finale":
        return <ResultCard backend={backend} roomId={room!.id} player={player!} startedAt={state!.started_at} />;
    }
  }

  return (
    <Shell player={player} status={status}>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen.id}
          className="flex flex-1 flex-col"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.22 }}
        >
          {body(screen)}
        </motion.div>
      </AnimatePresence>
    </Shell>
  );
}
