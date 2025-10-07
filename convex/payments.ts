'use node';

import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
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

    await ctx.runMutation(api.payments.createPaymentRecord, {
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

export const createPaymentRecord = mutation({
  args: {
    agentId: v.id("agents"),
    customerId: v.optional(v.string()),
    customerName: v.string(),
    customerEmail: v.string(),
    amount: v.number(),
    currency: v.string(),
    description: v.string(),
    type: paymentTypeValidator,
    stripePaymentIntentId: v.optional(v.string()),
    stripeChargeId: v.optional(v.string()),
    stripeInvoiceId: v.optional(v.string()),
    status: paymentStatusValidator,
    listingId: v.optional(v.id("listings")),
    buyerSessionId: v.optional(v.id("buyerSessions")),
    sellerSessionId: v.optional(v.id("sellerSessions")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const paymentId = await ctx.db.insert("payments", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return paymentId;
  },
});

export const updatePaymentStatus = mutation({
  args: {
    stripePaymentIntentId: v.string(),
    status: paymentStatusValidator,
    stripeChargeId: v.optional(v.string()),
    stripeInvoiceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("byStripePaymentIntent", (q) =>
        q.eq("stripePaymentIntentId", args.stripePaymentIntentId)
      )
      .unique();

    if (!payment) {
      throw new Error("Payment not found");
    }

    await ctx.db.patch(payment._id, {
      status: args.status,
      stripeChargeId: args.stripeChargeId ?? payment.stripeChargeId,
      stripeInvoiceId: args.stripeInvoiceId ?? payment.stripeInvoiceId,
      updatedAt: Date.now(),
      paidAt: args.status === "succeeded" ? Date.now() : payment.paidAt,
      refundedAt: args.status === "refunded" ? Date.now() : payment.refundedAt,
    });

    return { success: true };
  },
});

export const getPaymentsByAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("byAgent", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .collect();
  },
});

export const getPaymentById = query({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.paymentId);
  },
});
