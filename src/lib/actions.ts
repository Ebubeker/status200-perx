"use server";

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

function voucherCode(): string {
  const s = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 6; i++) c += s[Math.floor(Math.random() * s.length)];
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

  await prisma.$transaction(async (tx) => {
    const updated = await tx.perkPackage.updateMany({
      where: { id: pkg.id, status: "PENDING" },
      data: { status: "APPROVED", decidedByClerkUserId: member.clerkUserId, decidedAt: new Date() },
    });
    if (updated.count === 0) return; // another approver won the race

    const funded = await tx.membership.findUnique({ where: { id: pkg.membershipId } });
    const newBudget = Math.max(0, (funded?.perksBudgetLek ?? 0) - pkg.totalLek);
    await tx.membership.update({
      where: { id: pkg.membershipId },
      data: { perksBudgetLek: newBudget },
    });

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
