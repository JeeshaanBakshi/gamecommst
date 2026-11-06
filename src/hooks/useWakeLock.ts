"use client";

import { useEffect } from "react";

/** Keeps the screen from dimming/sleeping while the game is open (where the browser supports it). */
export function useWakeLock(active = true) {
  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const request = async () => {
      try {
        const l = await navigator.wakeLock.request("screen");
        if (cancelled) void l.release().catch(() => {});
        else lock = l;
      } catch {
        // not allowed right now (e.g. tab hidden); we retry when it becomes visible
      }
    };
    void request();
    const onVisible = () => document.visibilityState === "visible" && void request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release().catch(() => {});
    };
  }, [active]);
}
