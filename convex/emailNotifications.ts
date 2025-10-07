import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// Send buyer session welcome email
export const sendBuyerWelcomeEmail = action({
  args: {
    buyerSessionId: v.id("buyerSessions"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get session details
      const session: any = await ctx.runQuery(api.buyerSessions.getBuyerSessionById, {
        sessionId: args.buyerSessionId,
      });
      
      if (!session || !session.buyerEmail) {
        return { success: false, error: "Session not found or no email" };
      }
      
      // Get agent details
      const agent: any = await ctx.runQuery(api.agents.getAgentById, {
        agentId: session.agentId,
      });
      
      if (!agent) {
        return { success: false, error: "Agent not found" };
      }
      
      // Check if email notifications are enabled
      if (session.notificationPreferences && !session.notificationPreferences.emailNotifications) {
        console.log('[Email] Email notifications disabled for buyer');
        return { success: true, error: "Notifications disabled" };
      }
      
      // Email sending moved to Next.js API route (/api/email/send)
      // This action is now a stub - actual sending happens client-side
      console.log('[Email] Email notifications now handled via Next.js API routes');
      
      const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/buyer/${session.sessionCode}`;
      
      // Use agent's branding settings or defaults
      const companyName = agent.brandingSettings?.companyName || agent.agencyName;
      const replyEmail = agent.brandingSettings?.replyEmail || agent.email;
      
      // Check if agent has custom email integration
      const emailIntegration = agent.integrations?.email?.active ? {
        provider: agent.integrations.email.provider as 'resend' | 'sendgrid' | 'mailgun',
        apiKey: agent.integrations.email.apiKey,
        fromEmail: agent.integrations.email.fromEmail,
      } : undefined;
      
      // Email functionality moved to Next.js API routes
      // Use /api/email/send endpoint for actual sending
      
      return { success: true };
    } catch (error: any) {
      console.error('[Email] Error sending buyer welcome:', error);
      return { success: false, error: error.message };
    }
  },
});

// Send seller session welcome email
export const sendSellerWelcomeEmail = action({
  args: {
    sellerSessionId: v.id("sellerSessions"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get session details
      const session: any = await ctx.runQuery(api.sellerSessions.getSellerSessionById, {
        sessionId: args.sellerSessionId,
      });
      
      if (!session || !session.sellerEmail) {
        return { success: false, error: "Session not found or no email" };
      }
      
      // Get agent and listing details
      const agent: any = await ctx.runQuery(api.agents.getAgentById, {
        agentId: session.agentId,
      });
      
      const listing: any = await ctx.runQuery(api.listings.getListingById, {
        listingId: session.listingId,
      });
      
      if (!agent || !listing) {
        return { success: false, error: "Agent or listing not found" };
      }
      
      // Check if email notifications are enabled
      if (session.notificationPreferences && !session.notificationPreferences.emailNotifications) {
        console.log('[Email] Email notifications disabled for seller');
        return { success: true, error: "Notifications disabled" };
      }
      
      // Email sending moved to Next.js API route (/api/email/send)
      console.log('[Email] Email notifications now handled via Next.js API routes');
      
      const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/seller/${session.sessionCode}`;
      
      // Use agent's branding settings or defaults
      const companyName = agent.brandingSettings?.companyName || agent.agencyName;
      const replyEmail = agent.brandingSettings?.replyEmail || agent.email;
      
      // Check if agent has custom email integration
      const emailIntegration = agent.integrations?.email?.active ? {
        provider: agent.integrations.email.provider as 'resend' | 'sendgrid' | 'mailgun',
        apiKey: agent.integrations.email.apiKey,
        fromEmail: agent.integrations.email.fromEmail,
      } : undefined;
      
      // Email functionality moved to Next.js API routes
      // Use /api/email/send endpoint for actual sending
      
      return { success: true };
    } catch (error: any) {
      console.error('[Email] Error sending seller welcome:', error);
      return { success: false, error: error.message };
    }
  },
});

// Send new offer notification to seller
export const sendNewOfferEmail = action({
  args: {
    offerId: v.id("offers"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get offer details
      const offer: any = await ctx.runQuery(api.offers.getOfferById, {
        offerId: args.offerId,
      });
      
      if (!offer) {
        return { success: false, error: "Offer not found" };
      }
      
      // Get listing and buyer session
      const listing: any = await ctx.runQuery(api.listings.getListingById, {
        listingId: offer.listingId,
      });
      
      const buyerSession: any = await ctx.runQuery(api.buyerSessions.getBuyerSessionById, {
        sessionId: offer.buyerSessionId,
      });
      
      if (!listing || !buyerSession) {
        return { success: false, error: "Listing or buyer session not found" };
      }
      
      // Get seller session for this listing
      const sellerSession: any = await ctx.runQuery(api.sellerSessions.getSellerSessionByListing, {
        listingId: offer.listingId,
      });
      
      if (!sellerSession) {
        return { success: false, error: "No seller session found" };
      }
      
      if (!sellerSession.sellerEmail) {
        return { success: false, error: "Seller email not found" };
      }
      
      // Check if email notifications are enabled
      if (sellerSession.notificationPreferences && !sellerSession.notificationPreferences.emailNotifications) {
        console.log('[Email] Email notifications disabled for seller');
        return { success: true, error: "Notifications disabled" };
      }
      
      // Get agent details
      const agent: any = await ctx.runQuery(api.agents.getAgentById, {
        agentId: sellerSession.agentId,
      });
      
      // Email sending moved to Next.js API route (/api/email/send)
      console.log('[Email] Email notifications now handled via Next.js API routes');
      
      const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/seller/${sellerSession.sessionCode}/offers`;
      
      // Use agent's branding settings or defaults
      const companyName = agent?.brandingSettings?.companyName || agent?.agencyName || "Your Agent";
      const replyEmail = agent?.brandingSettings?.replyEmail || agent?.email;
      
      // Check if agent has custom email integration
      const emailIntegration = agent?.integrations?.email?.active ? {
        provider: agent.integrations.email.provider as 'resend' | 'sendgrid' | 'mailgun',
        apiKey: agent.integrations.email.apiKey,
        fromEmail: agent.integrations.email.fromEmail,
      } : undefined;
      
      // Email functionality moved to Next.js API routes
      // Use /api/email/send endpoint for actual sending
      
      return { success: true };
    } catch (error: any) {
      console.error('[Email] Error sending offer notification:', error);
      return { success: false, error: error.message };
    }
  },
});

// Note: Tour and message email notifications can be added later
// by implementing getTourById and getMessageById queries in their respective files
// and uncommenting the functions below.

// export const sendTourRequestEmail = action({ ... });
// export const sendMessageNotificationEmail = action({ ... });
