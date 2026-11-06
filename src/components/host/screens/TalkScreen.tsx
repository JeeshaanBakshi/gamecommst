"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import Image from "next/image";
import type { Screen } from "@/lib/flow";
import { cx } from "../../ui";
import { BaldWall } from "../BaldWall";
import { BigWordSlide } from "../BigWordSlide";
import { ChainSlide } from "../ChainSlide";
import { PhotoBoard } from "../PhotoBoard";
import { ShowerSlide } from "../ShowerSlide";
import { TimelineSlide } from "../TimelineSlide";

type TalkDef = Extract<Screen, { type: "talk" }>;

/** Section number, "slide x/y" and the title, shared by every bulleted-style slide. */
function SlideHeader({ s }: { s: TalkDef }) {
  return (
    <>
      <motion.div initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", damping: 15 }} className="flex items-end gap-6">
        <span className="text-outline text-[150px] font-extrabold leading-[0.8]">{s.num}</span>
        {s.of > 1 && <span className="mb-3 font-mono text-3xl font-bold uppercase tracking-widest opacity-70">slide {s.part}/{s.of}</span>}
      </motion.div>
      <motion.h1
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08, type: "spring", damping: 15 }}
        className="mt-6 text-[112px] font-extrabold leading-[0.9] tracking-tight"
      >
        {s.title}
      </motion.h1>
    </>
  );
}

/** A speaker's slide: number, title, points (plus a picture if the slide has one). */
export function TalkScreen({ s, corner, step = 0 }: { s: TalkDef; corner?: ReactNode; step?: number }) {
  if (s.wall) return <BaldWall corner={corner} />;
  if (s.shower) return <ShowerSlide />;
  if (s.bigWord) return <BigWordSlide word={s.bigWord} />;

  if (s.timeline) {
    return (
      <div className="absolute inset-0 flex gap-14 px-24 pb-12 pt-[150px]">
        <div className="w-[640px] shrink-0">
          <SlideHeader s={s} />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 font-marker text-[56px] leading-tight text-pen"
          >
            actually… it&apos;s today.
          </motion.p>
        </div>
        <TimelineSlide t={s.timeline} step={step} />
      </div>
    );
  }

  if (s.chain) {
    return (
      <div className="absolute inset-0 px-24 pb-16 pt-[150px]">
        <SlideHeader s={s} />
        <div className="mt-16">
          <ChainSlide steps={s.chain} />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center gap-14 px-24 pb-20 pt-[130px]">
      <div className="min-w-0 flex-1">
        <SlideHeader s={s} />

        <ul className="mt-12 space-y-7">
          {s.bullets.map((b, i) => (
            <motion.li
              key={b}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.18, type: "spring", damping: 16 }}
              className={cx("flex items-start gap-6 font-bold leading-[1.15]", s.board ? "text-[42px]" : "text-[50px]")}
            >
              <span className="mt-2 grid h-12 w-12 shrink-0 place-items-center rounded-lg border-4 border-ink bg-paper font-marker text-3xl text-pen">✓</span>
              <span>{b}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {s.board && <PhotoBoard board={s.board} />}

      {s.image && (
        <motion.div
          initial={{ rotate: 10, scale: 0.7, opacity: 0 }}
          animate={{ rotate: 3, scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 12 }}
          className="relative aspect-[498/290] w-[560px] shrink-0 overflow-hidden rounded-2xl border-4 border-ink bg-white shadow-hard-lg"
        >
          <Image src={s.image} alt="" fill sizes="560px" className="object-cover" priority />
        </motion.div>
      )}
    </div>
  );
}
