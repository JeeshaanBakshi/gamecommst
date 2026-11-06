"use client";

import { useEffect } from "react";

/**
 * Shown instead of a blank page if something unexpected crashes.
 * A full reload is the safest recovery: the host and phones both resume from the database.
 */
export function CrashScreen({ error }: { error: unknown }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="bg-grid flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="text-7xl">🪿</div>
      <h1 className="text-4xl font-extrabold tracking-tight">Something glitched.</h1>
      <p className="max-w-sm text-lg font-bold">Tap reload. You&apos;ll jump straight back to where the game is.</p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-2xl border-[3px] border-ink bg-ink px-8 py-4 text-2xl font-extrabold text-gold shadow-hard active:scale-95"
      >
        Reload
      </button>
    </main>
  );
}
