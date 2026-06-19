import { Coins } from "lucide-react";
import { offerById } from "@/lib/catalog";
import { lek } from "@/lib/money";
import { Card } from "@/components/ui";
import { VoucherCard } from "@/components/VoucherCard";
import { walletData } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Wallet() {
  const { member, vouchers } = await walletData();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-[28px]">Wallet</h1>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-[12.5px] text-muted">Perks budget</p>
          <p className="mt-1 font-display text-[26px] leading-none">{lek(member.perksBudgetLek)}</p>
        </Card>
        <Card>
          <p className="text-[12.5px] text-muted">Recognition coins</p>
          <p className="mt-1 flex items-center gap-1.5 font-display text-[26px] leading-none">
            <Coins className="h-5 w-5 text-gold" strokeWidth={2} />
            {member.recognitionCoins.toLocaleString("en-US")}
          </p>
        </Card>
      </div>

      <div className="flex items-start gap-3 rounded-[18px] border border-line bg-card px-4 py-3.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">★</span>
        <p className="text-[13px] leading-snug text-ink-soft">
          You earned <strong className="text-ink">+500 coins</strong> for Employee of the Month — spend them on any perk above your budget.
        </p>
      </div>

      <div>
        <h2 className="mb-2.5 font-display text-[16px]">Vouchers</h2>
        {vouchers.length === 0 ? (
          <Card>
            <p className="text-[14px] text-muted">No vouchers yet — build a pack and get it approved to see them here.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {vouchers.flatMap((v) => {
              const o = offerById(v.offerId);
              return o
                ? [<VoucherCard key={v.id} title={o.title} provider={o.providerName} code={v.code} redeemed={v.status === "REDEEMED"} />]
                : [];
            })}
          </div>
        )}
      </div>
    </div>
  );
}
