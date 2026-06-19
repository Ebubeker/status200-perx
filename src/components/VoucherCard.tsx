"use client";

import { QRCodeSVG } from "qrcode.react";
import { Card, Pill } from "./ui";

export function VoucherCard({
  title, provider, code, redeemed,
}: {
  title: string; provider: string; code: string; redeemed: boolean;
}) {
  return (
    <Card className="flex items-center gap-4">
      <div className="rounded-xl border border-line bg-white p-2">
        <QRCodeSVG value={code} size={66} fgColor="#1a1916" bgColor="#ffffff" level="M" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[16px]">{title}</p>
        <p className="truncate text-[13px] text-muted">{provider}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-md bg-ink/5 px-2 py-0.5 font-mono text-[12px] tracking-wide text-ink-soft">{code}</span>
          {redeemed ? <Pill tone="line">Redeemed</Pill> : <Pill tone="primary">Ready</Pill>}
        </div>
      </div>
    </Card>
  );
}
