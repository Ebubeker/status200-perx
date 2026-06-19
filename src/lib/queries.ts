import { prisma } from "./prisma";
import { requireMember, DEMO_PROVIDER_ID } from "./auth";
import { offerById } from "./catalog";
import type { Offer } from "./types";

export function resolveItems(ids: string[]): Offer[] {
  return ids.map(offerById).filter((o): o is Offer => !!o);
}

export async function employeeHome() {
  const member = await requireMember();
  const latest = await prisma.perkPackage.findFirst({
    where: { membershipId: member.id },
    orderBy: { createdAt: "desc" },
  });
  return { member, latest };
}

export async function discoverData() {
  const member = await requireMember();
  const latestPulse = await prisma.pulse.findFirst({
    where: { membershipId: member.id },
    orderBy: { createdAt: "desc" },
    include: { recommendations: { orderBy: { createdAt: "asc" } } },
  });
  return { member, recs: latestPulse?.recommendations ?? [] };
}

export async function packageById(id: string) {
  const member = await requireMember();
  const pkg = await prisma.perkPackage.findFirst({
    where: { id, companyId: member.companyId },
  });
  return { member, pkg };
}

export async function walletData() {
  const member = await requireMember();
  const vouchers = await prisma.voucher.findMany({
    where: { membershipId: member.id },
    orderBy: { createdAt: "desc" },
  });
  return { member, vouchers };
}

export async function employerDashboard() {
  const member = await requireMember();
  const [pending, approved, vouchers] = await Promise.all([
    prisma.perkPackage.findMany({
      where: { companyId: member.companyId, status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { membership: true },
    }),
    prisma.perkPackage.findMany({ where: { companyId: member.companyId, status: "APPROVED" } }),
    prisma.voucher.findMany({ where: { companyId: member.companyId } }),
  ]);
  const spent = approved.reduce((s, p) => s + p.totalLek, 0);
  const redeemed = vouchers.filter((v) => v.status === "REDEEMED").length;
  return {
    member,
    pending,
    approvedCount: approved.length,
    spent,
    issued: vouchers.length,
    redeemed,
  };
}

export async function providerInbox() {
  await requireMember();
  const [provider, vouchers] = await Promise.all([
    prisma.provider.findUnique({ where: { id: DEMO_PROVIDER_ID } }),
    prisma.voucher.findMany({
      where: { providerId: DEMO_PROVIDER_ID },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { provider, vouchers };
}
