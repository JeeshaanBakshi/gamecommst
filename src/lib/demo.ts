import { mathQuestions } from "./mathRound";
import { MATH_DURATION_MS, Q, type QuestionDef } from "./flow";
import type { AnswerValue, NewPlayer, QuestionKey } from "./types";
import { AVATARS } from "./avatars";

const FAKE_NAMES = [
  "GooseWhisperer", "MC Basement", "Tim Hortons IV", "ECE Survivor", "Midterm Martyr",
  "DC Library Ghost", "SLC Napper", "Co-op Reject #4", "CS135 Victim", "Pink Tie Mathie",
  "Ring Road Runner", "Goose Bitten", "Quest Refresher", "4am Grinder", "LEARN Lagger",
  "E7 Lost Soul", "Plaza Pizza", "PAC Rat", "Iron Ring Wannabe", "Tool Bearer",
  "Health Sci Hero", "AFM Accountant", "Arts Kid", "Kin Major", "Velocity Dreamer",
  "Geese Lord", "WaterlooWorks", "Iced Capp Addict", "Final Exam Fred", "Office Hrs Ollie",
];

export function fakePlayers(roomId: string, epoch: number, taken: string[] = [], count = 30): NewPlayer[] {
  const shuffled = [...FAKE_NAMES].sort(() => Math.random() - 0.5);
  const used = new Set(taken);
  const unique = (base: string) => {
    let name = base;
    for (let n = 2; used.has(name); n++) name = `${base} ${n}`;
    used.add(name);
    return name;
  };
  return Array.from({ length: count }, (_, i) => ({
    room_id: roomId,
    nickname: unique(shuffled[i % shuffled.length]),
    emoji: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    is_fake: true,
    epoch,
  }));
}

function weighted(weights: number[]) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

/** Skewed toward "very Waterloo" answers for maximum comedy. */
const WEIGHTS: Partial<Record<QuestionKey, number[]>> = {
  stress: [1, 2, 4, 6, 5],
  sleep: [3, 5, 4, 2],
  meals: [3, 6, 3, 1],
  study: [2, 4, 5, 2, 1],
  scroll: [1, 3, 5, 3, 2],
  family: [3, 4, 3],
};

export function botChoice(key: QuestionKey, t?: number): AnswerValue {
  const quiz = (Object.values(Q) as QuestionDef[]).find((q) => q.key === key && q.correct != null);
  if (quiz) {
    // ~60% get it right; the rest spread across the wrong answers.
    const w = quiz.options.map((_, i) => (i === quiz.correct ? 6 : 4 / (quiz.options.length - 1)));
    return { v: weighted(w), t };
  }
  return { v: weighted(WEIGHTS[key] ?? [1, 1, 1, 1]) };
}

export function botPulse(key: "pulse_before" | "pulse_after", before?: number): AnswerValue {
  if (key === "pulse_before" || !before) {
    const count = 15 + Math.floor(Math.random() * 9); // 60–92 bpm
    return { count, bpm: count * 4 };
  }
  const delta = Math.round((Math.random() * 7 - 1.5)); // mostly up
  const count = Math.max(10, before / 4 + delta);
  return { count, bpm: count * 4 };
}

/** A plan of when each bot gets each math question right during the 30s round. */
export function botMathPlan(): { atMs: number; correct: number; done: boolean }[] {
  const skill = Math.random();
  const total = Math.min(5, Math.floor(1 + skill * 5.2));
  const steps: { atMs: number; correct: number; done: boolean }[] = [];
  let t = 1500;
  for (let c = 1; c <= total; c++) {
    t += 2500 + Math.random() * (9000 - skill * 6000);
    if (t > MATH_DURATION_MS - 300) break;
    steps.push({ atMs: Math.round(t), correct: c, done: c === 5 });
  }
  return steps;
}

export { mathQuestions };
