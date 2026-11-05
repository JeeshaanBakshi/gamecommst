"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { AVATARS, cleanNickname, randomNickname } from "@/lib/avatars";
import { cx, SquishButton } from "../ui";
import { Banner } from "./Shell";

export function EnterCode({ notice, onSubmit }: { notice: string | null; onSubmit: (c: string) => void }) {
  const [code, setCode] = useState("");
  return (
    <form
      className="flex flex-1 flex-col justify-center gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (code.trim().length >= 4) onSubmit(code);
      }}
    >
      <h1 className="text-5xl font-extrabold leading-none tracking-tight">
        Got a room code<span className="text-pen">?</span>
      </h1>
      <p className="font-bold">It&apos;s on the big screen. Four letters.</p>
      {notice && <Banner tone="pen">{notice}</Banner>}
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4))}
        placeholder="ABCD"
        autoCapitalize="characters"
        autoComplete="off"
        className="w-full rounded-2xl border-4 border-ink bg-paper px-4 py-4 text-center font-mono text-5xl font-bold uppercase tracking-[0.4em] shadow-hard outline-none focus:bg-white"
      />
      <SquishButton type="submit" className="py-5 text-2xl" disabled={code.length < 4}>
        Let me in →
      </SquishButton>
    </form>
  );
}

export function JoinForm({ code, notice, onJoin }: { code: string; notice: string | null; onJoin: (nick: string, emoji: string) => Promise<void> }) {
  const [nick, setNick] = useState("");
  const [emoji, setEmoji] = useState(() => AVATARS[Math.floor(Math.random() * AVATARS.length)]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const clean = cleanNickname(nick);
    if (!clean) {
      setErr(nick.trim() ? "Let's keep it classroom friendly 🙃" : "Pick a nickname first!");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await onJoin(clean, emoji);
    } catch {
      setErr("Couldn't join. Wi-Fi moment? Try again.");
      setBusy(false);
    }
  };

  return (
    <form
      className="flex flex-1 flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <div>
        <div className="font-mono text-xs font-bold uppercase tracking-widest">Room {code}</div>
        <h1 className="mt-1 text-[2.6rem] font-extrabold leading-none tracking-tight">
          How not to go bald<span className="text-pen">.</span>
        </h1>
      </div>
      {notice && <Banner tone="pen">{notice}</Banner>}

      <motion.div key={emoji} initial={{ scale: 0.6, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} className="mx-auto grid h-28 w-28 place-items-center rounded-full border-4 border-ink bg-paper text-7xl shadow-hard">
        {emoji}
      </motion.div>

      <label className="block">
        <span className="font-mono text-sm font-bold uppercase">Nickname</span>
        <div className="mt-1 flex gap-2">
          <input
            value={nick}
            onChange={(e) => setNick(e.target.value.slice(0, 16))}
            placeholder="Goose Whisperer"
            maxLength={16}
            autoComplete="off"
            enterKeyHint="go"
            className="min-w-0 flex-1 rounded-2xl border-4 border-ink bg-paper px-4 py-3 text-xl font-bold shadow-hard-sm outline-none focus:bg-white"
          />
          <SquishButton type="button" variant="paper" className="px-4 text-2xl" onClick={() => setNick(randomNickname())} aria-label="Random nickname">
            🎲
          </SquishButton>
        </div>
      </label>

      <div>
        <span className="font-mono text-sm font-bold uppercase">Pick your face</span>
        <div className="mt-2 grid grid-cols-6 gap-2">
          {AVATARS.map((a) => (
            <motion.button
              type="button"
              key={a}
              whileTap={{ scale: 0.8 }}
              onClick={() => setEmoji(a)}
              className={cx(
                "aspect-square rounded-xl border-[3px] border-ink text-3xl",
                a === emoji ? "bg-ink shadow-none" : "bg-paper shadow-hard-sm",
              )}
              aria-pressed={a === emoji}
            >
              {a}
            </motion.button>
          ))}
        </div>
      </div>

      {err && <Banner tone="pen">{err}</Banner>}
      <SquishButton type="submit" disabled={busy} className="mt-auto py-5 text-2xl">
        {busy ? "Joining…" : "Join the game →"}
      </SquishButton>
    </form>
  );
}
