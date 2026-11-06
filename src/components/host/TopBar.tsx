"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Screen } from "@/lib/flow";
import type { ConnStatus } from "@/lib/types";
import { StatusDot, Sticker } from "../ui";

interface Props {
  screen: Screen;
  code: string;
  playerCount: number;
  status: ConnStatus;
}

export function TopBar({ screen, code, playerCount, status }: Props) {
  const label = screen.section;
  return (
    <div className="absolute inset-x-0 top-0 z-20 flex h-[100px] items-center justify-between px-14 text-ink">
      <div className="flex items-center gap-4">
        <AnimatePresence mode="wait">
          {label && (
            <motion.div key={label} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}>
              <Sticker className="text-2xl">
                {label}
              </Sticker>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-6 font-mono text-2xl font-bold">
        <span className="flex items-center gap-3">
          <StatusDot status={status} /> 👥 {playerCount}
        </span>
        <span className="rounded-xl border-[3px] border-ink bg-paper px-4 py-1">
          JOIN · <span className="tracking-[0.2em]">{code}</span>
        </span>
      </div>
    </div>
  );
}
