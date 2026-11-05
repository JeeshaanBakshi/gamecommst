"use client";

import { useEffect, useState, type ReactNode } from "react";

export const STAGE_W = 1920;
export const STAGE_H = 1080;

/**
 * Everything on the host is laid out on a fixed 1920×1080 canvas and scaled to
 * fit the window, so it looks identical on any projector / laptop resolution.
 */
export function Stage({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  const [scale, setScale] = useState(() => Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H));

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H));
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <div className={`fixed inset-0 overflow-hidden transition-colors duration-500 ${dark ? "bg-ink" : "bg-gold"}`}>
      <div
        className={`absolute left-1/2 top-1/2 overflow-hidden ${dark ? "bg-grid-dark" : "bg-grid"}`}
        style={{ width: STAGE_W, height: STAGE_H, transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
