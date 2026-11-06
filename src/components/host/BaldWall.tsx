"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import Image from "next/image";
import { BALD_WALL } from "@/lib/slides";
import { Scribble } from "../ui";

const COLS = 5;

/** Opening slide: the whole class after one term, as a pinned-up collage. */
export function BaldWall({ corner }: { corner?: ReactNode }) {
  const cards = [...BALD_WALL].sort();
  return (
    <div className="absolute inset-0 flex flex-col items-center px-12 pb-8 pt-10">
      <div className="flex w-full items-center justify-between px-6">
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 14 }}
        className="flex items-end gap-8"
      >
        <h1 className="text-[104px] font-extrabold leading-none tracking-tight">
          The Waterloo Effect<span className="text-pen">.</span>
        </h1>
        <div className="mb-3">
          <span className="font-marker text-5xl text-pen">one term later…</span>
          <Scribble delay={0.5} />
        </div>
      </motion.div>
      {corner}
      </div>

      <div className="mt-8 grid gap-x-7 gap-y-5" style={{ gridTemplateColumns: `repeat(${COLS}, 313px)` }}>
        {cards.map((src, i) => (
          <motion.div
            key={src}
            initial={{ scale: 0.3, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: i % 2 ? 1.5 : -1.5 }}
            transition={{ delay: 0.25 + i * 0.06, type: "spring", stiffness: 260, damping: 16 }}
            className="relative h-[201px] w-[313px] overflow-hidden rounded-xl border-4 border-ink bg-white shadow-hard"
          >
            <Image src={src} alt="" fill sizes="313px" className="object-cover" priority />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
