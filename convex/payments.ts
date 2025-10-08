'use node';

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

const paymentTypeValidator = v.union(
  v.literal("earnest_deposit"),
  v.literal("consultation_fee"),
  v.literal("retainer"),
  v.literal("document_fee"),
  v.literal("marketing_fee"),
  v.literal("other")
);

const paymentStatusValidator = v.union(
  v.literal("pending"),
  v.literal("processing"),
  v.literal("succeeded"),
  v.literal("failed"),
  v.literal("refunded"),
  v.literal("canceled")
);

function centsFromDollars(amount: number): number {
  return Math.round(amount * 100);
}

export const createPaymentIntent = action({
  args: {
    agentId: v.id("agents"),
    customerName: v.string(),
    customerEmail: v.string(),
    amount: v.number(),
    currency: v.optional(v.string()),
    description: v.string(),
    type: paymentTypeValidator,
    metadata: v.optional(
      v.object({
        listingId: v.optional(v.id("listings")),
        buyerSessionId: v.optional(v.id("buyerSessions")),
        sellerSessionId: v.optional(v.id("sellerSessions")),
        notes: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    if (args.amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    const { getStripeClient } = await import("../lib/stripe/client");
    const stripe = getStripeClient();

    const amountInCents = centsFromDollars(args.amount);
    const currency = (args.currency ?? "usd").toLowerCase();

    const customer = await stripe.customers.create({
      email: args.customerEmail,
      name: args.customerName,
      metadata: {
        agentId: args.agentId,
      },
    });

    const metadata: Record<string, string> = {
      agentId: args.agentId,
      type: args.type,
    };

    if (args.metadata?.listingId) {
      metadata.listingId = args.metadata.listingId;
    }
    if (args.metadata?.buyerSessionId) {
      metadata.buyerSessionId = args.metadata.buyerSessionId;
    }
    if (args.metadata?.sellerSessionId) {
      metadata.sellerSessionId = args.metadata.sellerSessionId;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      customer: customer.id,
      description: args.description,
      receipt_email: args.customerEmail,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
    });

    await ctx.runMutation(api.paymentsDb.createPaymentRecord, {
      agentId: args.agentId,
      customerId: customer.id,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      amount: amountInCents,
      currency,
      description: args.description,
      type: args.type,
      stripePaymentIntentId: paymentIntent.id,
      status: "pending",
      listingId: args.metadata?.listingId,
      buyerSessionId: args.metadata?.buyerSessionId,
      sellerSessionId: args.metadata?.sellerSessionId,
      notes: args.metadata?.notes,
    });

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
    };
  },
});

// Mutations and queries moved to paymentsDb.ts to avoid Node.js module restrictions
