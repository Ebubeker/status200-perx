import { PulseForm } from "@/components/PulseForm";

export default function PulsePage() {
  return (
    <div>
      <p className="text-[13px] font-semibold tracking-wide text-accent">WEEKLY PULSE</p>
      <h1 className="mt-1 font-display text-[28px] leading-tight">How are you, really?</h1>
      <p className="mt-2 text-[14px] text-muted">
        A few taps and Perx builds a perk pack for your week. No typing, no thinking.
      </p>
      <div className="mt-7">
        <PulseForm />
      </div>
    </div>
  );
}
