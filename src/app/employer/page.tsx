import Link from "next/link";
import { TrendingUp, Sparkles } from "lucide-react";
import { lek } from "@/lib/money";
import { approvePackage } from "@/lib/actions";
import { Card, Pill, Btn, CategoryIcon } from "@/components/ui";
import { employerDashboard, resolveItems } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Employer() {
  const { member, pending, approvedCount, spent, issued, redeemed } = await employerDashboard();

  return (
    <div className="mx-auto max-w-[860px] px-5 py-7">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ink font-display text-[14px] font-bold text-paper">
            {member.company.name.charAt(0)}
          </span>
          <div>
            <p className="font-display text-[17px] leading-none">{member.company.name}</p>
            <p className="text-[11px] text-muted">HR · Perx</p>
          </div>
        </div>
        <Link href="/" className="text-[12px] font-semibold text-muted">Switch view</Link>
      </header>

      <h1 className="mt-8 font-display text-[30px] leading-tight">The talent edge</h1>
      <p className="mt-1 text-[14px] text-muted">Approve in one tap. See what your people actually value.</p>

      <div className="mt-7 grid gap-6 md:grid-cols-[1fr_310px]">
        <section>
          <h2 className="mb-3 font-display text-[17px]">
            Approvals {pending.length ? <span className="text-accent">· {pending.length}</span> : null}
          </h2>
          {pending.length === 0 ? (
            <Card><p className="text-[14px] text-muted">No requests waiting. When an employee submits a pack, it lands here.</p></Card>
          ) : (
            <div className="space-y-3">
              {pending.map((p) => {
                const items = resolveItems(p.itemOfferIds);
                const taxFree = items.length > 0 && items.every((o) => o.taxFree);
                const cats = Array.from(new Set(items.map((o) => o.category)));
                return (
                  <Card key={p.id} className="space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[12px] text-muted">{p.membership.displayName} · {p.membership.department}</p>
                        <p className="font-display text-[19px] leading-tight">{p.label}</p>
                      </div>
                      <span className="shrink-0 font-display text-[19px]">{lek(p.totalLek)}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {cats.map((c) => (
                        <span key={c} className="grid h-7 w-7 place-items-center rounded-lg bg-primary-soft text-primary-ink">
                          <CategoryIcon category={c} className="h-4 w-4" />
                        </span>
                      ))}
                      {taxFree ? <Pill tone="primary">Tax-free</Pill> : <Pill tone="accent">Mixed tax</Pill>}
                      <Pill tone="line">within budget</Pill>
                    </div>
                    <form action={approvePackage.bind(null, p.id)}>
                      <Btn full type="submit" variant="primary">Approve &amp; fund</Btn>
                    </form>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <Card className="bg-ink text-paper">
            <div className="flex items-center gap-2 text-paper/70"><TrendingUp className="h-4 w-4" strokeWidth={2} /><span className="text-[12px]">This month</span></div>
            <p className="mt-2 font-display text-[30px] leading-none">{lek(spent)}</p>
            <p className="text-[12px] text-paper/60">spent on {approvedCount} approved pack{approvedCount === 1 ? "" : "s"}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-paper/15 pt-3">
              <div><p className="font-display text-[20px]">{issued}</p><p className="text-[11px] text-paper/60">vouchers issued</p></div>
              <div><p className="font-display text-[20px]">{redeemed}</p><p className="text-[11px] text-paper/60">redeemed</p></div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 text-muted"><Sparkles className="h-4 w-4" /><span className="text-[12px]">Pulse sentiment</span></div>
            <p className="mt-2 text-[15px] leading-snug"><strong className="text-accent">62%</strong> of your team felt <strong>stressed or tired</strong> this week.</p>
            <p className="mt-1 text-[12.5px] text-muted">Top requests: wellness, food, fitness.</p>
          </Card>

          <Card>
            <p className="text-[13px] font-semibold">Loved · unused</p>
            <p className="mt-1 text-[13px] text-ink-soft">Wellness +38% redemptions. <span className="text-muted">Learning credit going unused — reallocate?</span></p>
          </Card>

          <Link href="/billing" className="block">
            <Card className="flex items-center justify-between transition active:scale-[0.99]">
              <div>
                <p className="text-[13px] font-semibold">Subscription</p>
                <p className="mt-0.5 text-[12.5px] text-muted">Perx for Teams · Lemon Squeezy</p>
              </div>
              <Pill tone={member.company.subscriptionStatus === "ACTIVE" ? "primary" : "accent"}>
                {member.company.subscriptionStatus === "ACTIVE" ? "Active" : "Set up"}
              </Pill>
            </Card>
          </Link>
        </aside>
      </div>
    </div>
  );
}
