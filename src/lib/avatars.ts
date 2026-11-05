export const AVATARS = [
  "🪿", "😎", "🤓", "🥸", "🤠", "🤯", "😴", "🥶", "🫠", "🤡", "👽", "🤖",
  "👻", "🐸", "🐵", "🦁", "🐼", "🐨", "🦊", "🐯", "🐻", "🦉", "🐧", "🦝",
];

export const WAITING_LINES = [
  "Waiting for the host… like waiting for Quest to load.",
  "Stay still. A goose is watching you.",
  "Hydrate. Your follicles are begging.",
  "Next question loading… unlike your co-op offers.",
  "Your hairline called. It wants answers.",
  "Plotting your follicular future…",
  "Deep breath in. Deep breath out. Midterm.",
  "Fun fact: losing 50–100 hairs a day is normal. Probably.",
  "Somewhere in DC, a CS student just lost a hair.",
  "Eyes up! The big screen is where the drama is.",
  "Buffering… like the Wi-Fi in MC.",
  "Please do not feed the geese. Or the TAs.",
];

const ADJ = ["Sleepy", "Crispy", "Caffeinated", "Feral", "Stressed", "Balding", "Goosey", "Cooked", "Haunted", "Tired"];
const NOUN = ["Goose", "Mathie", "Engineer", "Coder", "Raccoon", "Follicle", "Intern", "Hairline", "Scholar", "Gremlin"];

export function randomNickname() {
  const a = ADJ[Math.floor(Math.random() * ADJ.length)];
  const n = NOUN[Math.floor(Math.random() * NOUN.length)];
  return `${a} ${n}`;
}

/** Tiny filter so the projector stays classroom-safe. Not exhaustive; host can kick. */
const BLOCK = ["fuck", "shit", "bitch", "cunt", "dick", "cock", "pussy", "nigg", "fag", "slut", "whore", "rape", "porn", "penis", "vagina"];

export function cleanNickname(raw: string) {
  const name = raw.replace(/\s+/g, " ").trim().slice(0, 16);
  const flat = name.toLowerCase().replace(/[^a-z]/g, "");
  if (BLOCK.some((b) => flat.includes(b))) return null;
  return name || null;
}
