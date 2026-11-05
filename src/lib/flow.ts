import { TALKS, type TalkDef } from "./slides";
import type { QuestionKey } from "./types";

export const MATH_DURATION_MS = 30_000;
export const PULSE_SECONDS = 15;
/** Quizzes auto-reveal after this long (or as soon as everyone has answered). */
export const QUIZ_MS = 15_000;

export interface ChoiceOption {
  label: string;
  emoji: string;
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

  /* ---- quizzes (right/wrong, 15s timer) ---- */
  quiz_shed: {
    key: "quiz_shed",
    kind: "choice",
    prompt: "How long after a big stressful event does stress shedding usually start?",
    short: "Quiz",
    options: [
      { label: "2–3 days", emoji: "⚡" },
      { label: "2–3 weeks", emoji: "📅" },
      { label: "2–3 months", emoji: "🗓️" },
      { label: "2–3 years", emoji: "⏳" },
    ],
    bad: [],
    correct: 2,
    explain: "Follicles go into resting mode, then shed 2–3 months later. Midterm stress shows up around finals.",
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
  quiz_iron: {
    key: "quiz_iron",
    kind: "choice",
    prompt: "Which of these is a classic cause of hair shedding?",
    short: "Quiz",
    options: [
      { label: "Too little caffeine", emoji: "☕" },
      { label: "Low iron", emoji: "🥬" },
      { label: "Too little sugar", emoji: "🍬" },
      { label: "Too much water", emoji: "💧" },
    ],
    bad: [],
    correct: 1,
    explain: "Low iron (and low protein) are well-known shedding triggers. Caffeine is not a vitamin.",
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
      alert?: boolean;
      part: number;
      of: number;
    }
  | { type: "question"; id: string; section: string; q: QuestionDef }
  | { type: "double"; id: string; section: string; qs: [QuestionDef, QuestionDef] }
  | { type: "pulse"; id: string; section: string; key: "pulse_before" | "pulse_after" }
  | { type: "math"; id: string; section: string }
  | { type: "stressResults"; id: string; section: string }
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
    alert: "alert" in s ? s.alert : undefined,
    part: i + 1,
    of: t.slides.length,
  }));
}

const ask = (t: TalkDef, q: QuestionDef): Screen => ({ type: "question", id: `q-${q.key}`, section: t.section, q });

const ST = "4 · Stress Test";

/** Each section: speaker's slides → poll → quiz. */
export const SCREENS: Screen[] = [
  { type: "lobby", id: "lobby" },

  ...talk(TALKS.waterloo, "s1"),
  ask(TALKS.waterloo, Q.stress),
  ask(TALKS.waterloo, Q.quiz_shed),

  ...talk(TALKS.sleep, "s2"),
  ask(TALKS.sleep, Q.sleep),
  ask(TALKS.sleep, Q.quiz_sleep),

  ...talk(TALKS.eating, "s3"),
  ask(TALKS.eating, Q.meals),
  ask(TALKS.eating, Q.quiz_iron),

  ...talk(TALKS.courseload, "s4"),
  { type: "double", id: "q-study-scroll", section: TALKS.courseload.section, qs: [Q.study, Q.scroll] },
  { type: "pulse", id: "pulse-before", section: ST, key: "pulse_before" },
  { type: "math", id: "math", section: ST },
  { type: "pulse", id: "pulse-after", section: ST, key: "pulse_after" },
  { type: "stressResults", id: "stress-results", section: ST },

  ...talk(TALKS.bald, "s5"),
  ask(TALKS.bald, Q.family),
  ask(TALKS.bald, Q.quiz_genetics),
  { type: "finale", id: "finale", section: TALKS.bald.section },
];

/** Which answer key a screen collects (for "answered" counts + demo bots). */
export function screenKeys(screen: Screen): QuestionKey[] {
  switch (screen.type) {
    case "question":
      return [screen.q.key];
    case "double":
      return [screen.qs[0].key, screen.qs[1].key];
    case "pulse":
      return [screen.key];
    case "math":
      return ["math"];
    default:
      return [];
  }
}

export function isRevealable(screen: Screen) {
  return screen.type === "question" || screen.type === "double";
}

export function isQuiz(screen: Screen): screen is Extract<Screen, { type: "question" }> {
  return screen.type === "question" && screen.q.correct != null;
}
