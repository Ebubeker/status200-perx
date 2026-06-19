import { PrismaClient } from "@prisma/client";

// Reuse a single client across HMR reloads / serverless invocations.
const g = globalThis as unknown as { __perxPrisma?: PrismaClient };

export const prisma =
  g.__perxPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") g.__perxPrisma = prisma;
