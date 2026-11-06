"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useHostGame } from "@/hooks/useHostGame";
import { useWakeLock } from "@/hooks/useWakeLock";
import { burst } from "@/lib/confetti";
import { serverNow } from "@/lib/clock";
import { publicSiteUrl } from "@/lib/env";
import { FOCUS_MS, isQuiz, QUIZ_MS, roundAnswers, SCREENS, type Screen } from "@/lib/flow";
import { sfx } from "@/lib/sound";
import { CONTROLS_H, HostControls } from "./HostControls";
import { JoinBadge } from "./JoinBadge";
import { Stage } from "./Stage";
import { TopBar } from "./TopBar";
import { FinaleScreen } from "./screens/FinaleScreen";
import { FocusScreen } from "./screens/FocusScreen";
import { LobbyScreen } from "./screens/LobbyScreen";
import { QuestionScreen } from "./screens/QuestionScreen";
import { StudyScrollScreen } from "./screens/StudyScrollScreen";
import { TalkScreen } from "./screens/TalkScreen";
import { timelineSteps } from "./TimelineSlide";

export function HostApp() {
  const { room, state, players, answers, status, error, actions, backend } = useHostGame({ onJoin: () => sfx.join(), onAnswer: () => sfx.pop() });
  const [muted, setMuted] = useState(sfx.muted);
  const [showBar, setShowBar] = useState(true);
  useWakeLock();

  const toggleMute = () => {
    sfx.setMuted(!sfx.muted);
    setMuted(sfx.muted);
  };

  const confirmRedo = () => {
    if (window.confirm("Redo this question? Everyone's answers to it will be cleared and they can answer again.")) {
      void actions.redo();
    }
  };

  const confirmReset = () => {
    if (window.confirm("Reset the room? This removes every player and answer and sends phones back to the join screen.")) {
      void actions.reset();
    }
  };

  /* click-by-click reveals inside a slide (the timeline): → reveals the next item before moving on */
  const [inSlide, setInSlide] = useState<{ id: string; n: number }>({ id: "", n: 0 });
  const onScreen = state ? SCREENS[state.screen] : null;
  const onScreenId = onScreen?.id ?? "";
  const slideSteps = onScreen?.type === "talk" && onScreen.timeline ? timelineSteps(onScreen.timeline) : 0;
  const slideStep = inSlide.id === onScreenId ? inSlide.n : 0;
  const advance = () => {
    if (slideStep < slideSteps) {
      setInSlide({ id: onScreenId, n: slideStep + 1 });
      if (slideStep + 1 === slideSteps) sfx.ding();
      else sfx.pop();
    } else actions.next();
  };
  const back = () => {
    if (slideStep > 0) setInSlide({ id: onScreenId, n: slideStep - 1 });
    else actions.prev();
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
        advance();
      } else if (["arrowleft", "pageup", "backspace"].includes(k)) {
        e.preventDefault();
        back();
      } else if (k === "r") actions.reveal();
      else if (k === "l") actions.toggleLock();
      else if (k === "m") toggleMute();
      else if (k === "h") setShowBar((b) => !b);
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
  const startedAt = state?.started_at ?? null;
  // Only answers from the round that's running now (not leftovers from an earlier visit or a Redo).
  const live = current ? roundAnswers(current, answers, startedAt) : answers;
  const quizAnswered = quizKey ? Object.keys(live[quizKey] ?? {}).length : 0;
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

  /* Focus Challenge: show results once nobody is still holding after 15s (hard stop at 40s) */
  const focusOn = current?.type === "focus";
  const stillHolding = focusOn ? Object.values(live.focus ?? {}).filter((v) => v.focus === "holding").length : 0;
  const focusRevealedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!focusOn || revealed || !startedAt || focusRevealedFor.current === startedAt) return;
    const start = Date.parse(startedAt);
    const deadline = stillHolding > 0 ? start + 40_000 : start + FOCUS_MS + 2_500;
    const t = setTimeout(() => {
      focusRevealedFor.current = startedAt;
      actions.reveal();
    }, Math.max(0, deadline - serverNow()));
    return () => clearTimeout(t);
  }, [focusOn, revealed, startedAt, stillHolding, actions]);

  if (error && !room)
    return (
      <Fullscreen
        msg={`Couldn't start the room: ${error}`}
        hint={
          /schema cache|does not exist|relation/i.test(error)
            ? "The database tables don't exist yet. In Supabase: SQL Editor → New query → paste ALL of supabase/schema.sql from the repo → Run. Then refresh this page."
            : "Check that supabase/schema.sql was run in the Supabase SQL Editor and that the two NEXT_PUBLIC_SUPABASE_* environment variables are set."
        }
      />
    );
  if (!room || !state) return <Fullscreen msg="Setting up the room…" />;

  const screen = SCREENS[state.screen] ?? SCREENS[0];
  const joinUrl = `${publicSiteUrl()}/play?room=${room.code}`;

  return (
    <>
      <Stage bottom={showBar ? CONTROLS_H : 0}>
        {screen.type !== "lobby" && !(screen.type === "talk" && screen.wall) && (
          <TopBar screen={screen} code={room.code} joinUrl={joinUrl} playerCount={players.length} status={status} />
        )}
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
      {showBar && (
      <HostControls
        state={state}
        muted={muted}
        onPrev={back}
        onNext={advance}
        onReveal={actions.reveal}
        onLock={actions.toggleLock}
        onMute={toggleMute}
        onReset={confirmReset}
        onRedo={confirmRedo}
        onJump={actions.goTo}
        onHide={() => setShowBar(false)}
      />
      )}
    </>
  );

  function renderScreen(s: Screen) {
    switch (s.type) {
      case "lobby":
        return <LobbyScreen code={room!.code} joinUrl={joinUrl} players={players} onKick={(id) => void actions.kick(id)} localMode={backend.mode === "local"} />;
      case "talk":
        return <TalkScreen s={s} step={slideStep} corner={<JoinBadge url={joinUrl} code={room!.code} />} />;
      case "question":
        return <QuestionScreen q={s.q} answers={live} players={players} revealed={state!.revealed} locked={state!.locked} startedAt={state!.started_at} />;
      case "double":
        return <StudyScrollScreen answers={answers} playerCount={players.length} revealed={state!.revealed} locked={state!.locked} />;
      case "focus":
        return <FocusScreen players={players} answers={live} startedAt={state!.started_at} revealed={state!.revealed} />;
      case "finale":
        return <FinaleScreen startedAt={state!.started_at} players={players} answers={answers} />;
    }
  }
}

function Fullscreen({ msg, hint }: { msg: string; hint?: string }) {
  return (
    <div className="bg-grid fixed inset-0 grid place-items-center p-10 text-center">
      <div>
        <div className="text-5xl font-extrabold">{msg}</div>
        {hint && <p className="mx-auto mt-6 max-w-3xl font-mono text-xl font-bold">{hint}</p>}
      </div>
    </div>
  );
}
