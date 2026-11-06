import { SPEAKER_PHOTOS, TALKS, type SlideDef, type TalkDef } from "./slides";
import type { AnswerIndex, QuestionKey } from "./types";

/** Quizzes auto-reveal after this long (or as soon as everyone has answered). */
export const QUIZ_MS = 20_000;
/** Focus Challenge: hold the button this long without getting distracted. */
export const FOCUS_MS = 15_000;

export interface ChoiceOption {
  label: string;
  emoji: string;
  /** Shorter label for the projector chart (falls back to `label`). */
  short?: string;
}

export interface QuestionDef {
  key: QuestionKey;
  kind: "choice" | "slider";
  prompt: string;
  /** Short label used on charts / phone headers. */
  short: string;
  options: ChoiceOption[];
  /** Poll: option indexes that count as "bad for your hairline" (highlighted in red pen). */
  bad: number[];
  /** Quiz: the right answer. Quizzes get a timer and a correct-answer reveal. */
  correct?: number;
  explain?: string;
  /** Step-slider poll: one answer per player, coloured bars, tallest bar highlighted on reveal. */
  stepPoll?: { colors: string[]; revealTitle: string; revealNote: string };
}

const HOURS: ChoiceOption[] = [
  { label: "0–1h", emoji: "🫠" },
  { label: "1–2h", emoji: "🙂" },
  { label: "2–4h", emoji: "😤" },
  { label: "4–6h", emoji: "🔥" },
  { label: "6h+", emoji: "🤖" },
];

/** Midpoint hours for each HOURS option, used for averages. */
export const HOUR_MIDPOINTS = [0.5, 1.5, 3, 5, 7];

export const Q = {
  /* ---- polls (feed the bald score) ---- */
  stress: {
    key: "stress",
    kind: "slider",
    prompt: "How stressed are you this term?",
    short: "Stress level",
    options: [
      { label: "Chillin'", emoji: "😌" },
      { label: "Fine-ish", emoji: "🙂" },
      { label: "Crispy", emoji: "😬" },
      { label: "Cooked", emoji: "😵" },
      { label: "Deceased", emoji: "💀" },
    ],
    bad: [3, 4],
  },
  sleep: {
    key: "sleep",
    kind: "choice",
    prompt: "Hours of sleep on a school night?",
    short: "Sleep",
    options: [
      { label: "Under 5h", emoji: "🧟" },
      { label: "5–6h", emoji: "🥱" },
      { label: "6–7h", emoji: "😐" },
      { label: "7h+", emoji: "😴" },
    ],
    bad: [0, 1],
  },
  meals: {
    key: "meals",
    kind: "choice",
    prompt: "Meals skipped per week?",
    short: "Meals skipped",
    options: [
      { label: "0", emoji: "🍱" },
      { label: "1–3", emoji: "🥪" },
      { label: "4–6", emoji: "🫥" },
      { label: "7+", emoji: "🦴" },
    ],
    bad: [2, 3],
  },
  study: { key: "study", kind: "choice", prompt: "Hours studying per day?", short: "Study", options: HOURS, bad: [] },
  scroll: { key: "scroll", kind: "choice", prompt: "Hours doomscrolling per day?", short: "Doomscroll", options: HOURS, bad: [] },
  family: {
    key: "family",
    kind: "choice",
    prompt: "Does baldness run in your family?",
    short: "Family history",
    options: [
      { label: "Yes", emoji: "👨‍🦲" },
      { label: "No", emoji: "💇" },
      { label: "Not sure", emoji: "🤷" },
    ],
    bad: [0],
  },

  /* ---- step-slider poll (not scored) ---- */
  deadline: {
    key: "deadline",
    kind: "slider",
    prompt: "An assignment is due at 11:59 PM. When do you ACTUALLY start?",
    short: "Poll",
    options: [
      { label: "The day it's posted 😇", short: "When posted", emoji: "😇" },
      { label: "3 days before", emoji: "📆" },
      { label: "1 day before", emoji: "📅" },
      { label: "Day of", emoji: "😐" },
      { label: "9 PM", emoji: "🌙" },
      { label: "11 PM", emoji: "😰" },
      { label: "11:58 PM 💀", short: "11:58 PM", emoji: "💀" },
    ],
    bad: [],
    stepPoll: {
      colors: ["#2f9e44", "#5fa821", "#9bb10d", "#e8a800", "#f08c00", "#e8590c", "#e2342d"],
      revealTitle: "Deadline cliff 📉",
      revealNote: "Most of us start when the panic does. Plan it on Sunday instead.",
    },
  },

  /* ---- quizzes (right/wrong, 20s timer) ---- */
  quiz_math135: {
    key: "quiz_math135",
    kind: "choice",
    prompt: "After which midterm did students get the viral \"you matter more than your grades\" email?",
    short: "Quiz",
    options: [
      { label: "CS 135", emoji: "💻" },
      { label: "MATH 135", emoji: "🧮" },
      { label: "ECON 101", emoji: "📈" },
      { label: "PHYS 121", emoji: "🍎" },
    ],
    bad: [],
    correct: 1,
    explain: "MATH 135. When the math department starts sending wellness emails, the Waterloo Effect is real.",
  },
  quiz_sleep: {
    key: "quiz_sleep",
    kind: "choice",
    prompt: "How much sleep do adults need per night?",
    short: "Quiz",
    options: [
      { label: "4–5h", emoji: "🦉" },
      { label: "6h", emoji: "😐" },
      { label: "7–9h", emoji: "😴" },
      { label: "12h+", emoji: "🐨" },
    ],
    bad: [],
    correct: 2,
    explain: "7+ hours for adults. Look at the last chart: most of this room isn't getting it.",
  },
  quiz_caffeine: {
    key: "quiz_caffeine",
    kind: "choice",
    prompt: "What's Health Canada's daily caffeine limit for healthy adults?",
    short: "Quiz",
    options: [
      { label: "100 mg", emoji: "🍵" },
      { label: "200 mg", emoji: "☕" },
      { label: "400 mg", emoji: "☕☕☕" },
      { label: "800 mg", emoji: "⚡" },
    ],
    bad: [],
    correct: 2,
    explain: "400 mg, about three cups of brewed coffee. Two big coffees and an energy drink gets you there fast.",
  },
  quiz_genetics: {
    key: "quiz_genetics",
    kind: "choice",
    prompt: "What's the #1 cause of permanent hair loss?",
    short: "Quiz",
    options: [
      { label: "Stress", emoji: "😵" },
      { label: "Wearing hats", emoji: "🧢" },
      { label: "Genetics", emoji: "🧬" },
      { label: "Shampoo", emoji: "🧴" },
    ],
    bad: [],
    correct: 2,
    explain: "Genetics (androgenetic alopecia). Hats are innocent, and stress shedding usually grows back.",
  },
} satisfies Record<string, QuestionDef>;

export type Screen =
  | { type: "lobby"; id: string; section?: undefined }
  | {
      type: "talk";
      id: string;
      section: string;
      speaker: string;
      topic: string;
      num: string;
      title: string;
      bullets: string[];
      emoji: string;
      /** Bald WatCard wall instead of bullets. */
      wall?: boolean;
      /** Emmanuel's SH***WER slide. */
      shower?: boolean;
      /** Picture shown instead of the emoji. */
      image?: string;
      bigWord?: SlideDef["bigWord"];
      timeline?: SlideDef["timeline"];
      chain?: SlideDef["chain"];
      board?: SlideDef["board"];
      /** Speaker's photo for the phones. */
      photo?: string;
      part: number;
      of: number;
    }
  | { type: "question"; id: string; section: string; q: QuestionDef }
  | { type: "double"; id: string; section: string; qs: [QuestionDef, QuestionDef] }
  | { type: "focus"; id: string; section: string }
  | { type: "finale"; id: string; section: string };

function talk(t: TalkDef, id: string): Screen[] {
  return t.slides.map((s, i) => ({
    type: "talk",
    id: `${id}-talk-${i + 1}`,
    section: t.section,
    speaker: t.speaker,
    topic: t.topic,
    num: t.num,
    title: s.title,
    bullets: s.bullets,
    emoji: s.emoji,
    wall: "wall" in s ? s.wall : undefined,
    shower: "shower" in s ? s.shower : undefined,
    image: "image" in s ? s.image : undefined,
    bigWord: "bigWord" in s ? s.bigWord : undefined,
    timeline: "timeline" in s ? s.timeline : undefined,
    chain: "chain" in s ? s.chain : undefined,
    board: "board" in s ? s.board : undefined,
    photo: SPEAKER_PHOTOS[t.speaker],
    part: i + 1,
    of: t.slides.length,
  }));
}

const ask = (t: TalkDef, q: QuestionDef): Screen => ({ type: "question", id: `q-${q.key}`, section: t.section, q });

/** Each section: speaker's slides → poll → quiz. */
export const SCREENS: Screen[] = [
  { type: "lobby", id: "lobby" },

  ...talk(TALKS.waterloo, "s1"),
  ask(TALKS.waterloo, Q.stress),
  ask(TALKS.waterloo, Q.quiz_math135),

  ...talk(TALKS.sleep, "s2"),
  ask(TALKS.sleep, Q.sleep),
  ask(TALKS.sleep, Q.quiz_sleep),

  ...talk(TALKS.eating, "s3"),
  ask(TALKS.eating, Q.meals),
  ask(TALKS.eating, Q.quiz_caffeine),

  // Jeeshaan's section follows his speech: TIME → timeline → chain → the fix → deadline slider poll → study vs scroll.
  // (The Focus Challenge screen still exists: put back
  //  { type: "focus", id: "focus-challenge", section: TALKS.courseload.section } here to use it.)
  ...talk(TALKS.courseload, "s4"),
  ask(TALKS.courseload, Q.deadline),
  { type: "double", id: "q-study-scroll", section: TALKS.courseload.section, qs: [Q.study, Q.scroll] },

  ...talk(TALKS.bald, "s5"),
  ask(TALKS.bald, Q.family),
  ask(TALKS.bald, Q.quiz_genetics),
  { type: "finale", id: "finale", section: TALKS.bald.section },
];

/** The answer keys a screen collects (what the host's Redo button clears). */
export function screenKeys(screen: Screen): QuestionKey[] {
  if (screen.type === "question") return [screen.q.key];
  if (screen.type === "double") return [screen.qs[0].key, screen.qs[1].key];
  if (screen.type === "focus") return ["focus"];
  return [];
}

/**
 * Answers that belong to the round currently running on this screen.
 * Quizzes and the Focus Challenge start a fresh round each time they're shown (or redone),
 * so leftovers from an earlier round must not count. Polls keep all answers.
 */
export function roundAnswers(screen: Screen, answers: AnswerIndex, startedAt: string | null): AnswerIndex {
  if (!(isQuiz(screen) || screen.type === "focus")) return answers;
  const out: AnswerIndex = { ...answers };
  for (const k of screenKeys(screen)) {
    const all = answers[k] ?? {};
    out[k] = Object.fromEntries(Object.entries(all).filter(([, v]) => (v.r ?? null) === startedAt));
  }
  return out;
}

export function isRevealable(screen: Screen) {
  return screen.type === "question" || screen.type === "double";
}

export function isQuiz(screen: Screen): screen is Extract<Screen, { type: "question" }> {
  return screen.type === "question" && screen.q.correct != null;
}
