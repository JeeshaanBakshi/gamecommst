/**
 * Talk slides — one block per speaker, written from each person's script in the group doc.
 * Edit the text freely. Add a slide by adding another object to a `slides` array.
 * While these are on the projector, every phone shows the speaker's photo
 * (or a mic if they have none) — "pay attention if you don't wanna go bald".
 */

export interface SlideDef {
  title: string;
  bullets: string[];
  emoji: string;
  /** Picture shown instead of the emoji (put it in /public/slides/). */
  image?: string;
  /** Show the wall of bald WatCards instead of bullets. */
  wall?: boolean;
  /** Emmanuel's "SH***WER" slide: WATERLOO crossed out in a stink cloud. */
  shower?: boolean;
}

/**
 * Photo shown on everyone's phone while that person presents.
 * To add one: put the image in /public/speakers/ and set the path, e.g. "/speakers/jeeshaan.jpg".
 */
export const SPEAKER_PHOTOS: Record<string, string | undefined> = {
  Gurshaan: "/bald/watcard-gurshaan.jpg",
  Austin: "/bald/watcard-austin.jpg",
  Jacob: undefined,
  Jeeshaan: "/bald/watcard-jeeshaan.jpg",
  Emmanuel: "/bald/watcard-emmanuel.jpg",
};

/** The opening slide: every bald WatCard except the presenters'. */
export const BALD_WALL = [
  "alexis", "yashari", "audrik", "udai", "jessie", "prathiksha", "milia",
  "daniel", "yuvraj", "micheal", "tim", "paria", "arman",
  "tianyu", "richard", "raza", "kevin", "victor", "fan", "joshua",
].map((n) => `/bald/watcard-${n}.jpg`);

export interface TalkDef {
  num: string;
  section: string;
  /** Short topic for phones: "Gurshaan is up, talking about <topic>". */
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
      { title: "The Waterloo Effect", emoji: "🪿", bullets: [], wall: true },
      {
        title: "What is the Waterloo Effect?",
        emoji: "🪪",
        bullets: [
          "The WatCard “before and after” transformation meme",
          "Started on campus meme pages, then went viral, even at US schools and in high schools",
          "It even made it onto r/OntarioGrade12s",
        ],
      },
      {
        title: "Why it hits home",
        emoji: "📉",
        bullets: [
          "University is a lot harder than high school",
          "After the MATH 135 midterm, students got an email: you matter more than your grades",
          "Today: how to avoid becoming the next victim",
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
          "You're supposed to get 7 to 9 hours a night",
          "Most of us get 5, maybe 6 if we're lucky",
          "Your brain saves what you learned while you sleep, so all-nighters = remember less",
        ],
      },
      {
        title: "No sleep → cortisol → hair",
        emoji: "😰",
        image: "/slides/cortisol.jpg",
        bullets: [
          "~18 hours awake ≈ the focus of a 0.05 blood alcohol level",
          "Less sleep = more cortisol, your stress hormone",
          "Hair goes into its resting phase and falls out 2–3 months later",
        ],
      },
      {
        title: "The fix",
        emoji: "😴",
        bullets: [
          "Aim for at least 7 hours",
          "Put your phone down 30 minutes before bed",
          "Stop cramming all night. Your hairline is begging you",
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
        title: "Stress eating",
        emoji: "🍜",
        bullets: [
          "Stress raises cortisol, which drives cravings for sugary and salty food",
          "In one study of students during exams, half skipped more meals",
          "Skip, binge, repeat",
        ],
      },
      {
        title: "400 mg",
        emoji: "☕",
        bullets: [
          "Health Canada: no more than 400 mg of caffeine a day for adults",
          "Filter coffee ≈ 100–140 mg · energy drink ≈ 50–180 mg",
          "Add up what you had yesterday. Over 400? Raise your hand",
        ],
      },
      {
        title: "Feed your hair",
        emoji: "🥚",
        bullets: [
          "Iron, protein, zinc and vitamin D",
          "Cheap fixes: eggs, canned fish, beans, Greek yogurt, peanut butter",
          "Crack an egg or toss frozen veggies into your instant noodles",
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
          "A “perfect” day: 1 presentation, 1 quiz, and a midterm right after",
          "5 courses + co-op apps + clubs = chronic stress",
          "Chronic stress keeps cortisol up for weeks, not hours",
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
    speaker: "Emmanuel",
    slides: [
      { title: "SH***WER", emoji: "🚿", bullets: [], shower: true },
      {
        title: "Hair care 101",
        emoji: "🚿",
        bullets: [
          "Cool or cold water on your head, not hot",
          "Avoid heat: blow dryers, curling irons, straighteners. Use heat protectant",
          "Don't touch or style your hair while it's wet",
        ],
      },
      {
        title: "Massage, LeBron, and your parents",
        emoji: "💆",
        bullets: [
          "Massage your scalp with an oil that suits your hair type",
          "Worst case: the LeBron route (hair transplant)",
          "It's mostly genetics. Blame your parents, not Waterloo",
        ],
      },
    ],
  },
} satisfies Record<string, TalkDef>;
