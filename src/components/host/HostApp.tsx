"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useDemoBots } from "@/hooks/useDemoBots";
import { useHostGame } from "@/hooks/useHostGame";
import { burst } from "@/lib/confetti";
import { serverNow } from "@/lib/clock";
import { isQuiz, QUIZ_MS, SCREENS, type Screen } from "@/lib/flow";
import { sfx } from "@/lib/sound";
import { HostControls } from "./HostControls";
import { Stage } from "./Stage";
import { TopBar } from "./TopBar";
import { FinaleScreen } from "./screens/FinaleScreen";
import { LobbyScreen } from "./screens/LobbyScreen";
import { MathScreen } from "./screens/MathScreen";
import { QuestionScreen } from "./screens/QuestionScreen";
import { StressResultsScreen } from "./screens/StressResultsScreen";
import { StudyScrollScreen } from "./screens/StudyScrollScreen";
import { TalkScreen } from "./screens/TalkScreen";

export function HostApp() {
  const game = useHostGame({ onJoin: () => sfx.join(), onAnswer: () => sfx.pop() });
  const { room, state, players, answers, status, error, actions, backend } = game;
  const [muted, setMuted] = useState(sfx.muted);
  const [demo, setDemo] = useState(false);
  useDemoBots(game, demo);

  const toggleMute = () => {
    sfx.setMuted(!sfx.muted);
    setMuted(sfx.muted);
  };

  const confirmReset = () => {
    if (window.confirm("Reset the room? This removes every player and answer and sends phones back to the join screen.")) {
      setDemo(false);
      void actions.reset();
    }
  };

  /* keyboard + clicker */
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    keyRef.current = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA" || e.metaKey || e.ctrlKey || e.altKey) return;
      sfx.unlock();
      const k = e.key.toLowerCase();
      if (["arrowright", " ", "pagedown", "enter"].includes(k)) {
        e.preventDefault();
        actions.next();
      } else if (["arrowleft", "pageup", "backspace"].includes(k)) {
        e.preventDefault();
        actions.prev();
      } else if (k === "r") actions.reveal();
      else if (k === "l") actions.toggleLock();
      else if (k === "m") toggleMute();
      else if (k === "d") setDemo((d) => !d);
      else if (k === "f") {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen?.().catch(() => {});
      }
    };
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => keyRef.current(e);
    const unlock = () => sfx.unlock();
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", unlock);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", unlock);
    };
  }, []);

  /* juice on transitions */
  const screenIdx = state?.screen ?? 0;
  const revealed = state?.revealed ?? false;
  const prevScreen = useRef(screenIdx);
  useEffect(() => {
    if (prevScreen.current !== screenIdx) sfx.whoosh();
    prevScreen.current = screenIdx;
  }, [screenIdx]);
  const prevRevealed = useRef(revealed);
  useEffect(() => {
    if (revealed && !prevRevealed.current) {
      sfx.ding();
      burst();
    }
    prevRevealed.current = revealed;
  }, [revealed]);

  /* quizzes reveal themselves when the clock runs out or everyone has answered */
  const current = state ? SCREENS[state.screen] : null;
  const quizKey = current && isQuiz(current) ? current.q.key : null;
  const quizAnswered = quizKey ? Object.keys(answers[quizKey] ?? {}).length : 0;
  const startedAt = state?.started_at ?? null;
  const autoRevealed = useRef<string | null>(null);
  useEffect(() => {
    if (!quizKey || revealed || !startedAt || autoRevealed.current === startedAt) return;
    const everyone = players.length > 0 && quizAnswered >= players.length;
    const wait = everyone ? 700 : Math.max(0, Date.parse(startedAt) + QUIZ_MS - serverNow());
    const t = setTimeout(() => {
      autoRevealed.current = startedAt;
      actions.reveal();
    }, wait);
    return () => clearTimeout(t);
  }, [quizKey, revealed, startedAt, quizAnswered, players.length, actions]);

  if (error && !room) return <Fullscreen msg={`Couldn't start the room: ${error}`} />;
  if (!room || !state) return <Fullscreen msg="Setting up the room…" />;

  const screen = SCREENS[state.screen] ?? SCREENS[0];
  const base = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, "");
  const joinUrl = `${base}/play?room=${room.code}`;
  const dark = screen.type === "talk" && !!screen.alert;

  return (
    <>
      <Stage dark={dark}>
        {screen.type !== "lobby" && <TopBar screen={screen} code={room.code} playerCount={players.length} status={status} dark={dark} />}
        <AnimatePresence mode="wait">
          <motion.div
            key={screen.id}
            className="absolute inset-0"
            initial={{ opacity: 0, x: 120 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -120 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {renderScreen(screen)}
          </motion.div>
        </AnimatePresence>
      </Stage>
      <HostControls
        state={state}
        muted={muted}
        demo={demo}
        fakeCount={players.filter((p) => p.is_fake).length}
        onPrev={actions.prev}
        onNext={actions.next}
        onReveal={actions.reveal}
        onLock={actions.toggleLock}
        onMute={toggleMute}
        onDemo={() => setDemo((d) => !d)}
        onSeed={() => {
          void actions.seedFakes();
          setDemo(true);
        }}
        onReset={confirmReset}
        onNewRoom={actions.newRoom}
        onJump={actions.goTo}
      />
    </>
  );

  function renderScreen(s: Screen) {
    const common = { answers, playerCount: players.length };
    switch (s.type) {
      case "lobby":
        return <LobbyScreen code={room!.code} joinUrl={joinUrl} players={players} onKick={(id) => void actions.kick(id)} localMode={backend.mode === "local"} />;
      case "talk":
        return <TalkScreen s={s} />;
      case "question":
        return <QuestionScreen q={s.q} answers={answers} players={players} revealed={state!.revealed} locked={state!.locked} startedAt={state!.started_at} />;
      case "double":
        return <StudyScrollScreen {...common} revealed={state!.revealed} locked={state!.locked} />;
      case "math":
        return <MathScreen startedAt={state!.started_at} players={players} answers={answers} />;
      case "stressResults":
        return <StressResultsScreen players={players} answers={answers} />;
      case "finale":
        return <FinaleScreen startedAt={state!.started_at} players={players} answers={answers} />;
    }
  }
}

function Fullscreen({ msg }: { msg: string }) {
  return (
    <div className="bg-grid fixed inset-0 grid place-items-center p-10 text-center">
      <div className="text-5xl font-extrabold">{msg}</div>
    </div>
  );
}
