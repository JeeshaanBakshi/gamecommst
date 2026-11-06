/**
 * Talk slides — one block per speaker. Edit the text freely.
 * Add a third slide by adding another object to a `slides` array.
 * While these are on the projector, every phone shows
 * "<speaker> is speaking — pay attention if you don't wanna go bald".
 */

export interface SlideDef {
  title: string;
  bullets: string[];
  emoji: string;
}

export interface TalkDef {
  num: string;
  section: string;
  /** Short topic for phones: "Gurshaan is speaking about <topic>". */
  topic: string;
  speaker: string;
  slides: SlideDef[];
}

export const TALKS = {
  waterloo: {
    num: "01",
    section: "1 · The Waterloo Effect",
    topic: "the Waterloo Effect",
    speaker: "Gurshaan",
    slides: [
      {
        title: "What is the Waterloo Effect?",
        emoji: "🪿",
        bullets: [
          "Big stress pushes lots of hair follicles into “resting” mode at once",
          "About 2–3 months later, they all shed together (telogen effluvium)",
          "Midterm stress in October → hair in your drain by finals",
        ],
      },
      {
        title: "Why stress hits your hair",
        emoji: "🧪",
        bullets: [
          "Stress hormones like cortisol disrupt the hair growth cycle",
          "Normally ~85–90% of your hairs are in the growing phase",
          "Good news: stress shedding is usually temporary",
        ],
      },
    ],
  },
  sleep: {
    num: "02",
    section: "2 · Sleep Deprivation",
    topic: "sleep deprivation",
    speaker: "Austin",
    slides: [
      {
        title: "Sleep deprivation",
        emoji: "🌙",
        bullets: [
          "Adults need 7+ hours of sleep a night",
          "Short sleep ramps up your stress hormones",
          "Deep sleep is when your body does most of its repair work",
        ],
      },
      {
        title: "The all-nighter math",
        emoji: "🧟",
        bullets: [
          "~17–19 hours awake ≈ reaction time of a 0.05% blood alcohol level",
          "Sleep is when memories get locked in. Cramming at 3am backfires",
          "Less sleep → more stress → sadder hairline",
        ],
      },
    ],
  },
  eating: {
    num: "03",
    section: "3 · Eating Habits",
    topic: "eating habits",
    speaker: "Jacob",
    slides: [
      {
        title: "Eating habits",
        emoji: "🍜",
        bullets: [
          "Hair is made of a protein called keratin",
          "Low protein, low iron and crash dieting can all trigger shedding",
          "Skipping meals + 3 coffees is not a nutrition plan",
        ],
      },
      {
        title: "Hair-friendly fuel",
        emoji: "🥚",
        bullets: [
          "Protein: eggs, beans, chicken, tofu, Greek yogurt",
          "Iron: leafy greens, lentils, red meat",
          "Eat breakfast. An iced capp is not breakfast",
        ],
      },
    ],
  },
  courseload: {
    num: "04",
    section: "4 · Managing Courseload",
    topic: "managing courseload",
    speaker: "Jeeshaan",
    slides: [
      {
        title: "Managing courseload",
        emoji: "📚",
        bullets: [
          "5 courses + co-op apps + clubs = chronic stress",
          "Chronic stress keeps cortisol up for weeks, not hours",
          "Doomscrolling feels like a break, but it isn't rest",
        ],
      },
      {
        title: "How to manage it",
        emoji: "🗓️",
        bullets: [
          "Plan the week on Sunday. Big deadlines first",
          "Study in focused blocks: 25 min on, 5 min break",
          "Phone in another room while you study",
        ],
      },
    ],
  },
  bald: {
    num: "05",
    section: "5 · How Not to Go Bald",
    topic: "how not to go bald",
    speaker: "Gurshaan",
    slides: [
      {
        title: "How not to go bald",
        emoji: "🧬",
        bullets: [
          "Genetics (androgenetic alopecia) is the #1 cause of permanent hair loss",
          "Stress shedding usually grows back in a few months",
          "Shedding for months? See a doctor or dermatologist",
        ],
      },
      {
        title: "The prescription",
        emoji: "🩺",
        bullets: [
          "😴 Sleep 7+ hours",
          "🍳 Eat real meals with protein + iron",
          "🚶 Move, touch grass, take actual breaks",
          "🧘 Plan the term, and talk to someone when it's a lot",
        ],
      },
    ],
  },
} satisfies Record<string, TalkDef>;
