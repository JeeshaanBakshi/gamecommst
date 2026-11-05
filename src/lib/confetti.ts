import confetti from "canvas-confetti";

const COLORS = ["#fed34c", "#111111", "#e2342d", "#fffcef", "#e8a800"];

export function burst(big = false) {
  const opts = { disableForReducedMotion: true, colors: COLORS, zIndex: 60 };
  if (!big) {
    void confetti({ ...opts, particleCount: 90, spread: 80, origin: { y: 0.65 }, scalar: 1.1 });
    return;
  }
  void confetti({ ...opts, particleCount: 160, angle: 60, spread: 70, origin: { x: 0, y: 0.75 }, scalar: 1.3 });
  void confetti({ ...opts, particleCount: 160, angle: 120, spread: 70, origin: { x: 1, y: 0.75 }, scalar: 1.3 });
  setTimeout(() => void confetti({ ...opts, particleCount: 200, spread: 140, origin: { y: 0.4 }, scalar: 1.2 }), 350);
}
