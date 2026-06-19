"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { runPulse } from "@/lib/actions";
import { Btn, cn } from "./ui";

const QUESTIONS: { key: string; q: string; options: string[] }[] = [
  { key: "week", q: "How was your week?", options: ["Stressful", "Tiring", "Productive", "Social", "Flat"] },
  { key: "need", q: "What do you need most?", options: ["Relax", "Energy", "Health", "Focus", "Fun"] },
  { key: "where", q: "Where?", options: ["Near work", "Near home", "A getaway", "Online"] },
  { key: "kind", q: "What sounds good?", options: ["Wellness", "Food", "Fitness", "Travel", "Learning"] },
  { key: "vibe", q: "Pick a vibe", options: ["Quick fix", "Treat myself", "Healthy habit", "With friends"] },
];

export function PulseForm() {
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const router = useRouter();

  function toggle(key: string, val: string) {
    setPicks((p) => ({ ...p, [key]: p[key] === val ? "" : val }));
  }

  function submit() {
    start(async () => {
      await runPulse(picks);
      router.push("/app/discover");
    });
  }

  const answered = Object.values(picks).filter(Boolean).length;

  return (
    <div className="space-y-7">
      {QUESTIONS.map((qu, i) => (
        <div key={qu.key}>
          <div className="mb-2.5 flex items-baseline gap-2">
            <span className="font-display text-[13px] text-accent">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="font-display text-[18px]">{qu.q}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {qu.options.map((opt) => {
              const on = picks[qu.key] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggle(qu.key, opt)}
                  className={cn(
                    "rounded-full border px-4 py-2.5 text-[14px] font-medium transition active:scale-95",
                    on ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink-soft hover:border-ink/40",
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="pt-1">
        <Btn full variant="primary" type="button" className="py-4 text-base" disabled={pending} onClick={submit}>
          {pending ? "Building your week…" : `Build my week${answered ? ` · ${answered}/5` : ""}`}
        </Btn>
        <p className="mt-2 text-center text-[12px] text-muted">Takes 20 seconds. You can skip any of them.</p>
      </div>
    </div>
  );
}
