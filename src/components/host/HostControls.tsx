"use client";

import { SCREENS } from "@/lib/flow";
import type { GameState } from "@/lib/types";
import { cx } from "../ui";

/** Height of the docked control strip. The slide is scaled to fit above it. */
export const CONTROLS_H = 52;

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
  onHide: () => void;
}

/** Presenter controls, docked in their own strip under the slide so they never cover it. Press H to hide. */
export function HostControls(p: Props) {
  const btn = "rounded-lg border-2 border-gold/60 px-3 py-1 font-mono text-sm font-bold active:scale-95";
  const on = (active: boolean) => (active ? "bg-gold text-ink border-gold" : "bg-ink text-gold hover:bg-ink-soft");

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-2 border-t-2 border-gold/40 bg-ink px-3"
      style={{ height: CONTROLS_H }}
    >
      <button className={cx(btn, on(false))} onClick={p.onPrev} title="Previous (←)">◀</button>
      <select
        className="rounded-lg border-2 border-gold/60 bg-ink px-2 py-1 font-mono text-sm font-bold text-gold"
        value={p.state.screen}
        onChange={(e) => p.onJump(Number(e.target.value))}
        title="Jump to screen"
      >
        {SCREENS.map((s, i) => (
          <option key={s.id} value={i}>
            {i + 1}/{SCREENS.length} · {s.id}
          </option>
        ))}
      </select>
      <button className={cx(btn, on(false))} onClick={p.onNext} title="Next (→ / space)">▶</button>
      <button className={cx(btn, on(p.state.revealed))} onClick={p.onReveal} title="Reveal (R)">Reveal</button>
      <button className={cx(btn, on(p.state.locked))} onClick={p.onLock} title="Lock (L)">{p.state.locked ? "🔒" : "🔓"}</button>
      <button className={cx(btn, on(false))} onClick={p.onMute} title="Mute (M)">{p.muted ? "🔇" : "🔊"}</button>
      <button className={cx(btn, on(false))} onClick={p.onReset} title="Remove all players and answers">Reset room</button>
      <button className={cx(btn, on(false))} onClick={p.onHide} title="Hide this bar (H)">Hide bar · H</button>
    </div>
  );
}
