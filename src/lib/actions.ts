"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { requireMember, canApprove, DEMO_PROVIDER_ID } from "./auth";
import { recommendPackages } from "./gemini";
import { createCheckoutUrl } from "./lemonsqueezy";
import { offerById } from "./catalog";

export async function startSubscriptionCheckout(): Promise<void> {
  const member = await requireMember();
  const url = await createCheckoutUrl({ companyId: member.companyId });
  redirect(url);
}

// Thrown inside the approval transaction to force a clean rollback on an
// expected condition (race lost or insufficient funds) without a 500.
class ApprovalAbort extends Error {}

function voucherCode(): string {
  // Collision-resistant: 8 chars from a 31-symbol alphabet via CSPRNG (~10^11 space).
  const s = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(8);
  let c = "";
  for (let i = 0; i < 8; i++) c += s[bytes[i] % s.length];
  return `PX-${c}`;
}

export async function runPulse(answers: Record<string, string>): Promise<void> {
  const member = await requireMember();
  const recs = await recommendPackages(answers, member.perksBudgetLek);

  const pulse = await prisma.pulse.create({
    data: { membershipId: member.id, answers },
  });

  if (recs.length) {
    await prisma.recommendation.createMany({
      data: recs.map((r) => ({
        pulseId: pulse.id,
        membershipId: member.id,
        label: r.label,
        rationale: r.rationale,
        itemOfferIds: r.items.map((i) => i.id),
        totalLek: r.totalLek,
      })),
    });
  }

  revalidatePath("/app/discover");
  revalidatePath("/app");
}

export async function choosePackage(recId: string): Promise<string | null> {
  const member = await requireMember();
  const rec = await prisma.recommendation.findFirst({
    where: { id: recId, membershipId: member.id },
  });
  if (!rec) return null;

  const pkg = await prisma.perkPackage.create({
    data: {
      companyId: member.companyId,
      membershipId: member.id,
      label: rec.label,
      rationale: rec.rationale,
      itemOfferIds: rec.itemOfferIds,
      totalLek: rec.totalLek,
      status: "DRAFT",
    },
  });
  return pkg.id;
}

export async function submitPackage(id: string): Promise<void> {
  const member = await requireMember();
  await prisma.perkPackage.updateMany({
    where: { id, membershipId: member.id, status: "DRAFT" },
    data: { status: "PENDING" },
  });
  revalidatePath("/employer");
  revalidatePath(`/app/package/${id}`);
}

export async function approvePackage(id: string): Promise<void> {
  const member = await requireMember();
  if (!canApprove(member.role)) return;

  // Only ever touch packages inside the approver's own company.
  const pkg = await prisma.perkPackage.findFirst({
    where: { id, companyId: member.companyId, status: "PENDING" },
  });
  if (!pkg) return;

  try {
    await prisma.$transaction(async (tx) => {
      // Claim the package atomically — only one approver can flip PENDING -> APPROVED.
      const claimed = await tx.perkPackage.updateMany({
        where: { id: pkg.id, status: "PENDING" },
        data: { status: "APPROVED", decidedByClerkUserId: member.clerkUserId, decidedAt: new Date() },
      });
      if (claimed.count === 0) throw new ApprovalAbort("already-decided");

      // Debit the budget atomically, ONLY if sufficient funds remain. This single
      // conditional decrement closes the lost-update race AND enforces no-overspend.
      const debited = await tx.membership.updateMany({
        where: { id: pkg.membershipId, perksBudgetLek: { gte: pkg.totalLek } },
        data: { perksBudgetLek: { decrement: pkg.totalLek } },
      });
      if (debited.count === 0) throw new ApprovalAbort("insufficient-budget");

      for (const offerId of pkg.itemOfferIds) {
        const offer = offerById(offerId);
        if (!offer) continue;
        await tx.voucher.create({
          data: {
            companyId: pkg.companyId,
            membershipId: pkg.membershipId,
            packageId: pkg.id,
            offerId: offer.id,
            providerId: offer.providerId,
            code: voucherCode(),
            status: "READY",
          },
        });
      }
    });
  } catch (e) {
    // Expected aborts (race lost / insufficient funds) roll the whole transaction
    // back — package stays PENDING, nothing is debited or issued. Re-throw anything else.
    if (!(e instanceof ApprovalAbort)) throw e;
  }

  revalidatePath("/employer");
  revalidatePath("/provider");
  revalidatePath("/app/wallet");
  revalidatePath("/app");
}

export async function redeemVoucher(id: string): Promise<void> {
  // Demo provider console — redeem a voucher addressed to this provider only.
  await requireMember();
  await prisma.voucher.updateMany({
    where: { id, providerId: DEMO_PROVIDER_ID, status: "READY" },
    data: { status: "REDEEMED", redeemedAt: new Date() },
  });
  revalidatePath("/provider");
  revalidatePath("/app/wallet");
}
