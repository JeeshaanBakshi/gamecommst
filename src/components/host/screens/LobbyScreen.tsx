"use client";

import { AnimatePresence, motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { isLocalMachine, SUPABASE_SETUP_HINT } from "@/lib/env";
import type { Player } from "@/lib/types";
import { Card, Scribble, Sticker } from "../../ui";

interface Props {
  code: string;
  joinUrl: string;
  players: Player[];
  onKick: (id: string) => void;
  localMode: boolean;
}

/** Biggest square tile that fits n players in the ~1150×420 lobby area. */
function tileSize(n: number, w = 1150, h = 420, gap = 12) {
  for (let size = 150; size > 56; size -= 2) {
    const cols = Math.floor((w + gap) / (size + gap));
    if (Math.ceil(n / cols) * (size + gap) - gap <= h) return size;
  }
  return 56;
}

export function LobbyScreen({ code, joinUrl, players, onKick, localMode }: Props) {
  const n = players.length;
  const tile = tileSize(n);
  const shown = players.slice(-72);

  return (
    <div className="absolute inset-0 flex gap-14 p-14">
      {/* join card */}
      <Card className="flex w-[600px] shrink-0 -rotate-1 flex-col items-center p-10">
        <Sticker className="text-2xl">Scan to join</Sticker>
        <div className="mt-6 rounded-2xl border-4 border-ink bg-white p-5">
          <QRCodeSVG value={joinUrl} size={430} level="M" marginSize={0} fgColor="#111111" />
        </div>
        <div className="mt-8 font-mono text-2xl font-bold">or go to</div>
        <div className="mt-1 max-w-full truncate font-mono text-3xl font-bold underline decoration-pen decoration-4 underline-offset-4">
          {joinUrl.replace(/^https?:\/\//, "").replace(/\?room=.*/, "")}
        </div>
        <div className="mt-6 flex gap-3">
          {code.split("").map((c, i) => (
            <motion.span
              key={i}
              initial={{ y: 40, opacity: 0, rotate: -10 }}
              animate={{ y: 0, opacity: 1, rotate: i % 2 ? 3 : -3 }}
              transition={{ delay: 0.1 * i, type: "spring" }}
              className="grid h-28 w-24 place-items-center rounded-2xl border-4 border-ink bg-gold text-7xl font-extrabold shadow-hard"
            >
              {c}
            </motion.span>
          ))}
        </div>
        {localMode && (
          <p className="mt-6 text-center font-mono text-lg font-bold text-pen">
            {isLocalMachine()
              ? "LOCAL MODE: Supabase isn't configured, so only tabs in this browser can join."
              : `⚠ NOT CONNECTED TO SUPABASE. Phones can't join. ${SUPABASE_SETUP_HINT}`}
          </p>
        )}
      </Card>

      {/* title + players */}
      <div className="flex min-w-0 flex-1 flex-col">
        <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", damping: 16 }}>
          <div className="font-mono text-3xl font-bold uppercase tracking-[0.3em]">Live from exam season</div>
          <h1 className="mt-2 text-[150px] font-extrabold leading-[0.85] tracking-tight">
            The Waterloo
            <br />
            Effect<span className="text-pen">.</span>
          </h1>
          <div className="mt-4 inline-block">
            <div className="font-marker text-7xl text-pen">How Not to Go Bald</div>
            <Scribble className="mt-1" delay={0.6} />
          </div>
        </motion.div>

        <div className="mt-8 flex items-center gap-5">
          <span className="rounded-2xl border-4 border-ink bg-ink px-6 py-2 text-5xl font-extrabold text-gold tabular-nums">{n}</span>
          <span className="text-4xl font-extrabold">{n === 1 ? "student has" : "students have"} joined</span>
          {n === 0 && <span className="animate-blink font-mono text-3xl font-bold">waiting for victims…</span>}
        </div>

        <div className="relative mt-6 flex min-h-0 flex-1 flex-wrap content-start gap-3 overflow-hidden">
          <AnimatePresence>
            {shown.map((p, i) => (
              <motion.button
                key={p.id}
                layout
                title="Click to remove"
                onClick={() => onKick(p.id)}
                initial={{ scale: 0, rotate: -25, y: 40 }}
                animate={{ scale: 1, rotate: ((i * 37) % 9) - 4, y: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                whileHover={{ scale: 1.08 }}
                className="flex flex-col items-center justify-center rounded-2xl border-[3px] border-ink bg-paper shadow-hard-sm"
                style={{ width: tile, height: tile }}
              >
                <span style={{ fontSize: tile * 0.45 }} className="leading-none">
                  {p.emoji}
                </span>
                <span className="mt-1 w-full truncate px-2 text-center font-bold" style={{ fontSize: Math.max(13, tile * 0.13) }}>
                  {p.nickname}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
