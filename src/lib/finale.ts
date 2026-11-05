/** Shared reveal timeline so phones know when the host's reveal has finished. */
export const FINALE_TOP = 8;

export function finaleTimeline(playerCount: number) {
  const n = Math.max(1, Math.min(FINALE_TOP, playerCount));
  const revealAt = (rank: number) => 1200 + (n - rank) * 1300;
  const drumAt = (n > 1 ? revealAt(2) : 0) + 900;
  const winnerAt = drumAt + 3000;
  return {
    n,
    revealAt: (rank: number) => (rank === 1 ? winnerAt : revealAt(rank)),
    drumAt,
    winnerAt,
    totalMs: winnerAt + 1500,
  };
}
