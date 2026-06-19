import type { StoredPackage, Voucher } from "./types";

// In-memory demo store (survives HMR via globalThis). Swap for Postgres/Prisma at deploy.
interface DB {
  budget: number;
  coins: number;
  recommendations: { id: string; label: string; rationale: string; itemIds: string[]; totalLek: number }[];
  packages: StoredPackage[];
  vouchers: Voucher[];
}

const g = globalThis as unknown as { __perxdb?: DB };
export const db: DB =
  g.__perxdb ??
  (g.__perxdb = {
    budget: 12000,
    coins: 3200,
    recommendations: [],
    packages: [],
    vouchers: [],
  });

let counter = 0;
export function uid(prefix = "id"): string {
  counter += 1;
  return `${prefix}_${counter}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}
