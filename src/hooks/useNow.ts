"use client";

import { useEffect, useState } from "react";
import { serverNow } from "@/lib/clock";

/** Re-renders on an interval with the (server-corrected) current time. */
export function useNow(active = true, intervalMs = 200) {
  const [now, setNow] = useState(() => serverNow());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(serverNow()), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
  return now;
}
