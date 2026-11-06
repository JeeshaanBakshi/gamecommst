"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { MAX_SCORE } from "@/lib/scoring";

interface Props {
  /** 0 (full locks) → MAX_SCORE (certified Waterloo graduate) */
  score: number;
  size?: number;
  emoji?: string;
  /** Start with full hair and recede to `score` (for dramatic reveals). */
  recede?: boolean;
  delay?: number;
}

const SKIN = "#f2c79b";
const HAIR = "#1b1b1b";

export function BaldHead({ score, size = 120, emoji, recede = false, delay = 0 }: Props) {
  const id = useId().replace(/:/g, "");
  const t = Math.max(0, Math.min(1, score / MAX_SCORE));
  const tr = { duration: recede ? 1.6 : 0.6, delay, ease: [0.3, 0.8, 0.3, 1] as const };

  const hairR = 38 + 7 * (1 - t);
  const hairCy = 55 - 4 * (1 - t);
  const rx = 24 + t * 12;
  const ry = 24 + t * 26;
  const start = { rx: 24, ry: 24 };

  return (
    <div className="relative inline-block shrink-0" style={{ width: size, height: size * 1.1 }}>
      <svg viewBox="0 0 100 110" width={size} height={size * 1.1} aria-hidden>
        <defs>
          <clipPath id={`top-${id}`}>
            <rect x="0" y="0" width="100" height="64" />
          </clipPath>
          <clipPath id={`skull-${id}`}>
            <circle cx="50" cy="55" r="36.5" />
          </clipPath>
        </defs>

        {/* ears */}
        <circle cx="12.5" cy="64" r="7" fill={SKIN} stroke="#111" strokeWidth="3" />
        <circle cx="87.5" cy="64" r="7" fill={SKIN} stroke="#111" strokeWidth="3" />
        {/* head */}
        <circle cx="50" cy="55" r="38" fill={SKIN} stroke="#111" strokeWidth="3" />

        {/* hair blob, cut off at the ears */}
        <g clipPath={`url(#top-${id})`}>
          <motion.circle
            cx="50"
            initial={recede ? { r: 45, cy: 51 } : false}
            animate={{ r: hairR, cy: hairCy }}
            transition={tr}
            fill={HAIR}
          />
        </g>

        {/* forehead / scalp grows upward as the hairline recedes */}
        <g clipPath={`url(#skull-${id})`}>
          <motion.ellipse cx="50" cy="62" initial={recede ? start : false} animate={{ rx, ry }} transition={tr} fill={SKIN} />
        </g>

        {/* lonely comb-over strands */}
        {t >= 0.7 && t < 1 && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + (recede ? 1.4 : 0) }}
            stroke={HAIR}
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          >
            <path d="M44 22 q 6 -9 14 -3" />
            {t < 0.85 && <path d="M50 21 q 7 -7 13 0" />}
          </motion.g>
        )}

        {/* scalp shine */}
        {t >= 0.5 && (
          <motion.ellipse
            cx="37"
            cy="30"
            rx="8"
            ry="3.6"
            transform="rotate(-28 37 30)"
            fill="#fff"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 + t * 0.4 }}
            transition={{ delay: delay + (recede ? 1.2 : 0) }}
          />
        )}

        {/* face */}
        <g stroke="#111" strokeWidth="2.6" strokeLinecap="round" fill="none">
          {t > 0.6 ? (
            <>
              <path d="M31 63 l 10 -3" />
              <path d="M69 63 l -10 -3" />
            </>
          ) : (
            <>
              <path d="M31 62 q 5 -3 10 0" />
              <path d="M59 62 q 5 -3 10 0" />
            </>
          )}
        </g>
        <circle cx="37" cy="70" r="3.4" fill="#111" />
        <circle cx="63" cy="70" r="3.4" fill="#111" />
        <circle cx="29" cy="80" r="4.5" fill="#e2342d" opacity="0.25" />
        <circle cx="71" cy="80" r="4.5" fill="#e2342d" opacity="0.25" />
        {t < 0.5 ? (
          <path d="M40 82 Q50 91 60 82" stroke="#111" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        ) : t < 1 ? (
          <path d="M40 85 q 5 -4 10 0 t 10 0" stroke="#111" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        ) : (
          <ellipse cx="50" cy="85" rx="5" ry="6" fill="#111" />
        )}

        {/* sweat */}
        {t >= 0.66 && <path d="M83 38 q 4 7 0 10 q -4 -3 0 -10 z" fill="#5aa9ff" stroke="#111" strokeWidth="1.6" />}
      </svg>

      {emoji && (
        <span
          className="absolute grid place-items-center rounded-full border-[3px] border-ink bg-paper leading-none"
          style={{ width: size * 0.42, height: size * 0.42, right: -size * 0.06, bottom: 0, fontSize: size * 0.24 }}
        >
          {emoji}
        </span>
      )}
    </div>
  );
}
