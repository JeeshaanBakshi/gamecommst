"use client";

import { useEffect, useState, type ReactNode } from "react";

export const STAGE_W = 1920;
export const STAGE_H = 1080;

/**
 * Everything on the host is laid out on a fixed 1920×1080 canvas and scaled to
 * fit the window, so it looks identical on any projector / laptop resolution.
 * `bottom` reserves a strip for the presenter controls so they never cover a slide.
 */
export function Stage({ children, bottom = 0 }: { children: ReactNode; bottom?: number }) {
  const [win, setWin] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));

  useEffect(() => {
    const onResize = () => setWin({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const scale = Math.min(win.w / STAGE_W, (win.h - bottom) / STAGE_H);

  return (
    <div className="fixed inset-x-0 top-0 overflow-hidden bg-gold" style={{ bottom }}>
      <div
        className="bg-grid absolute left-1/2 top-1/2 overflow-hidden"
        style={{ width: STAGE_W, height: STAGE_H, transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
