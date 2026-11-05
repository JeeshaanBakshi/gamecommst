"use client";

import { motion } from "framer-motion";
import { BaldHead } from "../../BaldHead";
import { Card, DISCLAIMER, Scribble } from "../../ui";

const TIPS = [
  ["😴", "Sleep 7+ hours", "Your follicles grow back on night shift."],
  ["🍳", "Eat actual meals", "Protein + iron. Iced capps don't count."],
  ["🚶", "Move & touch grass", "Ring Road counts as cardio."],
  ["🧘", "Manage the stress", "Plan the term, take breaks, talk to someone."],
  ["🩺", "See a doctor", "If shedding lasts months, get it checked."],
];

export function EndScreen() {
  return (
    <div className="absolute inset-0 flex items-center gap-16 px-20 pt-[60px]">
      <div className="flex-1">
        <h1 className="text-[130px] font-extrabold leading-[0.85] tracking-tight">
          How not to
          <br />
          go bald<span className="text-pen">.</span>
        </h1>
        <div className="mt-6 inline-block">
          <span className="font-marker text-6xl text-pen">thanks for playing, Waterloo 🪿</span>
          <Scribble />
        </div>
        <div className="mt-10 flex items-end gap-4">
          <motion.div animate={{ rotate: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 2 }}>
            <BaldHead score={0} size={190} />
          </motion.div>
          <span className="mb-16 font-marker text-4xl">← the goal</span>
        </div>
        <p className="mt-10 max-w-[900px] font-mono text-xl font-bold">{DISCLAIMER}</p>
      </div>
      <Card className="w-[760px] shrink-0 -rotate-1 bg-ruled p-10">
        <div className="font-mono text-2xl font-bold uppercase tracking-widest text-pen">Prescription</div>
        <ul className="mt-4 space-y-5">
          {TIPS.map(([e, t, s], i) => (
            <motion.li
              key={t}
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.15 }}
              className="flex items-start gap-5"
            >
              <span className="text-6xl">{e}</span>
              <div>
                <div className="text-[40px] font-extrabold leading-tight">{t}</div>
                <div className="text-2xl font-bold opacity-70">{s}</div>
              </div>
            </motion.li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
