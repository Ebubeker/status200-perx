import Link from "next/link";
import { offerById } from "@/lib/catalog";
import { redeemVoucher } from "@/lib/actions";
import { Card, Pill, Btn } from "@/components/ui";
import { providerInbox } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Provider() {
  const { provider, vouchers } = await providerInbox();
  const name = provider?.name ?? "Nobis Wellness";

  return (
    <div className="mx-auto max-w-[760px] px-5 py-7">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent font-display text-[14px] font-bold text-white">{name.charAt(0)}</span>
          <div>
            <p className="font-display text-[17px] leading-none">{name}</p>
            <p className="text-[11px] text-muted">Provider · Perx</p>
          </div>
        </div>
        <Link href="/" className="text-[12px] font-semibold text-muted">Switch view</Link>
      </header>

      <h1 className="mt-8 font-display text-[30px] leading-tight">Incoming orders</h1>
      <p className="mt-1 text-[14px] text-muted">Employer-funded customers, sent straight to you.</p>

      <div className="mt-6 flex items-start gap-3 rounded-[18px] border border-primary/20 bg-primary-soft px-4 py-3.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-white">↗</span>
        <p className="text-[13px] leading-snug text-primary-ink">
          <strong>23 employees</strong> across Tirana want wellness + fitness bundles this week. Add an offer to catch the demand.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {vouchers.length === 0 ? (
          <Card><p className="text-[14px] text-muted">No orders yet. When HR approves a pack with your offer, it appears here with a redeem code.</p></Card>
        ) : (
          vouchers.flatMap((v) => {
            const o = offerById(v.offerId);
            if (!o) return [];
            return [
              <Card key={v.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-[17px]">{o.title}</p>
                  <p className="truncate text-[12px] text-muted">{o.providerName} · code <span className="font-mono text-ink-soft">{v.code}</span></p>
                </div>
                {v.status === "REDEEMED" ? (
                  <Pill tone="line">Redeemed</Pill>
                ) : (
                  <form action={redeemVoucher.bind(null, v.id)}>
                    <Btn type="submit" variant="primary">Redeem</Btn>
                  </form>
                )}
              </Card>,
            ];
          })
        )}
      </div>
    </div>
  );
}
