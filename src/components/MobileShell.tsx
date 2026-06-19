"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { UserButton } from "@clerk/nextjs";
import { Home, Sparkles, Wallet } from "lucide-react";
import { cn } from "./ui";

const TABS = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/pulse", label: "This week", icon: Sparkles },
  { href: "/app/wallet", label: "Wallet", icon: Wallet },
];

export function MobileShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  return (
    <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line/70 bg-paper/85 px-5 py-3.5 backdrop-blur">
        <Link href="/app" className="font-display text-[19px] font-semibold tracking-tight">
          Perx
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-[12px] font-semibold text-muted">Switch view</Link>
          <UserButton appearance={{ elements: { avatarBox: "h-7 w-7" } }} />
        </div>
      </header>

      <main className="flex-1 px-5 pb-28 pt-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-10">
        <div className="mx-auto max-w-[440px] border-t border-line bg-paper/95 px-6 pb-[max(14px,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur">
          <div className="flex items-center justify-between">
            {TABS.map((t) => {
              const active = t.href === "/app" ? path === "/app" : path.startsWith(t.href);
              const I = t.icon;
              return (
                <Link key={t.href} href={t.href} className={cn("flex flex-1 flex-col items-center gap-1 py-1", active ? "text-primary" : "text-muted")}>
                  <I className="h-[22px] w-[22px]" strokeWidth={active ? 2.2 : 1.7} />
                  <span className="text-[10.5px] font-semibold">{t.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
