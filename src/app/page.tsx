import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, UserButton } from "@clerk/nextjs";

const ROLES = [
  { href: "/app", title: "Employee", desc: "Your weekly perks & wallet", who: "Your seat" },
  { href: "/employer", title: "Employer / HR", desc: "Approvals & the talent edge", who: "Kodra Studio" },
  { href: "/provider", title: "Provider", desc: "Offers, orders & redemptions", who: "Nobis Wellness" },
];

export default async function Landing() {
  const { userId } = await auth();

  return (
    <div className="grain min-h-dvh">
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-6 py-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-ink font-display text-[13px] font-bold text-paper">P</span>
            <span className="text-[12.5px] font-semibold tracking-[0.14em] text-muted">PERX · BY STATUS 200</span>
          </div>
          {userId ? (
            <UserButton appearance={{ elements: { avatarBox: "h-7 w-7" } }} />
          ) : (
            <SignInButton mode="modal">
              <button className="rounded-full border border-line bg-card px-4 py-1.5 text-[12.5px] font-semibold text-ink transition hover:border-ink/30">
                Sign in
              </button>
            </SignInButton>
          )}
        </div>

        <div className="mt-14">
          <h1 className="font-display text-[42px] leading-[1.04] tracking-tight">
            The perks people <span className="italic text-primary">actually</span> open.
          </h1>
          <p className="mt-4 max-w-[330px] text-[16px] leading-relaxed text-ink-soft">
            A weekly, AI-built benefits marketplace — funded by the company, paid straight to local providers.
            Built for Albania, ready for the world.
          </p>
        </div>

        <div className="mt-10 space-y-3">
          {ROLES.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group flex items-center justify-between rounded-[18px] border border-line bg-card px-5 py-4 transition hover:border-ink/30 active:scale-[0.99]"
            >
              <div>
                <p className="font-display text-[19px]">{r.title}</p>
                <p className="text-[13px] text-muted">{r.desc}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden text-[11px] font-semibold text-muted sm:block">{r.who}</span>
                <ArrowUpRight className="h-5 w-5 text-ink transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.8} />
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-auto pt-10 text-[12px] leading-relaxed text-muted">
          {!userId && "Sign in to explore the full flow. "}
          Payments are simulated; the company subscription runs on Lemon Squeezy (test mode).
        </p>
      </div>
    </div>
  );
}
