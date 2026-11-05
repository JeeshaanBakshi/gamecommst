export interface MathQ {
  text: string;
  answer: number;
}

function rng(seedStr: string) {
  let a = 0;
  for (const ch of seedStr) a = (a * 31 + ch.charCodeAt(0)) | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Same five questions for everyone in a room, so the leaderboard is fair. */
export function mathQuestions(seed: string): MathQ[] {
  const r = rng(seed);
  const int = (lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

  const a1 = int(14, 19), b1 = int(4, 8);
  const d2 = int(6, 12), q2 = int(7, 14);
  const a3 = int(38, 79), b3 = int(27, 59);
  const a4 = int(81, 99), b4 = int(28, 57);
  const a5 = int(11, 15), b5 = int(3, 6), c5 = int(5, 19);

  return [
    { text: `${a1} × ${b1}`, answer: a1 * b1 },
    { text: `${d2 * q2} ÷ ${d2}`, answer: q2 },
    { text: `${a3} + ${b3}`, answer: a3 + b3 },
    { text: `${a4} − ${b4}`, answer: a4 - b4 },
    { text: `${a5} × ${b5} + ${c5}`, answer: a5 * b5 + c5 },
  ];
}
