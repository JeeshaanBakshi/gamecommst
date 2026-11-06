"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SCREENS } from "@/lib/flow";
import type { GameState } from "@/lib/types";
import { cx } from "../ui";

interface Props {
  state: GameState;
  muted: boolean;
  onPrev: () => void;
  onNext: () => void;
  onReveal: () => void;
  onLock: () => void;
  onMute: () => void;
  onReset: () => void;
  onJump: (i: number) => void;
}

/** Presenter controls. Fades out when the mouse is idle so the audience sees a clean screen. */
export function HostControls(p: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const wake = () => {
      setVisible(true);
      clearTimeout(t);
      t = setTimeout(() => setVisible(false), 2500);
    };
    wake();
    window.addEventListener("mousemove", wake);
    return () => {
      clearTimeout(t);
      window.removeEventListener("mousemove", wake);
    };
  }, []);

  const btn = "rounded-lg border-2 border-ink px-3 py-1.5 font-mono text-sm font-bold active:scale-95";
  const on = (active: boolean) => (active ? "bg-ink text-gold" : "bg-paper hover:bg-gold-pale");

  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
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
      <button className={cx(btn, on(false))} onClick={p.onReset} title="Remove all players and answers">Reset room</button>
    </motion.div>
  );
}
