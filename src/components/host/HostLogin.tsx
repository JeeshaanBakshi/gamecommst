"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SquishButton } from "../ui";

/** Password screen in front of /host so only presenters can run the projector. */
export function HostLogin() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [wrong, setWrong] = useState(0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw || busy) return;
    setBusy(true);
    const res = await fetch("/api/host-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    }).catch(() => null);
    if (res?.ok) {
      const next = new URLSearchParams(window.location.search).get("next") ?? "/host";
      router.replace(next.startsWith("/host") ? next : "/host");
      return;
    }
    setBusy(false);
    setPw("");
    setWrong((w) => w + 1);
  };

  return (
    <main className="bg-grid flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12">
      <motion.form
        key={wrong}
        onSubmit={submit}
        initial={wrong ? { x: 0 } : { y: 30, opacity: 0 }}
        animate={wrong ? { x: [0, -14, 14, -8, 8, 0] } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm rounded-[28px] border-4 border-ink bg-paper p-8 text-center shadow-hard-lg"
      >
        <div className="text-6xl">🔒</div>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight">Presenters only</h1>
        <p className="mt-1 font-bold">Enter the password to run the big screen.</p>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          autoFocus
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="••••"
          aria-label="Presenter password"
          className="mt-6 w-full rounded-2xl border-4 border-ink bg-white px-4 py-3 text-center font-mono text-4xl font-bold tracking-[0.4em] outline-none"
        />
        {wrong > 0 && <p className="mt-3 font-bold text-pen">Wrong password. Try again.</p>}
        <SquishButton type="submit" disabled={!pw || busy} className="mt-6 w-full py-4 text-2xl">
          {busy ? "Checking…" : "Unlock"}
        </SquishButton>
        <Link href="/play" className="mt-5 inline-block font-mono text-sm font-bold underline">
          Here to play? Join the game →
        </Link>
      </motion.form>
    </main>
  );
}
