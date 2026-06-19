import { lek } from "@/lib/money";
import { Card, Pill, Btn, CategoryIcon } from "@/components/ui";
import { ChooseButton } from "@/components/ChooseButton";
import { discoverData, resolveItems } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Discover() {
  const { recs } = await discoverData();

  if (!recs.length) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-[24px]">Nothing here yet</h1>
        <p className="mt-2 max-w-[260px] text-[14px] text-muted">Take this week&apos;s Pulse and Perx will build perk packs for you.</p>
        <div className="mt-6"><Btn href="/app/pulse" variant="primary">Take the Pulse</Btn></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[13px] font-semibold tracking-wide text-accent">DISCOVER WEEKLY</p>
        <h1 className="mt-1 font-display text-[28px] leading-tight">Built for your week</h1>
        <p className="mt-1 text-[14px] text-muted">AI-picked from local providers, inside your budget.</p>
      </div>

      {recs.map((rec) => {
        const items = resolveItems(rec.itemOfferIds);
        const taxFree = items.length > 0 && items.every((o) => o.taxFree);
        return (
          <Card key={rec.id} className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-[21px] leading-tight">{rec.label}</h2>
                <span className="shrink-0 font-display text-[19px]">{lek(rec.totalLek)}</span>
              </div>
              <p className="mt-1 text-[13.5px] leading-snug text-ink-soft">{rec.rationale}</p>
            </div>

            <div className="space-y-2.5">
              {items.map((o) => (
                <div key={o.id} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-ink">
                    <CategoryIcon category={o.category} className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">{o.title}</p>
                    <p className="truncate text-[12px] text-muted">{o.providerName} · {o.area}</p>
                  </div>
                  <span className="shrink-0 text-[13px] font-semibold text-ink-soft">{lek(o.priceLek)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {taxFree && <Pill tone="primary">Tax-free</Pill>}
              <Pill tone="line">{items.length} providers</Pill>
            </div>

            <ChooseButton recId={rec.id} />
          </Card>
        );
      })}

      <div className="pt-1 text-center">
        <Btn href="/app/pulse" variant="ghost">Retake the Pulse</Btn>
      </div>
    </div>
  );
}
