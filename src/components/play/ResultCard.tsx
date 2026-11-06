"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Backend } from "@/lib/backend";
import { burst } from "@/lib/confetti";
import { finaleTimeline } from "@/lib/finale";
import { useNow } from "@/hooks/useNow";
import { MAX_SCORE, rankPlayers, tierFor, type Ranked } from "@/lib/scoring";
import { indexAnswers, type Player } from "@/lib/types";
import { BaldHead } from "../BaldHead";
import { cx, DISCLAIMER } from "../ui";
import { Waiting } from "./Waiting";

interface Props {
  backend: Backend;
  roomId: string;
  player: Player;
  startedAt: string | null;
}

/** The phone's personal finale card. Holds back until the big-screen reveal finishes. */
export function ResultCard({ backend, roomId, player, startedAt }: Props) {
  const [data, setData] = useState<{ me: Ranked; total: number } | null>(null);
  const now = useNow(!!startedAt, 250);

  useEffect(() => {
    if (!startedAt) return;
    let cancelled = false;
    void Promise.all([backend.listPlayers(roomId), backend.listAnswers(roomId)]).then(([ps, as]) => {
      if (cancelled) return;
      const ranked = rankPlayers(ps, indexAnswers(as));
      const me = ranked.find((r) => r.player.id === player.id);
      if (me) setData({ me, total: ranked.length });
    });
    return () => {
      cancelled = true;
    };
  }, [backend, roomId, player.id, startedAt]);

  const ready = !!startedAt && !!data && now - Date.parse(startedAt) >= finaleTimeline(data.total).totalMs;

  useEffect(() => {
    if (ready) burst();
  }, [ready]);

  if (!startedAt) return <Waiting emoji={player.emoji} title="Calculating your follicle forecast…" sub="Drumroll on the big screen" />;
  if (!ready || !data) return <Waiting emoji="🥁" title="Eyes on the big screen!" sub="Your result drops after the reveal" />;

  const { me, total } = data;
  const tier = tierFor(me.result.score);

  return (
    <motion.div initial={{ y: 60, opacity: 0, rotate: 3 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ type: "spring", damping: 14 }} className="flex flex-1 flex-col">
      <div className="rounded-[28px] border-4 border-ink bg-paper p-5 text-center shadow-hard-lg">
        <div className="font-mono text-xs font-bold uppercase tracking-widest">Official follicle report · {player.nickname}</div>
        <div className="mt-3 flex justify-center">
          <BaldHead score={me.result.score} size={170} emoji={player.emoji} recede delay={0.4} />
        </div>
        <div className="mt-2 text-4xl" aria-hidden>{tier.emoji}</div>
        <h1 className="text-[2.1rem] font-extrabold leading-none tracking-tight" style={{ color: tier.color }}>
          {tier.name}
        </h1>
        <p className="mt-2 font-marker text-lg leading-snug text-pen">{tier.blurb}</p>
        <div className="mt-3 font-mono text-sm font-bold">
          {me.result.score}/{MAX_SCORE} bald points · #{me.rank} of {total} closest to bald
        </div>
        <ul className="mt-4 space-y-1.5 text-left">
          {me.result.factors.map((f) => (
            <li key={f.key} className={cx("flex items-center gap-3 rounded-xl border-2 border-ink px-3 py-1.5 text-base font-bold", f.hit ? "bg-ink text-gold" : "bg-paper opacity-60")}>
              <span className="w-5 text-center">{f.hit ? "✗" : "✓"}</span>
              <span className="flex-1">{f.label}</span>
              <span>{f.emoji}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-4 text-center font-mono text-xs font-bold opacity-70">{DISCLAIMER}</p>
    </motion.div>
  );
}
