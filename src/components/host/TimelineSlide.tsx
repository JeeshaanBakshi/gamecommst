"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { SlideDef } from "@/lib/slides";
import { cx } from "../ui";

type Timeline = NonNullable<SlideDef["timeline"]>;

/** Total clicks a timeline takes: one per event, plus one for the gap bracket. */
export function timelineSteps(t: Timeline) {
  return t.events.length + (t.gap ? 1 : 0);
}

const CARD_H = 128;
// Vertical position of each event (px). The long first gap is "the rest of the day";
// the short one before the midterm is the punchline.
const TOPS = [0, 400, 668];

/** A day, revealed one click at a time, ending with the red "40 min" bracket. */
export function TimelineSlide({ t, step }: { t: Timeline; step: number }) {
  const showGap = !!t.gap && step > t.events.length;
  const gapTop = t.gap ? TOPS[t.gap.after] + CARD_H : 0;
  const gapH = t.gap ? TOPS[t.gap.after + 1] - gapTop : 0;

  return (
    <div className="relative h-[796px] w-[980px]">
      {/* axis: dashed through the long stretch of the day */}
      {step >= 2 && (
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute left-[22px] w-0 origin-top border-l-[6px] border-dashed border-ink/40"
          style={{ top: CARD_H / 2, height: TOPS[1] - CARD_H / 2 }}
        />
      )}
      {step >= 3 && <div className="absolute left-[22px] w-[6px] bg-ink" style={{ top: TOPS[1] + CARD_H / 2, height: TOPS[2] - TOPS[1] }} />}

      {t.events.map((e, i) => (
        <AnimatePresence key={e.label}>
          {step > i && (
            <motion.div
              initial={{ x: 120, opacity: 0, rotate: 3 }}
              animate={{ x: 0, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 14, stiffness: 180 }}
              className="absolute left-0 flex items-center"
              style={{ top: TOPS[i], height: CARD_H }}
            >
              <span className="z-10 h-[50px] w-[50px] shrink-0 rounded-full border-[6px] border-ink bg-gold" />
              <div
                className={cx(
                  "ml-6 flex w-[540px] flex-col justify-center rounded-2xl border-4 border-ink px-6 shadow-hard",
                  i === t.events.length - 1 ? "bg-ink text-gold" : "bg-paper",
                )}
                style={{ height: CARD_H }}
              >
                <div className="font-mono text-[30px] font-bold">{e.time}</div>
                <div className="text-[52px] font-extrabold leading-tight">
                  {e.emoji} {e.label}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ))}

      {/* the red bracket between the quiz and the midterm */}
      {t.gap && showGap && (
        <div className="absolute left-[640px] flex items-center" style={{ top: gapTop, height: gapH }}>
          <svg width="48" height={gapH} viewBox={`0 0 48 ${gapH}`} className="overflow-visible">
            <motion.path
              d={`M 4 4 L 28 4 L 28 ${gapH - 4} L 4 ${gapH - 4} M 28 ${gapH / 2} L 44 ${gapH / 2}`}
              fill="none"
              stroke="#e2342d"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </svg>
          <motion.div
            initial={{ scale: 2.4, rotate: -14, opacity: 0 }}
            animate={{ scale: 1, rotate: -4, opacity: 1 }}
            transition={{ delay: 0.35, type: "spring", damping: 8, stiffness: 160 }}
            className="ml-4 whitespace-nowrap"
          >
            <div className="font-marker text-[96px] leading-none text-pen">{t.gap.label}</div>
            <div className="mt-1 font-mono text-[26px] font-bold text-pen">{t.gap.detail}</div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
