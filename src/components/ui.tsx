"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  Sparkles, Dumbbell, Salad, HeartPulse, Plane, GraduationCap, Landmark, Smartphone, type LucideIcon,
} from "lucide-react";
import type { Category } from "@/lib/types";

export function cn(...a: (string | false | null | undefined)[]) {
  return a.filter(Boolean).join(" ");
}

type BtnVariant = "primary" | "dark" | "outline" | "ghost" | "accent";

export function Btn({
  children, variant = "primary", href, type = "button", className, disabled, full, onClick,
}: {
  children: ReactNode; variant?: BtnVariant; href?: string;
  type?: "button" | "submit"; className?: string; disabled?: boolean; full?: boolean;
  onClick?: () => void;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[15px] font-semibold transition active:scale-[0.98] disabled:opacity-50";
  const styles: Record<BtnVariant, string> = {
    primary: "bg-primary text-white hover:bg-primary-ink",
    dark: "bg-ink text-paper hover:opacity-90",
    outline: "border border-ink/25 text-ink hover:bg-ink/5",
    ghost: "text-ink hover:bg-ink/5",
    accent: "bg-accent text-white hover:opacity-90",
  };
  const cls = cn(base, styles[variant], full && "w-full", className);
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type={type} disabled={disabled} onClick={onClick} className={cls}>{children}</button>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-[18px] border border-line bg-card p-5 shadow-[0_2px_10px_-8px_rgba(26,25,22,0.25)]", className)}>
      {children}
    </div>
  );
}

export function Pill({ children, tone = "line" }: { children: ReactNode; tone?: "line" | "primary" | "accent" | "ink" }) {
  const tones = {
    line: "border border-line text-muted",
    primary: "bg-primary-soft text-primary-ink",
    accent: "bg-accent-soft text-accent",
    ink: "bg-ink text-paper",
  } as const;
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold", tones[tone])}>{children}</span>;
}

const ICONS: Record<Category, LucideIcon> = {
  wellness: Sparkles, fitness: Dumbbell, food: Salad, health: HeartPulse,
  travel: Plane, learning: GraduationCap, culture: Landmark, telecom: Smartphone,
};

export function CategoryIcon({ category, className }: { category: Category; className?: string }) {
  const I = ICONS[category] ?? Sparkles;
  return <I className={className} strokeWidth={1.6} />;
}
