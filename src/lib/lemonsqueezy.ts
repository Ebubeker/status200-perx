// Lemon Squeezy (TEST mode) — employer subscription to Perx.
// Stripe isn't available to Albanian businesses, so we use Lemon Squeezy as
// Merchant of Record. Provider settlement stays simulated.

const API = "https://api.lemonsqueezy.com/v1";

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

interface CheckoutResponse {
  data: { attributes: { url: string } };
}

export async function createCheckoutUrl(opts: { companyId: string; email?: string }): Promise<string> {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!storeId || !variantId || !apiKey) {
    throw new Error("Lemon Squeezy env not configured.");
  }

  const res = await fetch(`${API}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: opts.email || undefined,
            // Echoed back to us in the webhook meta.custom_data.
            custom: { company_id: opts.companyId },
          },
          product_options: {
            redirect_url: `${appUrl()}/billing/success`,
          },
        },
        relationships: {
          store: { data: { type: "stores", id: String(storeId) } },
          variant: { data: { type: "variants", id: String(variantId) } },
        },
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Lemon Squeezy checkout failed (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as CheckoutResponse;
  return json.data.attributes.url;
}
