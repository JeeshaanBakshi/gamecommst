import type { QuestionKey } from "./types";

/** Edit names here — they show up on the section title cards. */
export const PRESENTERS = {
  s1: "Gurshaan",
  s2: "Austin",
  s3: "", // Eating habits — add a name if someone owns this section
  s4: "Jeeshaan",
  s5: "", // How not to go bald
};

export const MATH_DURATION_MS = 30_000;
export const PULSE_SECONDS = 15;

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
  /** Option indexes that count as "bad for your hairline" (highlighted in red pen). */
  bad: number[];
}

export const Q = {
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
  study: {
    key: "study",
    kind: "choice",
    prompt: "Hours studying per day?",
    short: "Study",
    options: HOUR_BUCKETS(),
    bad: [],
  },
  scroll: {
    key: "scroll",
    kind: "choice",
    prompt: "Hours doomscrolling per day?",
    short: "Doomscroll",
    options: HOUR_BUCKETS(),
    bad: [],
  },
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
} satisfies Record<string, QuestionDef>;

function HOUR_BUCKETS(): ChoiceOption[] {
  return [
    { label: "0–1h", emoji: "🫠" },
    { label: "1–2h", emoji: "🙂" },
    { label: "2–4h", emoji: "😤" },
    { label: "4–6h", emoji: "🔥" },
    { label: "6h+", emoji: "🤖" },
  ];
}

/** Midpoint hours for each HOUR_BUCKETS option, used for averages. */
export const HOUR_MIDPOINTS = [0.5, 1.5, 3, 5, 7];

export type Screen =
  | { type: "lobby"; id: string; section?: undefined }
  | {
      type: "section";
      id: string;
      num: string;
      title: string;
      presenter?: string;
      emoji: string;
      note: string;
      variant?: "alert";
      section?: string;
    }
  | { type: "question"; id: string; section: string; q: QuestionDef }
  | { type: "double"; id: string; section: string; qs: [QuestionDef, QuestionDef] }
  | { type: "pulse"; id: string; section: string; key: "pulse_before" | "pulse_after" }
  | { type: "math"; id: string; section: string }
  | { type: "stressResults"; id: string; section: string }
  | { type: "finale"; id: string; section: string }
  | { type: "end"; id: string; section?: undefined };

const S1 = "1 · The Waterloo Effect";
const S2 = "2 · Sleep Deprivation";
const S3 = "3 · Eating Habits";
const S4 = "4 · Managing Courseload";
const ST = "4 · Stress Test";
const S5 = "5 · How Not to Go Bald";

export const SCREENS: Screen[] = [
  { type: "lobby", id: "lobby" },

  {
    type: "section",
    id: "s1",
    num: "01",
    title: "What is the Waterloo Effect?",
    presenter: PRESENTERS.s1,
    emoji: "🪿",
    note: "Big stress can push hair follicles into their resting phase all at once. Then they shed about 2–3 months later. Just in time for finals.",
  },
  { type: "question", id: "q-stress", section: S1, q: Q.stress },

  {
    type: "section",
    id: "s2",
    num: "02",
    title: "Sleep Deprivation",
    presenter: PRESENTERS.s2,
    emoji: "🌙",
    note: "Short sleep ramps up stress hormones. Your follicles notice even when your prof doesn't.",
  },
  { type: "question", id: "q-sleep", section: S2, q: Q.sleep },

  {
    type: "section",
    id: "s3",
    num: "03",
    title: "Eating Habits",
    presenter: PRESENTERS.s3,
    emoji: "🍜",
    note: "Hair is made of protein. Low protein and low iron are classic triggers for shedding. A granola bar is not a meal.",
  },
  { type: "question", id: "q-meals", section: S3, q: Q.meals },

  {
    type: "section",
    id: "s4",
    num: "04",
    title: "Managing Courseload",
    presenter: PRESENTERS.s4,
    emoji: "📚",
    note: "Chronic stress keeps cortisol high for weeks. Your follicles are basically taking five courses too.",
  },
  { type: "double", id: "q-study-scroll", section: S4, qs: [Q.study, Q.scroll] },

  {
    type: "section",
    id: "stress-test",
    num: "⚠",
    title: "STRESS TEST ROUND",
    presenter: PRESENTERS.s4,
    emoji: "🚨",
    variant: "alert",
    note: "Pulse check, then 30 seconds of mental math, then another pulse check. We will watch your heart rate go up live.",
  },
  { type: "pulse", id: "pulse-before", section: ST, key: "pulse_before" },
  { type: "math", id: "math", section: ST },
  { type: "pulse", id: "pulse-after", section: ST, key: "pulse_after" },
  { type: "stressResults", id: "stress-results", section: ST },

  {
    type: "section",
    id: "s5",
    num: "05",
    title: "How Not to Go Bald",
    presenter: PRESENTERS.s5,
    emoji: "🧬",
    note: "Genetics is the main cause of permanent hair loss. Stress shedding is usually temporary, so there's hope.",
  },
  { type: "question", id: "q-family", section: S5, q: Q.family },
  { type: "finale", id: "finale", section: S5 },
  { type: "end", id: "end" },
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
