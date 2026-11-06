"use client";

import { motion, useReducedMotion } from "framer-motion";

const CLOUD = [
  { x: -330, y: 10, s: 230 },
  { x: -170, y: -70, s: 260 },
  { x: 20, y: -90, s: 280 },
  { x: 210, y: -60, s: 250 },
  { x: 350, y: 20, s: 220 },
  { x: -260, y: 90, s: 220 },
  { x: -40, y: 100, s: 260 },
  { x: 180, y: 100, s: 240 },
];

/** Emmanuel's slide: "SH***WER", with WATERLOO crossed out in a green stink cloud. */
export function ShowerSlide() {
  const reduce = useReducedMotion();
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pt-[60px]">
      <motion.h1
        initial={{ y: -120, rotate: -8, opacity: 0 }}
        animate={{ y: 0, rotate: -3, opacity: 1 }}
        transition={{ type: "spring", damping: 10, stiffness: 140 }}
        className="text-[260px] font-extrabold leading-none tracking-tight"
      >
        SH<span className="text-pen">***</span>WER
      </motion.h1>

      <div className="relative mt-16 grid place-items-center">
        {/* stink cloud */}
        {CLOUD.map((c, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-[#7cc242] blur-2xl"
            style={{ width: c.s, height: c.s * 0.75, left: `calc(50% + ${c.x}px - ${c.s / 2}px)`, top: `calc(50% + ${c.y}px - ${(c.s * 0.75) / 2}px)` }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={reduce ? { opacity: 0.55, scale: 1 } : { opacity: [0.45, 0.65, 0.45], scale: [0.95, 1.08, 0.95] }}
            transition={{ delay: 0.5 + i * 0.05, duration: 2.4, repeat: reduce ? 0 : Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* stink lines rising */}
        {[-300, -100, 120, 320].map((x, i) => (
          <motion.svg
            key={x}
            viewBox="0 0 30 90"
            className="absolute h-32 w-10"
            style={{ left: `calc(50% + ${x}px)`, top: -150 }}
            initial={{ opacity: 0, y: 30 }}
            animate={reduce ? { opacity: 0.8, y: 0 } : { opacity: [0, 0.9, 0], y: [30, -20, -60] }}
            transition={{ delay: 1 + i * 0.35, duration: 2.6, repeat: reduce ? 0 : Infinity }}
          >
            <path d="M15 88 C 0 70, 30 60, 15 44 S 0 18, 15 2" fill="none" stroke="#3f7d1e" strokeWidth="5" strokeLinecap="round" />
          </motion.svg>
        ))}

        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, type: "spring", damping: 13 }}
          className="relative px-10 py-2"
        >
          <div className="font-mono text-2xl font-bold uppercase tracking-[0.5em] text-ink/80">University of</div>
          <div className="text-[150px] font-extrabold uppercase leading-none tracking-[0.06em]">Waterloo</div>

          {/* the big X */}
          {[12, -12].map((deg, i) => (
            <motion.span
              key={deg}
              className="absolute left-[-4%] top-[calc(50%-14px)] h-7 w-[108%] origin-center rounded-full bg-pen shadow-hard-sm"
              style={{ rotate: deg }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.1 + i * 0.3, duration: 0.35, ease: "easeOut" }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
