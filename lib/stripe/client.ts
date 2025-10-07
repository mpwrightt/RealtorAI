import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not defined");
    }

    stripeClient = new Stripe(secretKey, {
      typescript: true,
      apiVersion: process.env.STRIPE_API_VERSION as Stripe.StripeConfig["apiVersion"] | undefined,
    });
  }

  return stripeClient;
}
