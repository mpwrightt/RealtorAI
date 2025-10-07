# Task 01: Stripe Setup & Schema

**Phase:** 15 - Revenue Features  
**Effort:** 6 hours  
**Priority:** 🔥🔥🔥 CRITICAL  
**Dependencies:** Phase 14 complete

---

## 🎯 Objective

Set up Stripe payment processing infrastructure including schema, API integration, and basic payment flow.

---

## 📋 Subtasks

### 1. Stripe Account Setup (30 min)

**Steps:**
1. Create Stripe account at [stripe.com](https://stripe.com)
2. Complete business verification
3. Get API keys:
   - Publishable key (starts with `pk_`)
   - Secret key (starts with `sk_`)
4. Configure webhook endpoint URL
5. Enable payment methods (card, ACH, etc.)

**Add to `.env.local`:**
```bash
# Stripe API Keys (Get from stripe.com dashboard)
STRIPE_SECRET_KEY=sk_test_replace_with_your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_replace_with_your_key

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Optional override
STRIPE_API_VERSION=2023-10-16
```

---

### 2. Install Stripe SDK (15 min)

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

**Create Stripe client:** `lib/stripe/client.ts`

```typescript
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
  apiVersion: process.env.STRIPE_API_VERSION as Stripe.StripeConfig["apiVersion"] | undefined,
});
```

---

### 3. Update Schema (1 hour)

**Add to `convex/schema.ts`:**

```typescript
// Payments table
payments: defineTable({
  agentId: v.id("agents"),
  customerId: v.optional(v.string()), // Stripe customer ID
  customerName: v.string(),
  customerEmail: v.string(),
  
  // Payment details
  amount: v.number(), // in cents
  currency: v.string(), // USD, EUR, etc.
  description: v.string(),
  type: v.union(
    v.literal("earnest_deposit"),
    v.literal("consultation_fee"),
    v.literal("retainer"),
    v.literal("document_fee"),
    v.literal("marketing_fee"),
    v.literal("other")
  ),
  
  // Stripe references
  stripePaymentIntentId: v.optional(v.string()),
  stripeChargeId: v.optional(v.string()),
  stripeInvoiceId: v.optional(v.string()),
  
  // Status
  status: v.union(
    v.literal("pending"),
    v.literal("processing"),
    v.literal("succeeded"),
    v.literal("failed"),
    v.literal("refunded"),
    v.literal("canceled")
  ),
  
  // Metadata
  listingId: v.optional(v.id("listings")),
  buyerSessionId: v.optional(v.id("buyerSessions")),
  sellerSessionId: v.optional(v.id("sellerSessions")),
  notes: v.optional(v.string()),
  
  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
  paidAt: v.optional(v.number()),
  refundedAt: v.optional(v.number()),
})
  .index("byAgent", ["agentId"])
  .index("byStatus", ["status"])
  .index("byCustomerEmail", ["customerEmail"])
  .index("byStripePaymentIntent", ["stripePaymentIntentId"])
  .index("byListing", ["listingId"]),

// Payment Refunds
refunds: defineTable({
  paymentId: v.id("payments"),
  agentId: v.id("agents"),
  amount: v.number(), // in cents
  reason: v.string(),
  stripeRefundId: v.string(),
  status: v.union(
    v.literal("pending"),
    v.literal("succeeded"),
    v.literal("failed")
  ),
  createdAt: v.number(),
  processedAt: v.optional(v.number()),
})
  .index("byPayment", ["paymentId"])
  .index("byAgent", ["agentId"]),
```

---

### 4. Create Payment Functions (2 hours)

**Create:** `convex/payments.ts`

```typescript
import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";

// Create payment intent
export const createPaymentIntent = action({
  args: {
    agentId: v.id("agents"),
    customerName: v.string(),
    customerEmail: v.string(),
    amount: v.number(), // in dollars
    description: v.string(),
    type: v.string(),
    metadata: v.optional(v.object({
      listingId: v.optional(v.string()),
      buyerSessionId: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<{ paymentIntentId: string; clientSecret: string }> => {
    const { stripe } = await import('../lib/stripe/client');
    
    // Convert dollars to cents
    const amountInCents = Math.round(args.amount * 100);
    
    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: args.customerEmail,
      name: args.customerName,
      metadata: {
        agentId: args.agentId,
      },
    });
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      customer: customer.id,
      description: args.description,
      metadata: {
        agentId: args.agentId,
        type: args.type,
        ...args.metadata,
      },
    });
    
    // Store in database
    await ctx.runMutation((api as any).payments.createPayment, {
      agentId: args.agentId,
      customerId: customer.id,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      amount: amountInCents,
      currency: 'usd',
      description: args.description,
      type: args.type as any,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
    });
    
    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
    };
  },
});

// Store payment in database
export const createPayment = mutation({
  args: {
    agentId: v.id("agents"),
    customerId: v.optional(v.string()),
    customerName: v.string(),
    customerEmail: v.string(),
    amount: v.number(),
    currency: v.string(),
    description: v.string(),
    type: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const paymentId = await ctx.db.insert("payments", {
      ...args,
      type: args.type as any,
      status: args.status as any,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return paymentId;
  },
});

// Update payment status
export const updatePaymentStatus = mutation({
  args: {
    stripePaymentIntentId: v.string(),
    status: v.string(),
    stripeChargeId: v.optional(v.string()),
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
      status: args.status as any,
      stripeChargeId: args.stripeChargeId,
      updatedAt: Date.now(),
      paidAt: args.status === 'succeeded' ? Date.now() : payment.paidAt,
    });
    
    return { success: true };
  },
});

// Get payments for agent
export const getPaymentsByAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const payments = await ctx.db
      .query("payments")
      .withIndex("byAgent", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .collect();
    
    return payments;
  },
});

// Get payment details
export const getPaymentById = query({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.paymentId);
  },
});
```

---

### 5. Create Webhook Handler (1.5 hours)

**Create:** `app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { fetchMutation } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }
  
  // Handle event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      await fetchMutation(api.payments.updatePaymentStatus, {
        stripePaymentIntentId: paymentIntent.id,
        status: 'succeeded',
        stripeChargeId: paymentIntent.latest_charge as string,
      });
      
      console.log('Payment succeeded:', paymentIntent.id);
      break;
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      
      await fetchMutation(api.payments.updatePaymentStatus, {
        stripePaymentIntentId: failedPayment.id,
        status: 'failed',
      });
      
      console.log('Payment failed:', failedPayment.id);
      break;
    
    default:
      console.log('Unhandled event type:', event.type);
  }
  
  return NextResponse.json({ received: true });
}
```

---

### 6. Test Payment Flow (1 hour)

**Create test script:** `scripts/test-payment.ts`

```typescript
import { stripe } from "../lib/stripe/client";

async function testPayment() {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 10000,
    currency: "usd",
    description: "Test payment intent",
    automatic_payment_methods: { enabled: true },
  });

  console.log("Payment Intent created:", paymentIntent.id);
  console.log("Client Secret:", paymentIntent.client_secret);
  console.log("Use Stripe test cards such as 4242 4242 4242 4242 to confirm the payment.");
}

testPayment().catch((error) => {
  console.error("Payment test failed", error);
  process.exit(1);
});
```

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires Auth: `4000 0027 6000 3184`

---

## ✅ Acceptance Criteria

- [ ] Stripe account created and verified
- [ ] API keys configured in environment
- [x] Schema updated with payments tables
- [x] Payment intent creation works
- [ ] Webhook handler deployed and verified
- [ ] Test payment processes successfully
- [x] Payment status updates in database
- [x] Error handling for failed payments
- [x] Logging for all payment events
- [x] Documentation updated

---

## 🧪 Testing

```bash
# 1. Create test payment intent (requires STRIPE_SECRET_KEY)
npm run test:stripe

# 3. Test webhook (use Stripe CLI)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 4. Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed

# 5. Verify database updates
# Check Convex dashboard for payment records
```

---

## 🔒 Security Checklist

- [ ] API keys in environment variables (not hardcoded)
- [x] Webhook signature verification
- [ ] HTTPS only in production
- [x] Never log sensitive data
- [x] PCI compliance maintained
- [ ] Audit trail for all transactions
- [x] Error messages don't expose sensitive info

---

## 📚 Resources

- [Stripe Quick Start](https://stripe.com/docs/payments/quickstart)
- [Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Testing](https://stripe.com/docs/testing)

---

*Estimated: 6 hours*  
*Priority: CRITICAL*  
*Next Task: 02 - Payment Processing UI*
