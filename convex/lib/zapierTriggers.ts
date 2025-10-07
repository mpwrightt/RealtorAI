// Centralized Zapier webhook triggers
// Call these functions when events happen to notify Zapier

import { ActionCtx } from "../_generated/server";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";

// Helper to trigger webhook (call from mutations via scheduler)
export async function triggerZapier(
  ctx: ActionCtx,
  agentId: Id<"agents">,
  event: string,
  data: any
) {
  try {
    await ctx.runAction(api.zapier.triggerZapierWebhook, {
      agentId,
      event,
      data,
    });
  } catch (error) {
    // Don't fail the main operation if Zapier fails
    console.error('[Zapier] Failed to trigger:', error);
  }
}

// Event-specific trigger functions (call these from your mutations)

export async function triggerLeadCreated(ctx: any, agentId: Id<"agents">, lead: any) {
  ctx.scheduler.runAfter(0, api.zapier.triggerZapierWebhook, {
    agentId,
    event: 'lead.created',
    data: {
      leadId: lead._id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      type: lead.type,
      status: lead.status,
      source: lead.source,
      createdAt: lead.createdAt,
    },
  });
}

export async function triggerBuyerSessionCreated(ctx: any, agentId: Id<"agents">, session: any) {
  ctx.scheduler.runAfter(0, api.zapier.triggerZapierWebhook, {
    agentId,
    event: 'buyer_session.created',
    data: {
      sessionId: session._id,
      buyerName: session.buyerName,
      buyerEmail: session.buyerEmail,
      buyerPhone: session.buyerPhone,
      sessionCode: session.sessionCode,
      preferences: session.preferences,
      createdAt: session.createdAt,
    },
  });
}

export async function triggerSellerSessionCreated(ctx: any, agentId: Id<"agents">, session: any) {
  ctx.scheduler.runAfter(0, api.zapier.triggerZapierWebhook, {
    agentId,
    event: 'seller_session.created',
    data: {
      sessionId: session._id,
      sellerName: session.sellerName,
      sellerEmail: session.sellerEmail,
      sellerPhone: session.sellerPhone,
      sessionCode: session.sessionCode,
      listingId: session.listingId,
      createdAt: session.createdAt,
    },
  });
}

export async function triggerTourRequested(ctx: any, agentId: Id<"agents">, tour: any, listing: any) {
  ctx.scheduler.runAfter(0, api.zapier.triggerZapierWebhook, {
    agentId,
    event: 'tour.requested',
    data: {
      tourId: tour._id,
      listingId: tour.listingId,
      propertyAddress: listing?.address,
      requestedDate: tour.requestedDate,
      timeSlot: tour.timeSlot,
      status: tour.status,
      createdAt: tour.createdAt,
    },
  });
}

export async function triggerOfferCreated(ctx: any, agentId: Id<"agents">, offer: any, listing: any) {
  ctx.scheduler.runAfter(0, api.zapier.triggerZapierWebhook, {
    agentId,
    event: 'offer.created',
    data: {
      offerId: offer._id,
      listingId: offer.listingId,
      propertyAddress: listing?.address,
      offerAmount: offer.offerAmount,
      earnestMoney: offer.earnestMoney,
      financingType: offer.financingType,
      status: offer.status,
      createdAt: offer.createdAt,
    },
  });
}

export async function triggerListingCreated(ctx: any, agentId: Id<"agents">, listing: any) {
  ctx.scheduler.runAfter(0, api.zapier.triggerZapierWebhook, {
    agentId,
    event: 'listing.created',
    data: {
      listingId: listing._id,
      address: listing.address,
      city: listing.city,
      state: listing.state,
      price: listing.price,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      sqft: listing.sqft,
      propertyType: listing.propertyType,
      status: listing.status,
      createdAt: listing.createdAt,
    },
  });
}

export async function triggerMessageReceived(ctx: any, agentId: Id<"agents">, message: any) {
  ctx.scheduler.runAfter(0, api.zapier.triggerZapierWebhook, {
    agentId,
    event: 'message.received',
    data: {
      messageId: message._id,
      clientType: message.clientType,
      clientName: message.clientName,
      type: message.type,
      direction: message.direction,
      subject: message.subject,
      body: message.body,
      createdAt: message.createdAt,
    },
  });
}
