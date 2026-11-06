import { HOUR_MIDPOINTS } from "./flow";
import type { AnswerIndex, AnswerValue, Player, QuestionKey } from "./types";

/* ---------- generic stats ---------- */

export function values(idx: AnswerIndex, key: QuestionKey): AnswerValue[] {
  return Object.values(idx[key] ?? {});
}

export function countOptions(idx: AnswerIndex, key: QuestionKey, n: number): number[] {
  const counts = Array.from({ length: n }, () => 0);
  for (const a of values(idx, key)) {
    if (typeof a.v === "number" && a.v >= 0 && a.v < n) counts[a.v]++;
  }
  return counts;
}

export function pct(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

export function avg(nums: number[]) {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

export function avgHours(idx: AnswerIndex, key: "study" | "scroll") {
  return avg(
    values(idx, key)
      .map((a) => (typeof a.v === "number" ? HOUR_MIDPOINTS[a.v] : NaN))
      .filter((n) => !Number.isNaN(n)),
  );
}

/* ---------- captions ---------- */

/** avg on the displayed 1–5 scale */
export function stressCaption(avg15: number) {
  if (avg15 < 1.8) return "Suspiciously calm. Are you even enrolled?";
  if (avg15 < 2.6) return "Mildly crispy. Like a slightly burnt Tim's bagel.";
  if (avg15 < 3.4) return "Running on Tim Hortons and spite.";
  if (avg15 < 4.2) return "Hairline currently filing a formal complaint.";
  return "The geese have won. Please seek shelter.";
}

export function sleepCaption(pctUnder6: number) {
  if (pctUnder6 >= 70) return "Basically a zombie apocalypse in a lecture hall.";
  if (pctUnder6 >= 45) return "Half the room is legally a raccoon.";
  if (pctUnder6 >= 20) return "Some of you are clearly lying about sleeping.";
  return "Wow. Well-rested. Suspicious, but well-rested.";
}

export function mealsCaption(pct4plus: number) {
  if (pct4plus >= 50) return "Your hair is begging you to eat a sandwich.";
  if (pct4plus >= 25) return "Iced capp counts as a meal? It does not.";
  return "Respectable fuel. Your follicles say thank you.";
}

export function familyCaption(pctYes: number) {
  if (pctYes >= 50) return "Genetics: the final boss. And it's already here.";
  if (pctYes >= 25) return "Some of you can see your future at family dinners.";
  return "Mostly safe genes. Stress is your only enemy now.";
}

/* ---------- bald score ---------- */

export interface Factor {
  key: string;
  label: string;
  emoji: string;
  hit: boolean;
}

/** One point per factor below. */
export const MAX_SCORE = 5;

export interface BaldResult {
  score: number;
  factors: Factor[];
}

export function baldScoreFor(idx: AnswerIndex, playerId: string): BaldResult {
  const g = (k: QuestionKey) => idx[k]?.[playerId];
  const stress = g("stress")?.v;
  const sleep = g("sleep")?.v;
  const meals = g("meals")?.v;
  const study = g("study")?.v;
  const scroll = g("scroll")?.v;
  const family = g("family")?.v;

  const factors: Factor[] = [
    { key: "stress", label: "Stress level 4 or 5", emoji: "😵", hit: stress != null && stress >= 3 },
    { key: "sleep", label: "Under 6h of sleep", emoji: "🥱", hit: sleep != null && sleep <= 1 },
    { key: "meals", label: "Skipping 4+ meals a week", emoji: "🍽️", hit: meals != null && meals >= 2 },
    {
      key: "scroll",
      label: "Doomscroll > study",
      emoji: "📱",
      hit: study != null && scroll != null && scroll > study,
    },
    { key: "family", label: "Baldness runs in the family", emoji: "🧬", hit: family === 0 },
  ];
  return { score: factors.filter((f) => f.hit).length, factors };
}

export interface Ranked {
  player: Player;
  result: BaldResult;
  rank: number;
}

/** Highest score first ("closest to bald"). Ties broken by stress level. */
export function rankPlayers(players: Player[], idx: AnswerIndex): Ranked[] {
  const rows = players.map((player) => ({ player, result: baldScoreFor(idx, player.id) }));
  rows.sort(
    (a, b) =>
      b.result.score - a.result.score ||
      (idx.stress?.[b.player.id]?.v ?? -1) - (idx.stress?.[a.player.id]?.v ?? -1) ||
      a.player.nickname.localeCompare(b.player.nickname),
  );
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}

export interface Tier {
  name: string;
  emoji: string;
  blurb: string;
  color: string;
}

export const TIERS: Tier[] = [
  { name: "Full Luscious Locks", emoji: "🦁", blurb: "Shampoo commercial energy. Teach us your ways.", color: "#2F9E44" },
  { name: "Slight Breeze Detected", emoji: "🌬️", blurb: "A little airflow up top. Drink water. Go to bed.", color: "#E8A800" },
  { name: "Forehead Expansion Pack", emoji: "📦", blurb: "Your forehead just got a DLC. Sleep before it gets a sequel.", color: "#E2342D" },
  { name: "Certified Waterloo Graduate", emoji: "🎓", blurb: "Peak Waterloo Effect. The geese salute you.", color: "#111111" },
];

export function tierFor(score: number): Tier {
  if (score <= 1) return TIERS[0];
  if (score <= 3) return TIERS[1];
  if (score <= 4) return TIERS[2];
  return TIERS[3];
}

/* ---------- quizzes ---------- */

export function quizStats(players: Player[], idx: AnswerIndex, key: QuestionKey, correct: number, startedAt: string | null) {
  const a = idx[key] ?? {};
  const start = startedAt ? Date.parse(startedAt) : 0;
  const answered = Object.values(a).filter((v) => typeof v.v === "number").length;
  const right = players
    .filter((p) => a[p.id]?.v === correct)
    .map((p) => ({ player: p, ms: Math.max(0, (a[p.id].t ?? Infinity) - start) }))
    .sort((x, y) => x.ms - y.ms);
  return { answered, right: right.length, pctRight: pct(right.length, answered), fastest: right.slice(0, 3) };
}
