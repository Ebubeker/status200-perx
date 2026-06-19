import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { lek } from "@/lib/money";
import { submitPackage } from "@/lib/actions";
import { Card, Btn, CategoryIcon } from "@/components/ui";
import { packageById, resolveItems } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { pkg } = await packageById(id);

  if (!pkg) {
    return (
      <div className="py-24 text-center text-muted">
        Pack not found. <Link href="/app/discover" className="text-primary underline">Back to discover</Link>
      </div>
    );
  }

  const items = resolveItems(pkg.itemOfferIds);
  const taxFree = items.length > 0 && items.every((o) => o.taxFree);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[13px] font-semibold tracking-wide text-accent">YOUR PACK</p>
        <h1 className="mt-1 font-display text-[28px] leading-tight">{pkg.label}</h1>
        <p className="mt-1 text-[14px] text-muted">{pkg.rationale}</p>
      </div>

      <Card className="space-y-3">
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
        <div className="flex items-center justify-between border-t border-line pt-3">
          <span className="text-[13px] text-muted">Total · paid by your employer</span>
          <span className="font-display text-[22px]">{lek(pkg.totalLek)}</span>
        </div>
      </Card>

      <div className="flex items-start gap-3 rounded-[18px] border border-primary/20 bg-primary-soft px-4 py-3.5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.8} />
        <p className="text-[13px] leading-snug text-primary-ink">
          {taxFree ? "All items are tax-free under welfare rules." : "Mixed tax treatment — HR sees the full breakdown."} The money never passes through your hands.
        </p>
      </div>

      {pkg.status === "DRAFT" && (
        <form action={submitPackage.bind(null, pkg.id)}>
          <Btn full type="submit" variant="primary" className="py-4 text-base">Send to HR for approval</Btn>
        </form>
      )}

      {pkg.status === "PENDING" && (
        <Card className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent" />
          <p className="text-[14px]">Sent to HR — awaiting approval.</p>
        </Card>
      )}

      {pkg.status === "APPROVED" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-[18px] border border-primary/30 bg-primary-soft px-4 py-3.5">
            <CheckCircle2 className="h-6 w-6 text-primary" strokeWidth={1.8} />
            <p className="text-[14px] text-primary-ink">Approved — your vouchers are ready.</p>
          </div>
          <Btn full href="/app/wallet" variant="dark">See my vouchers</Btn>
        </div>
      )}
    </div>
  );
}
