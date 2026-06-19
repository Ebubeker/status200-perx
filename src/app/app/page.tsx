import Link from "next/link";
import { ArrowRight, Coins, Sparkles } from "lucide-react";
import { lek } from "@/lib/money";
import { Card, Pill } from "@/components/ui";
import { employeeHome } from "@/lib/queries";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PENDING: "Awaiting approval",
  APPROVED: "Approved",
  REJECTED: "Declined",
};

export default async function EmployeeHome() {
  const { member, latest } = await employeeHome();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[14px] text-muted">Mirëmëngjes,</p>
        <h1 className="font-display text-[30px] leading-tight">{member.displayName} 👋</h1>
      </div>

      {/* Wallet */}
      <Card className="bg-ink text-paper">
        <p className="text-[13px] text-paper/70">Your perks balance this month</p>
        <div className="mt-1 flex items-end justify-between">
          <p className="font-display text-[40px] leading-none">{lek(member.perksBudgetLek)}</p>
          <div className="flex items-center gap-1.5 rounded-full bg-paper/10 px-3 py-1.5 text-[13px] font-semibold">
            <Coins className="h-4 w-4 text-gold" strokeWidth={2} />
            {member.recognitionCoins.toLocaleString("en-US")} coins
          </div>
        </div>
        <p className="mt-3 text-[12px] text-paper/60">Funded by {member.company.name} · recognition coins stack on top</p>
      </Card>

      {/* Weekly pulse CTA */}
      <Link href="/app/pulse" className="block">
        <div className="flex items-center justify-between rounded-[18px] border border-primary/25 bg-primary-soft px-5 py-4 transition active:scale-[0.99]">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-white">
              <Sparkles className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <div>
              <p className="font-display text-[18px] text-primary-ink">Your weekly Pulse is ready</p>
              <p className="text-[13px] text-primary-ink/70">5 taps → a perk pack made for your week</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-primary-ink" strokeWidth={1.8} />
        </div>
      </Link>

      {/* Recent */}
      {latest && (
        <div>
          <h2 className="mb-2 font-display text-[16px]">Your latest pack</h2>
          <Link href={`/app/package/${latest.id}`}>
            <Card className="flex items-center justify-between">
              <div>
                <p className="font-display text-[17px]">{latest.label}</p>
                <p className="text-[13px] text-muted">{lek(latest.totalLek)} · {latest.itemOfferIds.length} offers</p>
              </div>
              <Pill tone={latest.status === "APPROVED" ? "primary" : latest.status === "PENDING" ? "accent" : "line"}>
                {STATUS_LABEL[latest.status]}
              </Pill>
            </Card>
          </Link>
        </div>
      )}

      <p className="pt-2 text-center text-[12px] text-muted">
        Discover, with intention. No endless scrolling.
      </p>
    </div>
  );
}
