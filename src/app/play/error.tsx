"use client";

import { CrashScreen } from "@/components/CrashScreen";

export default function Error({ error }: { error: unknown; retry: () => void }) {
  return <CrashScreen error={error} />;
}
