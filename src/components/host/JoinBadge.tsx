"use client";

import { QRCodeSVG } from "qrcode.react";

/** Small "scan to join" QR shown on every slide so late arrivals can still get in. */
export function JoinBadge({ url, code }: { url: string; code: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border-[3px] border-ink bg-paper py-1 pl-1 pr-4 shadow-hard-sm">
      <div className="rounded-md bg-white p-1">
        <QRCodeSVG value={url} size={78} level="M" marginSize={0} fgColor="#111111" />
      </div>
      <div className="font-mono font-bold leading-tight text-ink">
        <div className="text-sm uppercase">Scan to join</div>
        <div className="text-3xl tracking-[0.2em]">{code}</div>
      </div>
    </div>
  );
}
