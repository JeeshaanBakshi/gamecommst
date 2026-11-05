"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SCREENS } from "@/lib/flow";
import type { GameState } from "@/lib/types";
import { cx } from "../ui";

interface Props {
  state: GameState;
  muted: boolean;
  demo: boolean;
  fakeCount: number;
  onPrev: () => void;
  onNext: () => void;
  onReveal: () => void;
  onLock: () => void;
  onMute: () => void;
  onDemo: () => void;
  onSeed: () => void;
  onReset: () => void;
  onNewRoom: () => void;
  onJump: (i: number) => void;
}

/** Presenter controls. Fades out when the mouse is idle so the audience sees a clean screen. */
export function HostControls(p: Props) {
  const [visible, setVisible] = useState(true);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const wake = () => {
      setVisible(true);
      clearTimeout(t);
      t = setTimeout(() => setVisible(false), 2500);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "?") setHelp((h) => !h);
      if (e.key === "Escape") setHelp(false);
    };
    wake();
    window.addEventListener("mousemove", wake);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const btn = "rounded-lg border-2 border-ink px-3 py-1.5 font-mono text-sm font-bold active:scale-95";
  const on = (active: boolean) => (active ? "bg-ink text-gold" : "bg-paper hover:bg-gold-pale");

  return (
    <>
      <motion.div
        animate={{ opacity: visible || help ? 1 : 0, y: visible || help ? 0 : 20 }}
        className="fixed bottom-4 right-4 z-50 flex max-w-[95vw] flex-wrap items-center gap-2 rounded-2xl border-[3px] border-ink bg-gold p-2 shadow-hard"
      >
        <button className={cx(btn, on(false))} onClick={p.onPrev} title="Previous (←)">◀</button>
        <select
          className="rounded-lg border-2 border-ink bg-paper px-2 py-1.5 font-mono text-sm font-bold"
          value={p.state.screen}
          onChange={(e) => p.onJump(Number(e.target.value))}
          title="Jump to screen"
        >
          {SCREENS.map((s, i) => (
            <option key={s.id} value={i}>
              {i + 1}. {s.id}
            </option>
          ))}
        </select>
        <button className={cx(btn, on(false))} onClick={p.onNext} title="Next (→ / space)">▶</button>
        <button className={cx(btn, on(p.state.revealed))} onClick={p.onReveal} title="Reveal (R)">Reveal</button>
        <button className={cx(btn, on(p.state.locked))} onClick={p.onLock} title="Lock (L)">{p.state.locked ? "🔒" : "🔓"}</button>
        <button className={cx(btn, on(false))} onClick={p.onMute} title="Mute (M)">{p.muted ? "🔇" : "🔊"}</button>
        <span className="mx-1 h-6 w-[2px] bg-ink" />
        <button className={cx(btn, on(false))} onClick={p.onSeed} title="Add 30 fake players">+30 fake</button>
        <button className={cx(btn, on(p.demo))} onClick={p.onDemo} title="Fake players answer automatically (D)">
          🤖 Bots {p.demo ? "on" : "off"}
        </button>
        <button className={cx(btn, on(false))} onClick={p.onReset} title="Wipe players + answers">Reset room</button>
        <button className={cx(btn, on(help))} onClick={() => setHelp((h) => !h)}>?</button>
      </motion.div>

      <AnimatePresence>
        {help && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-20 right-4 z-50 w-[380px] rounded-2xl border-[3px] border-ink bg-paper p-5 font-mono text-sm shadow-hard"
          >
            <div className="mb-2 text-lg font-bold">Presenter keys</div>
            <dl className="grid grid-cols-[110px_1fr] gap-y-1">
              <dt className="font-bold">→ / Space</dt><dd>Next (reveals results first, starts timers)</dd>
              <dt className="font-bold">←</dt><dd>Previous screen</dd>
              <dt className="font-bold">R</dt><dd>Reveal results / start reveal</dd>
              <dt className="font-bold">L</dt><dd>Lock / unlock answers</dd>
              <dt className="font-bold">M</dt><dd>Mute sounds</dd>
              <dt className="font-bold">D</dt><dd>Toggle demo bots</dd>
              <dt className="font-bold">F</dt><dd>Fullscreen</dd>
              <dt className="font-bold">?</dt><dd>This help</dd>
            </dl>
            <p className="mt-3 opacity-70">Clickers work too (PageUp / PageDown). Click a player in the lobby to remove them.</p>
            <p className="mt-2 opacity-70">{p.fakeCount} fake players in room.</p>
            <button className={cx(btn, on(false), "mt-3")} onClick={p.onNewRoom}>Start a brand-new room</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
