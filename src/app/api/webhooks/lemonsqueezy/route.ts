import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import { Prisma, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function verify(raw: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const digest = crypto.createHmac("sha256", secret).update(raw, "utf8").digest("hex");
  const a = Buffer.from(digest, "hex");
  const b = Buffer.from(signature, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

interface LemonPayload {
  meta?: { event_name?: string; custom_data?: Record<string, string> };
  data?: { id?: string | number };
}

const ACTIVATING = new Set([
  "order_created",
  "subscription_created",
  "subscription_updated",
  "subscription_resumed",
  "subscription_payment_success",
]);
const CANCELLING = new Set(["subscription_cancelled", "subscription_expired"]);
const PAST_DUE = new Set(["subscription_paused", "subscription_payment_failed"]);

export async function POST(req: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "";
  const raw = await req.text();
  const signature = req.headers.get("x-signature");

  if (!secret || !verify(raw, signature, secret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let body: LemonPayload;
  try {
    body = JSON.parse(raw) as LemonPayload;
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const eventName = body.meta?.event_name ?? "unknown";
  const companyId = body.meta?.custom_data?.company_id;
  const resourceId = body.data?.id != null ? String(body.data.id) : undefined;

  let companyData: Prisma.CompanyUpdateInput | null = null;
  if (companyId) {
    if (ACTIVATING.has(eventName)) {
      companyData = {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        lemonVariantId: process.env.LEMONSQUEEZY_VARIANT_ID,
        ...(eventName.startsWith("subscription")
          ? { lemonSubscriptionId: resourceId }
          : { lemonOrderId: resourceId }),
      };
    } else if (CANCELLING.has(eventName)) {
      companyData = { subscriptionStatus: SubscriptionStatus.CANCELLED };
    } else if (PAST_DUE.has(eventName)) {
      companyData = { subscriptionStatus: SubscriptionStatus.PAST_DUE };
    }
  }

  // Record the delivery (idempotency) AND apply the effect in one transaction.
  // A transient failure rolls back the idempotency row so Lemon's retry reprocesses.
  try {
    await prisma.$transaction(async (tx) => {
      await tx.lemonWebhookEvent.create({
        data: { id: signature as string, eventName, payload: body as unknown as Prisma.InputJsonValue },
      });
      if (companyId && companyData) {
        try {
          await tx.company.update({ where: { id: companyId }, data: companyData });
        } catch (e) {
          // Unknown/removed company — nothing to do; ack so Lemon stops retrying.
          if (!(e instanceof Prisma.PrismaClientKnownRequestError) || e.code !== "P2025") throw e;
        }
      }
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return new Response("Already processed", { status: 200 }); // duplicate delivery
    }
    console.error("[lemon webhook] processing failed:", e);
    return new Response("Processing error", { status: 500 }); // transient — Lemon will retry
  }

  return new Response("ok", { status: 200 });
}
