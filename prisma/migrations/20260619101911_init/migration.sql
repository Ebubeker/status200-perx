-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'HR', 'FINANCE', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "OfferCategory" AS ENUM ('wellness', 'fitness', 'food', 'health', 'travel', 'learning', 'culture', 'telecom');

-- CreateEnum
CREATE TYPE "PackageStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VoucherStatus" AS ENUM ('READY', 'REDEEMED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('NONE', 'ACTIVE', 'PAST_DUE', 'CANCELLED');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "clerkOrgId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "perksBudgetLek" INTEGER NOT NULL DEFAULT 12000,
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'NONE',
    "lemonOrderId" TEXT,
    "lemonSubscriptionId" TEXT,
    "lemonVariantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "displayName" TEXT NOT NULL,
    "department" TEXT NOT NULL DEFAULT 'Team',
    "perksBudgetLek" INTEGER NOT NULL DEFAULT 12000,
    "recognitionCoins" INTEGER NOT NULL DEFAULT 3200,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "area" TEXT NOT NULL DEFAULT 'Tiranë',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "OfferCategory" NOT NULL,
    "priceLek" INTEGER NOT NULL,
    "area" TEXT NOT NULL,
    "taxFree" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pulse" (
    "id" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pulse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "pulseId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "itemOfferIds" TEXT[],
    "totalLek" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerkPackage" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "itemOfferIds" TEXT[],
    "totalLek" INTEGER NOT NULL,
    "status" "PackageStatus" NOT NULL DEFAULT 'DRAFT',
    "decidedByClerkUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "PerkPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "VoucherStatus" NOT NULL DEFAULT 'READY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redeemedAt" TIMESTAMP(3),

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LemonWebhookEvent" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LemonWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_clerkOrgId_key" ON "Company"("clerkOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Membership_companyId_idx" ON "Membership"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_clerkUserId_companyId_key" ON "Membership"("clerkUserId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_slug_key" ON "Provider"("slug");

-- CreateIndex
CREATE INDEX "Offer_providerId_idx" ON "Offer"("providerId");

-- CreateIndex
CREATE INDEX "Pulse_membershipId_idx" ON "Pulse"("membershipId");

-- CreateIndex
CREATE INDEX "Recommendation_membershipId_idx" ON "Recommendation"("membershipId");

-- CreateIndex
CREATE INDEX "PerkPackage_companyId_idx" ON "PerkPackage"("companyId");

-- CreateIndex
CREATE INDEX "PerkPackage_membershipId_idx" ON "PerkPackage"("membershipId");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_code_key" ON "Voucher"("code");

-- CreateIndex
CREATE INDEX "Voucher_companyId_idx" ON "Voucher"("companyId");

-- CreateIndex
CREATE INDEX "Voucher_providerId_idx" ON "Voucher"("providerId");

-- CreateIndex
CREATE INDEX "Voucher_membershipId_idx" ON "Voucher"("membershipId");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pulse" ADD CONSTRAINT "Pulse_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_pulseId_fkey" FOREIGN KEY ("pulseId") REFERENCES "Pulse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerkPackage" ADD CONSTRAINT "PerkPackage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerkPackage" ADD CONSTRAINT "PerkPackage_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "PerkPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
