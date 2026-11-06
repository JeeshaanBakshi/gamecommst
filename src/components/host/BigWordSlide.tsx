"use client";

import { motion } from "framer-motion";

/** One giant word on its own, in the same style as the SH***WER slide. */
export function BigWordSlide({ word }: { word: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pt-[60px]">
      <motion.h1
        initial={{ y: -120, rotate: -8, opacity: 0 }}
        animate={{ y: 0, rotate: -3, opacity: 1 }}
        transition={{ type: "spring", damping: 10, stiffness: 140 }}
        className="text-[400px] font-extrabold leading-none tracking-tight"
      >
        {word}
        <span className="text-pen">.</span>
      </motion.h1>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
        className="mt-2 h-4 w-[880px] origin-left -rotate-3 rounded-full bg-pen"
      />
    </div>
  );
}
