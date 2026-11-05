/**
 * Phones and the host laptop rarely agree on the time. We estimate the offset
 * to the database clock once so timed rounds end at the same moment everywhere.
 */
let offset = 0;

export const serverNow = () => Date.now() + offset;

export async function syncClock(fetchServerTime: () => Promise<number>) {
  try {
    const samples: number[] = [];
    for (let i = 0; i < 3; i++) {
      const t0 = Date.now();
      const s = await fetchServerTime();
      const t1 = Date.now();
      samples.push(s - (t0 + t1) / 2);
    }
    samples.sort((a, b) => a - b);
    offset = samples[1];
  } catch {
    offset = 0;
  }
}

export function elapsedSince(iso: string | null, now: number) {
  return iso ? now - Date.parse(iso) : 0;
}
