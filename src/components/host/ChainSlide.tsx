"use client";

import { motion } from "framer-motion";
import { Fragment } from "react";
import { BaldHead } from "../BaldHead";
import { cx } from "../ui";

/** Cause → effect chain that builds left to right and ends on a balding head. */
export function ChainSlide({ steps }: { steps: string[] }) {
  return (
    <div className="flex items-stretch gap-4">
      {steps.map((label, i) => {
        const last = i === steps.length - 1;
        const [emoji, ...rest] = label.split(" ");
        const hasEmoji = !last && /\p{Extended_Pictographic}/u.test(emoji);
        return (
          <Fragment key={label}>
            {i > 0 && (
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.55 }}
                className="self-center text-[80px] font-extrabold leading-none text-pen"
              >
                →
              </motion.span>
            )}
            <motion.div
              initial={{ y: 60, opacity: 0, rotate: 4 }}
              animate={{ y: 0, opacity: 1, rotate: i % 2 ? 1.5 : -1.5 }}
              transition={{ delay: 0.3 + i * 0.55, type: "spring", damping: 13, stiffness: 170 }}
              className={cx(
                "flex w-[330px] flex-col items-center justify-center rounded-3xl border-4 border-ink px-6 py-8 text-center shadow-hard-lg",
                last ? "bg-pen text-paper" : "bg-paper",
              )}
            >
              {last ? (
                <BaldHead score={5} size={150} recede delay={0.3 + i * 0.55} />
              ) : (
                <span className="text-[110px] leading-none">{hasEmoji ? emoji : "•"}</span>
              )}
              <span className="mt-5 text-[46px] font-extrabold leading-[1.05]">{hasEmoji ? rest.join(" ") : label}</span>
            </motion.div>
          </Fragment>
        );
      })}
    </div>
  );
}
