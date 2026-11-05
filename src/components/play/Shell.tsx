"use client";

import type { ReactNode } from "react";
import type { ConnStatus, Player } from "@/lib/types";
import { StatusDot } from "../ui";

export function Shell({ player, status, children }: { player?: Player | null; status?: ConnStatus; children: ReactNode }) {
  return (
    <div className="bg-grid flex min-h-[100dvh] flex-col" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <header
        className="flex items-center justify-between border-b-[3px] border-ink bg-ink px-4 py-3 text-gold"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <span className="font-extrabold tracking-tight">
          The Waterloo Effect<span className="text-pen">.</span>
        </span>
        {player && (
          <span className="flex min-w-0 items-center gap-2 font-mono text-sm font-bold">
            {status && <StatusDot status={status} />}
            <span className="text-xl">{player.emoji}</span>
            <span className="max-w-[9rem] truncate">{player.nickname}</span>
          </span>
        )}
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-5">{children}</main>
    </div>
  );
}

export function Prompt({ kicker, children }: { kicker?: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      {kicker && <div className="font-mono text-xs font-bold uppercase tracking-widest opacity-70">{kicker}</div>}
      <h1 className="mt-1 text-[2rem] font-extrabold leading-[1.05] tracking-tight">{children}</h1>
    </div>
  );
}

export function Banner({ tone = "ink", children }: { tone?: "ink" | "pen" | "paper"; children: ReactNode }) {
  const t = { ink: "bg-ink text-gold", pen: "bg-pen text-paper", paper: "bg-paper text-ink" }[tone];
  return <div className={`rounded-2xl border-[3px] border-ink px-4 py-3 text-center font-extrabold shadow-hard-sm ${t}`}>{children}</div>;
}
