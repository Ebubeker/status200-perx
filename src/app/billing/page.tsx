import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import { requireMember } from "@/lib/auth";
import { startSubscriptionCheckout } from "@/lib/actions";
import { Card, Btn, Pill } from "@/components/ui";

export const dynamic = "force-dynamic";

const FEATURES = [
  "Unlimited employees & weekly Pulse",
  "AI perk packages from local providers",
  "One-tap HR approvals & the talent edge",
  "Recognition coins & redemption tracking",
];

export default async function Billing() {
  const member = await requireMember();
  const active = member.company.subscriptionStatus === "ACTIVE";

  return (
    <div className="mx-auto max-w-[560px] px-5 py-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ink font-display text-[14px] font-bold text-paper">
            {member.company.name.charAt(0)}
          </span>
          <div>
            <p className="font-display text-[17px] leading-none">{member.company.name}</p>
            <p className="text-[11px] text-muted">Billing · Perx</p>
          </div>
        </div>
        <Link href="/employer" className="text-[12px] font-semibold text-muted">Back to HR</Link>
      </header>

      <h1 className="mt-8 font-display text-[30px] leading-tight">Perx for Teams</h1>
      <p className="mt-1 text-[14px] text-muted">
        The company subscription that funds everyone&apos;s perks. Billed via Lemon Squeezy — Merchant of Record for Albania.
      </p>

      <Card className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-display text-[20px]">Team plan</span>
          {active ? <Pill tone="primary">Active</Pill> : <Pill tone="accent">Not active</Pill>}
        </div>
        <ul className="space-y-2">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-[14px] text-ink-soft">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.4} />
              {f}
            </li>
          ))}
        </ul>

        {active ? (
          <div className="flex items-center gap-2 rounded-[14px] border border-primary/20 bg-primary-soft px-4 py-3 text-[13px] text-primary-ink">
            <ShieldCheck className="h-4 w-4 text-primary" strokeWidth={1.8} />
            Subscription active — managed in Lemon Squeezy (test mode).
          </div>
        ) : (
          <form action={startSubscriptionCheckout}>
            <Btn full type="submit" variant="primary" className="py-3.5 text-base">Start test checkout</Btn>
          </form>
        )}
      </Card>

      <p className="mt-4 text-center text-[12px] text-muted">
        Test mode — use card 4242 4242 4242 4242, any future date and CVC.
      </p>
    </div>
  );
}
