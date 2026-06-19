import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import type { Company, Membership } from "@prisma/client";

const DEMO_COMPANY_SLUG = "kodra-studio";
// The provider whose redemption console the demo exposes.
export const DEMO_PROVIDER_ID = "p_nobis";

export type MemberCtx = Membership & { company: Company };

/**
 * Resolve the signed-in Clerk user to their company Membership.
 * On first sign-in we auto-provision a seat in the demo company so the
 * experience is instant. Returns null when there is no Clerk session.
 */
export async function getMember(): Promise<MemberCtx | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.membership.findFirst({
    where: { clerkUserId: userId },
    include: { company: true },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;

  const company = await prisma.company.findUnique({ where: { slug: DEMO_COMPANY_SLUG } });
  if (!company) throw new Error("Demo company not seeded — run `npm run db:seed`.");

  const user = await currentUser();
  const displayName =
    user?.firstName ||
    user?.username ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "Teammate";

  try {
    return await prisma.membership.create({
      data: {
        clerkUserId: userId,
        companyId: company.id,
        // Demo: every seat can drive the full flow (build + approve).
        role: "OWNER",
        displayName,
        department: "Engineering",
        perksBudgetLek: company.perksBudgetLek,
      },
      include: { company: true },
    });
  } catch {
    // Lost a create race — fetch the row the other request just wrote.
    const m = await prisma.membership.findFirst({
      where: { clerkUserId: userId },
      include: { company: true },
    });
    if (m) return m;
    throw new Error("Could not provision membership.");
  }
}

export async function requireMember(): Promise<MemberCtx> {
  const m = await getMember();
  if (!m) redirect("/sign-in");
  return m;
}

export function canApprove(role: Membership["role"]): boolean {
  return role === "OWNER" || role === "HR" || role === "FINANCE";
}
