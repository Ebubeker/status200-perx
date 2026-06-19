import { PrismaClient } from "@prisma/client";
import { catalog } from "../src/lib/catalog";

const prisma = new PrismaClient();

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  // Providers, derived from the catalog.
  const providers = new Map<string, { id: string; name: string; area: string }>();
  for (const o of catalog) {
    if (!providers.has(o.providerId)) {
      providers.set(o.providerId, { id: o.providerId, name: o.providerName, area: o.area });
    }
  }
  for (const p of providers.values()) {
    await prisma.provider.upsert({
      where: { id: p.id },
      update: { name: p.name, area: p.area },
      create: { id: p.id, name: p.name, slug: slugify(p.name), area: p.area },
    });
  }

  // Offers.
  for (const o of catalog) {
    await prisma.offer.upsert({
      where: { id: o.id },
      update: {
        title: o.title,
        category: o.category,
        priceLek: o.priceLek,
        area: o.area,
        taxFree: o.taxFree,
        providerId: o.providerId,
        active: true,
      },
      create: {
        id: o.id,
        providerId: o.providerId,
        title: o.title,
        category: o.category,
        priceLek: o.priceLek,
        area: o.area,
        taxFree: o.taxFree,
      },
    });
  }

  // Demo tenant — an employer with an active Perx subscription.
  const company = await prisma.company.upsert({
    where: { slug: "kodra-studio" },
    update: { subscriptionStatus: "ACTIVE" },
    create: {
      name: "Kodra Studio",
      slug: "kodra-studio",
      perksBudgetLek: 12000,
      subscriptionStatus: "ACTIVE",
    },
  });

  console.log(`Seeded ${providers.size} providers, ${catalog.length} offers, company "${company.name}".`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
