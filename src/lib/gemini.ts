import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { catalog, offerById } from "./catalog";
import type { Offer } from "./types";

let _ai: GoogleGenAI | null = null;
function ai(): GoogleGenAI {
  if (!_ai) _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  return _ai;
}

const Schema = z.object({
  packages: z.array(
    z.object({
      label: z.string(),
      rationale: z.string(),
      offerIds: z.array(z.string()),
    }),
  ),
});

export interface RecPackage {
  label: string;
  rationale: string;
  items: Offer[];
  totalLek: number;
  taxFreeAll: boolean;
}

export async function recommendPackages(
  pulse: Record<string, string>,
  budgetLek: number,
): Promise<RecPackage[]> {
  const menu = catalog
    .map((o) => `${o.id} | ${o.title} | ${o.category} | ${o.priceLek} Lek | ${o.area}${o.taxFree ? " | tax-free" : ""}`)
    .join("\n");

  const prompt =
    `You are a benefits concierge for employees in Tirana, Albania. From ONLY the catalog below, build 2-3 themed perk PACKAGES. ` +
    `Each package combines 2-4 offers (prefer different providers), with a combined total AT OR UNDER the remaining budget of ${budgetLek} Lek. ` +
    `Match the employee's weekly check-in. Give each a short human label (no emojis) and a one-sentence rationale.\n\n` +
    `Employee weekly check-in: ${JSON.stringify(pulse)}\n\nCATALOG (use the exact id):\n${menu}\n\n` +
    `Return ONLY JSON in this shape: {"packages":[{"label":"...","rationale":"...","offerIds":["id1","id2"]}]}`;

  try {
    const resp = await ai().models.generateContent({
      model: process.env.MODEL_PERSONA || "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 900,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    const parsed = Schema.parse(JSON.parse((resp as { text?: string }).text || "{}"));
    const out = parsed.packages
      .map((p) => build(p.label, p.rationale, p.offerIds, budgetLek))
      .filter((p): p is RecPackage => !!p);
    if (out.length) return out.slice(0, 3);
  } catch (e) {
    console.error("[gemini] falling back:", (e as Error)?.message || e);
  }
  return fallback(pulse, budgetLek);
}

function build(label: string, rationale: string, ids: string[], budget: number): RecPackage | null {
  const items = ids.map(offerById).filter((o): o is Offer => !!o);
  if (!items.length) return null;
  let total = items.reduce((s, o) => s + o.priceLek, 0);
  while (total > budget && items.length > 1) {
    items.pop();
    total = items.reduce((s, o) => s + o.priceLek, 0);
  }
  if (total > budget) return null;
  return { label, rationale, items, totalLek: total, taxFreeAll: items.every((o) => o.taxFree) };
}

function fallback(pulse: Record<string, string>, budget: number): RecPackage[] {
  const wants = Object.values(pulse).join(" ").toLowerCase();
  const score = (o: Offer) => (wants.includes(o.category) ? 2 : 0) + (o.taxFree ? 0.2 : 0);
  const sorted = [...catalog].sort((a, b) => score(b) - score(a));
  const pick = (skip: string[]): RecPackage => {
    const items: Offer[] = [];
    let total = 0;
    for (const o of sorted) {
      if (skip.includes(o.id)) continue;
      if (items.find((i) => i.providerId === o.providerId)) continue;
      if (total + o.priceLek <= budget) {
        items.push(o);
        total += o.priceLek;
      }
      if (items.length >= 3) break;
    }
    return { label: "Your reset pack", rationale: "Picked to match your week and your budget.", items, totalLek: total, taxFreeAll: items.every((o) => o.taxFree) };
  };
  const first = pick([]);
  const second = pick(first.items.map((i) => i.id));
  return [first, second].filter((p) => p.items.length);
}
