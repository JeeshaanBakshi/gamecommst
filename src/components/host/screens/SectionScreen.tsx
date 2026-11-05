"use client";

import { motion } from "framer-motion";
import type { Screen } from "@/lib/flow";
import { Card, CautionTape, Scribble } from "../../ui";

type SectionDef = Extract<Screen, { type: "section" }>;

export function SectionScreen({ screen }: { screen: SectionDef }) {
  const alert = screen.variant === "alert";
  return (
    <div className={`absolute inset-0 ${alert ? "text-gold" : ""}`}>
      {alert && (
        <>
          <CautionTape className="absolute inset-x-0 top-[110px] h-16" label="Caution · Stress Test in Progress" />
          <CautionTape className="absolute inset-x-0 bottom-16 h-16" label="Do not panic · Panic is data" />
        </>
      )}
      <div className="absolute inset-0 flex items-center gap-16 px-28">
        <div className="flex-1">
          <motion.div
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 14 }}
            className={`text-[200px] font-extrabold leading-none ${alert ? "text-pen" : "text-outline"}`}
          >
            {screen.num}
          </motion.div>
          <motion.h1
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.12, type: "spring", damping: 14 }}
            className={`mt-2 max-w-[1150px] font-extrabold leading-[0.9] tracking-tight ${alert ? "text-[150px]" : "text-[124px]"}`}
          >
            {screen.title}
          </motion.h1>
          {screen.presenter && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mt-8 inline-block">
              <span className={`font-marker text-6xl ${alert ? "text-gold" : "text-pen"}`}>presented by {screen.presenter}</span>
              <Scribble delay={0.7} />
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ rotate: 12, scale: 0.6, opacity: 0 }}
          animate={{ rotate: 3, scale: 1, opacity: 1 }}
          transition={{ delay: 0.25, type: "spring", damping: 12 }}
          className="w-[560px] shrink-0"
        >
          <div className="mb-6 text-center text-[180px] leading-none animate-bob">{screen.emoji}</div>
          <Card className="bg-ruled p-10 text-ink">
            <div className="font-mono text-2xl font-bold uppercase tracking-widest text-pen">✎ Exam note</div>
            <p className="mt-4 text-[38px] font-bold leading-[1.15]">{screen.note}</p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
