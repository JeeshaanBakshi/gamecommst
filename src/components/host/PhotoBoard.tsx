"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { SlideDef } from "@/lib/slides";

type Board = NonNullable<SlideDef["board"]>;

/** Polaroid-style photos pinned next to a slide's bullets (e.g. Emmanuel's massage + LeBron slide). */
export function PhotoBoard({ board }: { board: Board }) {
  return (
    <div className="flex w-[600px] shrink-0 flex-col items-center gap-7">
      {board.title && <div className="font-marker text-[34px] leading-none text-pen">{board.title}</div>}
      <div className="flex gap-4">
        {board.photos.map((p, i) => (
          <motion.figure
            key={p.src}
            initial={{ y: -60, opacity: 0, rotate: 0 }}
            animate={{ y: 0, opacity: 1, rotate: [-4, 3, -2][i % 3] }}
            transition={{ delay: 0.25 + i * 0.15, type: "spring", damping: 12 }}
            className="w-[186px] rounded-md bg-white p-2.5 pb-2 shadow-hard ring-4 ring-ink"
          >
            <div className="relative h-[166px] w-full overflow-hidden rounded-sm bg-ink">
              <Image src={p.src} alt={p.caption} fill sizes="186px" className="object-cover" priority />
            </div>
            <figcaption className="mt-2 whitespace-nowrap text-center font-marker text-[18px] leading-none tracking-tight text-ink">{p.caption}</figcaption>
          </motion.figure>
        ))}
      </div>
      {board.feature && (
        <motion.figure
          initial={{ scale: 0.6, opacity: 0, rotate: 8 }}
          animate={{ scale: 1, opacity: 1, rotate: 2 }}
          transition={{ delay: 0.8, type: "spring", damping: 11 }}
          className="relative w-[330px] rounded-md bg-white p-3 pb-2.5 shadow-hard-lg ring-4 ring-ink"
        >
          <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-ink">
            <Image src={board.feature.src} alt={board.feature.caption} fill sizes="330px" className="object-cover" priority />
          </div>
          <figcaption className="mt-2 text-center font-marker text-[28px] leading-none text-pen">{board.feature.caption}</figcaption>
        </motion.figure>
      )}
    </div>
  );
}
