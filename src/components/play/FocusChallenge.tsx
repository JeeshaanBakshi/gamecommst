"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { FOCUS_MS } from "@/lib/flow";
import type { AnswerValue } from "@/lib/types";
import { cx } from "../ui";
import { Banner } from "./Shell";

const NOTIFICATIONS = [
  { icon: "📸", app: "Snapchat", text: "New snap from Jacob" },
  { icon: "🔥", app: "", text: "Your streak is about to end!" },
  { icon: "💬", app: "Mom", text: "call me when you're free" },
  { icon: "📊", app: "CS 135", text: "Grades released" },
  { icon: "🛍️", app: "Uber Eats", text: "50% off, 10 min only" },
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
            initial={{ y: -140, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -140, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 260 }}
            onPointerDown={(e) => {
              e.stopPropagation();
              fail("Tapped a notification");
            }}
            className="fixed inset-x-2 top-2 z-50 flex cursor-pointer items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-xl ring-1 ring-black/10 backdrop-blur"
            style={{ marginTop: "env(safe-area-inset-top)", touchAction: "none" }}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink/5 text-2xl">{toast.icon}</span>
            <div className="min-w-0 flex-1 text-left leading-tight">
              {toast.app && <div className="text-sm font-extrabold">{toast.app}</div>}
              <div className="truncate text-sm font-medium">{toast.text}</div>
            </div>
            <span className="self-start text-xs text-ink/50">now</span>
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
            onPointerDown={(e) => {
              if (!canStart) return;
              e.preventDefault();
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {}
              begin();
            }}
            onPointerUp={() => fail("Let go")}
            onPointerCancel={() => fail("Touch interrupted")}
            onPointerLeave={() => fail("Let go")}
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
