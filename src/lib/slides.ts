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
  Jacob: "/bald/watcard-jacob.jpg",
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
        title: "You studied all night. So where did it go?",
        emoji: "🌙",
        bullets: [
          "You need 7–9 hours a night. At Waterloo, that's how long the line at Tims is",
          "Most of us run on 5, maybe 6 if we're lucky",
          "Your brain saves what you learned while you sleep. All-nighter = study more, remember less",
        ],
      },
      {
        title: "No sleep → cortisol → hair",
        emoji: "😰",
        image: "/slides/cortisol.jpg",
        bullets: [
          "~18 hours awake ≈ a 0.05 blood alcohol level. That 9am exam? You wrote it tipsy",
          "No sleep = more cortisol, your stress hormone",
          "Hair hits its resting phase and falls out 2–3 months later. Your January pillow is a midterm souvenir",
        ],
      },
      {
        title: "The fix",
        emoji: "😴",
        bullets: [
          "Aim for at least 7 hours",
          "Phone down 30 minutes before bed",
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
          "Stress raises cortisol, and cortisol craves sugary, salty comfort food",
          "That 11pm cup noodle? Might be biology, not just cravings",
          "In a study of students during exams, half skipped more meals. Skip, binge, repeat",
        ],
      },
      {
        title: "400 mg",
        emoji: "☕",
        bullets: [
          "Health Canada's daily caffeine limit for healthy adults (about three 8 oz coffees)",
          "Filter coffee ≈ 100–140 mg · Energy drink ≈ 50–180 mg",
          "Add up your day before exams. Over 400? Raise your hand ✋",
        ],
      },
      {
        title: "Iron · Protein · Zinc · Vitamin D",
        emoji: "🥬",
        bullets: [
          "The four nutrients research links to hair growth and maintenance",
          "Hair is one of the fastest-growing tissues, so it's first to show a bad diet",
          "Food first. Supplements matter most if you're actually low, so talk to a doctor",
        ],
      },
      {
        title: "Cheap student fixes",
        emoji: "🥚",
        bullets: [
          "Eggs, canned fish, beans and lentils, Greek yogurt, peanut butter",
          "Cheap, fast, and they cover most of those four nutrients",
          "Crack an egg or toss frozen veggies into your instant noodles. 30 seconds",
        ],
      },
      {
        title: "Recap",
        emoji: "📝",
        bullets: [
          "Stress changes what we eat",
          "Caffeine fuels the cycle",
          "The right foods help protect your hair",
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
        title: "My \u201cperfect\u201d day",
        emoji: "📅",
        bullets: [
          "📽️ A presentation (hi, it's this one)",
          "📝 A quiz",
          "💀 And a midterm right after, for flavour",
        ],
      },
      {
        title: "Stress that never clocks out",
        emoji: "⏰",
        bullets: [
          "5 courses + co-op apps + clubs + the group chat that only says \u201csounds good\u201d",
          "One stressful day: your body handles it. Every week: cortisol stays high for weeks",
          "Same cortisol Austin and Jacob warned you about. Now it's on your hairline's schedule",
        ],
      },
      {
        title: "Plan it. Block it. Banish it.",
        emoji: "🍅",
        bullets: [
          "Plan the week on Sunday. 10 minutes now saves a 3am panic on Thursday",
          "25 minutes on, 5 off: the Pomodoro technique (named after a tomato timer 🍅)",
          "Phone in another room. Even face-down on your desk, it drags your focus",
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
          "Cool or cold water on your head. Heat is your scalp's worst enemy",
          "Blow dryers, curling irons, straighteners: avoid, or use a heat protectant spray",
          "Don't touch or style your hair while it's wet. It looks great. Leave it alone",
        ],
      },
      {
        title: "Massage, LeBron, and your parents",
        emoji: "💆",
        bullets: [
          "Free scalp massage (Terry Crews not included). Add an oil that suits your hair type",
          "Worst case: the LeBron route. Hair transplant, bald to Rapunzel",
          "It's mostly genetics. Don't blame Waterloo, blame your parents",
        ],
      },
    ],
  },
} satisfies Record<string, TalkDef>;
