"use client";

import dynamic from "next/dynamic";

function Loading() {
  return (
    <div className="bg-grid fixed inset-0 grid place-items-center">
      <div className="animate-bob text-7xl">🪿</div>
    </div>
  );
}

export const HostEntry = dynamic(() => import("./host/HostApp").then((m) => m.HostApp), { ssr: false, loading: Loading });
export const PlayEntry = dynamic(() => import("./play/PlayApp").then((m) => m.PlayApp), { ssr: false, loading: Loading });
