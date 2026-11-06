"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { FOCUS_MS } from "@/lib/flow";
import type { AnswerValue } from "@/lib/types";
import { cx } from "../ui";
import { Banner } from "./Shell";

const NOTIFICATIONS = [
  { icon: "📸", app: "Snapchat", text: "New snap from Jacob", color: "#FFFC00" },
  { icon: "🔥", app: "", text: "Your streak is about to end!", color: "#FF9500" },
  { icon: "💬", app: "Mom", text: "call me when you're free", color: "#34C759" },
  { icon: "📢", app: "CS 135", text: "Midterm cancelled 🎉", color: "#4C8BF5" },
  { icon: "🛍️", app: "Uber Eats", text: "50% off, 10 min only", color: "#06C167" },
];

type Phase = "ready" | "holding" | "failed" | "done";

interface Props {
  startedAt: string | null;
  revealed: boolean;
  saved?: AnswerValue;
  onUpdate: (v: AnswerValue) => Promise<void>;
}

const R = 118;
const CIRC = 2 * Math.PI * R;

/**
 * Hold the button for 15s while fake notifications try to pull you away.
 * Letting go, tapping a notification, a cancelled touch or leaving the app = distracted.
 */
export function FocusChallenge({ startedAt, revealed, saved, onUpdate }: Props) {
  const initial: Phase = saved?.focus === "done" ? "done" : saved?.focus ? "failed" : "ready";
  const [phase, setPhase] = useState<Phase>(initial);
  const [heldMs, setHeldMs] = useState(saved?.ms ?? 0);
  const [reason, setReason] = useState<string | null>(saved?.focus === "holding" ? "Left the game" : null);
  const [toast, setToast] = useState<(typeof NOTIFICATIONS)[number] & { id: number } | null>(null);
  const [progress, setProgress] = useState(0);

  // Host pressed Redo: my saved result was cleared, so go back to the hold button.
  const [prevSaved, setPrevSaved] = useState(saved);
  if (saved !== prevSaved) {
    setPrevSaved(saved);
    if (!saved && (phase === "failed" || phase === "done")) {
      setPhase("ready");
      setHeldMs(0);
      setReason(null);
      setProgress(0);
    }
  }

  const phaseRef = useRef<Phase>(initial);
  const startRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const raf = useRef(0);
  // Writes go out strictly in order (holding → failed/done), even on slow Wi-Fi.
  const queue = useRef<Promise<void>>(Promise.resolve());
  const send = useCallback((v: AnswerValue) => {
    queue.current = queue.current.then(() => onUpdate(v)).catch(() => {});
  }, [onUpdate]);

  // A phone that reloaded mid-hold counts as distracted (one attempt only).
  useEffect(() => {
    if (saved?.focus === "holding") send({ focus: "failed", ms: saved.ms ?? 0 });
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    cancelAnimationFrame(raf.current);
    setToast(null);
  };

  const fail = useCallback(
    (why: string) => {
      if (phaseRef.current !== "holding") return;
      const ms = Math.min(FOCUS_MS, Math.round(performance.now() - startRef.current));
      phaseRef.current = "failed";
      stopAll();
      setPhase("failed");
      setHeldMs(ms);
      setReason(why);
      try {
        navigator.vibrate?.([60, 40, 60]);
      } catch {}
      send({ focus: "failed", ms });
    },
    [send],
  );

  const succeed = useCallback(() => {
    if (phaseRef.current !== "holding") return;
    phaseRef.current = "done";
    stopAll();
    setPhase("done");
    setHeldMs(FOCUS_MS);
    setProgress(1);
    send({ focus: "done", ms: FOCUS_MS });
  }, [send]);

  const begin = () => {
    phaseRef.current = "holding";
    startRef.current = performance.now();
    setPhase("holding");
    setProgress(0);
    send({ focus: "holding", ms: 0 });

    // fake notifications every ~2–4s, in a random order
    const order = [...NOTIFICATIONS].sort(() => Math.random() - 0.5);
    let t = 1200 + Math.random() * 1200;
    order.forEach((n, i) => {
      if (t > FOCUS_MS - 600) return;
      timers.current.push(
        setTimeout(() => {
          setToast({ ...n, id: i });
          try {
            navigator.vibrate?.(30);
          } catch {}
        }, t),
      );
      t += 2000 + Math.random() * 2000;
    });
    timers.current.push(setTimeout(succeed, FOCUS_MS));

    const tick = () => {
      const p = Math.min(1, (performance.now() - startRef.current) / FOCUS_MS);
      setProgress(p);
      if (p < 1 && phaseRef.current === "holding") raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  /*
   * Touchscreens: follow the finger with real touch events and block the phone's own
   * scroll / long-press gestures. Browsers can fire a spurious "pointercancel" during a long
   * press even though the finger never left the screen, so on touch we only fail when the
   * finger actually lifts (touchend) or the OS interrupts the touch (touchcancel).
   */
  const buttonRef = useRef<HTMLButtonElement>(null);
  const latest = useRef({ canStart: false, begin, fail });
  useEffect(() => {
    latest.current = { canStart: !!startedAt && !revealed && phase === "ready", begin, fail };
  });
  const showButton = phase === "ready" || phase === "holding";
  useEffect(() => {
    const el = buttonRef.current;
    if (!showButton || !el) return;
    const onStart = (e: TouchEvent) => {
      e.preventDefault();
      if (latest.current.canStart && phaseRef.current !== "holding") latest.current.begin();
    };
    const onMove = (e: TouchEvent) => e.preventDefault();
    const onEnd = (e: TouchEvent) => {
      if (e.targetTouches.length === 0) latest.current.fail("Let go");
    };
    const onCancel = () => latest.current.fail("Touch interrupted");
    el.addEventListener("touchstart", onStart, { passive: false });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onCancel);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onCancel);
    };
  }, [showButton]);

  // Switching apps / locking the phone mid-hold = distracted.
  useEffect(() => {
    const onHide = () => document.visibilityState === "hidden" && fail("Left the app");
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("blur", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("blur", onHide);
      timers.current.forEach(clearTimeout);
      cancelAnimationFrame(raf.current);
    };
  }, [fail]);

  const canStart = !!startedAt && !revealed && phase === "ready";
  const holding = phase === "holding";
  const left = Math.max(0, (FOCUS_MS / 1000) * (1 - progress));

  return (
    <div className="flex flex-1 select-none flex-col" style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none" }}>
      {/* fake notification */}
      <AnimatePresence>
        {toast && holding && (
          <motion.div
            key={toast.id}
            initial={{ y: -260, opacity: 0, rotate: 0 }}
            animate={{ y: 0, opacity: 1, rotate: [0, 0, -2, 2, -1.5, 1, 0] }}
            exit={{ y: -260, opacity: 0 }}
            transition={{ y: { type: "spring", damping: 18, stiffness: 240 }, rotate: { duration: 0.7, delay: 0.25 } }}
            onPointerDown={(e) => {
              e.stopPropagation();
              fail("Tapped a notification");
            }}
            className="fixed inset-x-3 top-3 z-50 cursor-pointer rounded-[28px] bg-white px-5 pb-4 pt-5 shadow-2xl ring-1 ring-black/10"
            style={{ marginTop: "env(safe-area-inset-top)", touchAction: "none" }}
          >
            <div className="flex items-center gap-4">
              <span className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-2xl text-[2.6rem] shadow-inner" style={{ background: toast.color }}>
                {toast.icon}
              </span>
              <div className="min-w-0 flex-1 text-left leading-tight">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xl font-extrabold">{toast.app || "Notification"}</span>
                  <span className="text-sm text-ink/50">now</span>
                </div>
                <div className="mt-1 text-2xl font-bold">{toast.text}</div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-ink py-3 text-center text-xl font-extrabold text-gold">Open →</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center">
        <h1 className="text-[2.2rem] font-extrabold leading-none tracking-tight">Focus Challenge 🧠</h1>
        <p className="mt-3 text-lg font-bold leading-snug">Hold the button for 15 seconds. Don&apos;t let go. Don&apos;t tap anything.</p>
      </div>

      <div className="flex flex-1 items-center justify-center py-6">
        {phase === "failed" ? (
          <ResultCard tone="pen" title={`❌ Distracted after ${(heldMs / 1000).toFixed(1)}s`} sub={reason ?? undefined} />
        ) : phase === "done" ? (
          <ResultCard tone="ink" title="✅ Locked in." sub="15 seconds of pure focus." />
        ) : (
          <button
            type="button"
            disabled={!canStart && !holding}
            ref={buttonRef}
            onPointerDown={(e) => {
              if (e.pointerType === "touch" || !canStart) return; // touch is handled by the touch listeners
              e.preventDefault();
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {}
              begin();
            }}
            onPointerUp={(e) => e.pointerType !== "touch" && fail("Let go")}
            onPointerCancel={(e) => e.pointerType !== "touch" && fail("Interrupted")}
            onPointerLeave={(e) => e.pointerType !== "touch" && fail("Let go")}
            onContextMenu={(e) => e.preventDefault()}
            className={cx("relative h-[280px] w-[280px] rounded-full outline-none", !canStart && !holding && "opacity-50")}
            style={{ touchAction: "none", userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" }}
            aria-label="Hold to focus"
          >
            <svg viewBox="0 0 280 280" className="absolute inset-0 h-full w-full -rotate-90">
              <circle cx="140" cy="140" r={R} fill={holding ? "#111111" : "#fffcef"} stroke="#111111" strokeWidth="14" />
              <circle
                cx="140"
                cy="140"
                r={R}
                fill="none"
                stroke="#2f9e44"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC * (1 - progress)}
              />
            </svg>
            <span className={cx("relative grid h-full place-items-center px-10 text-center font-extrabold", holding ? "text-gold" : "text-ink")}>
              {holding ? (
                <span>
                  <span className="block text-6xl tabular-nums">{left.toFixed(1)}</span>
                  <span className="mt-1 block font-mono text-sm uppercase tracking-widest">keep holding</span>
                </span>
              ) : (
                <span className="text-3xl leading-tight">HOLD TO FOCUS</span>
              )}
            </span>
          </button>
        )}
      </div>

      <div className="pb-2">
        {!startedAt && phase === "ready" && <Banner tone="paper">⏳ Wait for the host to start the round…</Banner>}
        {startedAt && phase === "ready" && !revealed && <Banner>Press and hold the circle. Go!</Banner>}
        {revealed && phase === "ready" && <Banner tone="pen">⏰ Round over. Eyes on the big screen.</Banner>}
        {(phase === "failed" || phase === "done") && <Banner tone="paper">👀 Results are on the big screen</Banner>}
      </div>
    </div>
  );
}

function ResultCard({ tone, title, sub }: { tone: "pen" | "ink"; title: string; sub?: string }) {
  return (
    <motion.div
      initial={{ scale: 0.5, rotate: -8, opacity: 0 }}
      animate={{ scale: 1, rotate: -2, opacity: 1 }}
      transition={{ type: "spring", damping: 10 }}
      className={cx(
        "w-full rounded-3xl border-4 border-ink px-6 py-10 text-center shadow-hard-lg",
        tone === "pen" ? "bg-pen text-paper" : "bg-ink text-gold",
      )}
    >
      <div className="text-[2rem] font-extrabold leading-tight">{title}</div>
      {sub && <div className="mt-2 font-mono text-sm font-bold uppercase tracking-widest opacity-90">{sub}</div>}
    </motion.div>
  );
}
