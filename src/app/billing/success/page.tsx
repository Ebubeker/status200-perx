import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Btn } from "@/components/ui";

export default function BillingSuccess() {
  return (
    <div className="grain grid min-h-dvh place-items-center px-6">
      <div className="w-full max-w-[380px] text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary-soft">
          <CheckCircle2 className="h-9 w-9 text-primary" strokeWidth={1.6} />
        </span>
        <h1 className="mt-5 font-display text-[28px] leading-tight">You&apos;re all set</h1>
        <p className="mt-2 text-[14px] text-muted">
          Payment confirmed in Lemon Squeezy (test mode). Your team&apos;s Perx subscription is being activated — the webhook flips it live in a moment.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Btn href="/employer" variant="primary">Back to HR dashboard</Btn>
          <Btn href="/billing" variant="ghost">View billing</Btn>
        </div>
      </div>
    </div>
  );
}
