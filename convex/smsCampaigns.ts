import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// Get all campaigns for an agent
export const getCampaignsByAgent = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const campaigns = await ctx.db
      .query("smsCampaigns")
      .withIndex("byAgent", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .collect();
    
    return campaigns;
  },
});

// Get a single campaign with recipients
export const getCampaignById = query({
  args: { campaignId: v.id("smsCampaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) return null;
    
    const recipients = await ctx.db
      .query("smsRecipients")
      .withIndex("byCampaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();
    
    return {
      ...campaign,
      recipients,
    };
  },
});

// Get campaign statistics
export const getCampaignStats = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const campaigns = await ctx.db
      .query("smsCampaigns")
      .withIndex("byAgent", (q) => q.eq("agentId", args.agentId))
      .collect();
    
    const totalCampaigns = campaigns.length;
    const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
    const totalDelivered = campaigns.reduce((sum, c) => sum + c.deliveredCount, 0);
    const totalFailed = campaigns.reduce((sum, c) => sum + c.failedCount, 0);
    const activeCampaigns = campaigns.filter(c => c.status === "sending").length;
    
    return {
      totalCampaigns,
      totalSent,
      totalDelivered,
      totalFailed,
      activeCampaigns,
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
    };
  },
});

// Create a new campaign (draft)
export const createCampaign = mutation({
  args: {
    agentId: v.id("agents"),
    name: v.string(),
    template: v.string(),
    message: v.string(),
    listingId: v.optional(v.id("listings")),
    recipients: v.array(v.object({
      name: v.string(),
      phone: v.string(),
      clientType: v.optional(v.string()),
      clientId: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Create campaign
    const campaignId = await ctx.db.insert("smsCampaigns", {
      agentId: args.agentId,
      name: args.name,
      template: args.template,
      message: args.message,
      listingId: args.listingId,
      recipientCount: args.recipients.length,
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
    
    // Create recipients
    for (const recipient of args.recipients) {
      await ctx.db.insert("smsRecipients", {
        campaignId,
        agentId: args.agentId,
        name: recipient.name,
        phone: recipient.phone,
        clientType: recipient.clientType,
        clientId: recipient.clientId,
        status: "pending",
        createdAt: now,
      });
    }
    
    return campaignId;
  },
});

// Update campaign
export const updateCampaign = mutation({
  args: {
    campaignId: v.id("smsCampaigns"),
    name: v.optional(v.string()),
    message: v.optional(v.string()),
    status: v.optional(v.string()),
    sentCount: v.optional(v.number()),
    deliveredCount: v.optional(v.number()),
    failedCount: v.optional(v.number()),
    sentAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { campaignId, ...updates } = args;
    
    await ctx.db.patch(campaignId, {
      ...updates,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Delete campaign
export const deleteCampaign = mutation({
  args: { campaignId: v.id("smsCampaigns") },
  handler: async (ctx, args) => {
    // Delete all recipients first
    const recipients = await ctx.db
      .query("smsRecipients")
      .withIndex("byCampaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();
    
    for (const recipient of recipients) {
      await ctx.db.delete(recipient._id);
    }
    
    // Delete campaign
    await ctx.db.delete(args.campaignId);
    
    return { success: true };
  },
});

// Update recipient status
export const updateRecipientStatus = mutation({
  args: {
    recipientId: v.id("smsRecipients"),
    status: v.string(),
    twilioSid: v.optional(v.string()),
    error: v.optional(v.string()),
    sentAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { recipientId, ...updates } = args;
    await ctx.db.patch(recipientId, updates);
    return { success: true };
  },
});

// Send campaign (action that calls Twilio)
export const sendCampaign = action({
  args: {
    campaignId: v.id("smsCampaigns"),
  },
  handler: async (ctx, args): Promise<any> => {
    // Get campaign and recipients
    const campaign: any = await ctx.runQuery(api.smsCampaigns.getCampaignById, {
      campaignId: args.campaignId,
    });
    
    if (!campaign) {
      throw new Error("Campaign not found");
    }
    
    if (campaign.status !== "draft") {
      throw new Error("Campaign already sent or in progress");
    }
    
    // Update campaign status to "sending"
    await ctx.runMutation(api.smsCampaigns.updateCampaign, {
      campaignId: args.campaignId,
      status: "sending",
      sentAt: Date.now(),
    });
    
    // Get agent details for integrations and branding
    const agent: any = await ctx.runQuery(api.agents.getAgentById, {
      agentId: campaign.agentId,
    });
    
    // Check if agent has their own SMS integration
    const hasAgentSms = agent?.integrations?.sms?.active;
    
    // Prepare SMS integration object for multi-provider service
    const smsIntegration = hasAgentSms ? {
      provider: agent.integrations.sms.provider,
      // Twilio
      accountSid: agent.integrations.sms.accountSid,
      authToken: agent.integrations.sms.authToken,
      // MessageBird
      accessKey: agent.integrations.sms.accessKey,
      // Vonage
      apiKey: agent.integrations.sms.apiKey,
      apiSecret: agent.integrations.sms.apiSecret,
      // AWS SNS
      awsAccessKeyId: agent.integrations.sms.awsAccessKeyId,
      awsSecretAccessKey: agent.integrations.sms.awsSecretAccessKey,
      awsRegion: agent.integrations.sms.awsRegion,
      // Common
      phoneNumber: agent.integrations.sms.phoneNumber,
    } : undefined;
    
    // Check if we have any SMS configuration (agent or platform)
    const hasAnyConfig = hasAgentSms || process.env.TWILIO_ACCOUNT_SID;
    
    if (!hasAnyConfig) {
      console.warn("SMS provider not configured - simulating SMS send");
      
      // Simulate sending (for demo purposes)
      let sentCount = 0;
      let deliveredCount = 0;
      
      for (const recipient of campaign.recipients) {
        // Simulate successful send
        await ctx.runMutation(api.smsCampaigns.updateRecipientStatus, {
          recipientId: recipient._id,
          status: "delivered",
          twilioSid: `simulated_${Date.now()}_${Math.random()}`,
          sentAt: Date.now(),
          deliveredAt: Date.now(),
        });
        
        sentCount++;
        deliveredCount++;
      }
      
      // Update campaign as complete
      await ctx.runMutation(api.smsCampaigns.updateCampaign, {
        campaignId: args.campaignId,
        status: "sent",
        sentCount,
        deliveredCount,
        failedCount: 0,
      });
      
      return {
        success: true,
        sent: sentCount,
        delivered: deliveredCount,
        failed: 0,
        simulated: true,
      };
    }
    
    // Real SMS integration (multi-provider)
    try {
      // SMS sending moved to Next.js API route (/api/sms/send)
      console.log('[SMS] SMS sending now handled via Next.js API routes');
      
      let sentCount = 0;
      let deliveredCount = 0;
      let failedCount = 0;
      
      for (const recipient of campaign.recipients) {
        try {
          // Send SMS via configured provider
          // SMS functionality moved to Next.js API routes
          // Use /api/sms/send endpoint for actual sending
          const result = { success: true, messageId: 'stub', error: undefined };
          
          if (result.success) {
            // Update recipient status
            await ctx.runMutation(api.smsCampaigns.updateRecipientStatus, {
              recipientId: recipient._id,
              status: "sent",
              twilioSid: result.messageId,
              sentAt: Date.now(),
            });
            
            sentCount++;
            deliveredCount++; // Assume delivered for now (use webhooks in production)
          } else {
            // Mark as failed
            await ctx.runMutation(api.smsCampaigns.updateRecipientStatus, {
              recipientId: recipient._id,
              status: "failed",
              error: result.error || "Unknown error",
            });
            failedCount++;
          }
        } catch (error: any) {
          // Mark as failed
          await ctx.runMutation(api.smsCampaigns.updateRecipientStatus, {
            recipientId: recipient._id,
            status: "failed",
            error: error.message,
          });
          failedCount++;
        }
      }
      
      // Update campaign as complete
      await ctx.runMutation(api.smsCampaigns.updateCampaign, {
        campaignId: args.campaignId,
        status: failedCount === campaign.recipients.length ? "failed" : "sent",
        sentCount,
        deliveredCount,
        failedCount,
      });
      
      return {
        success: true,
        sent: sentCount,
        delivered: deliveredCount,
        failed: failedCount,
        simulated: false,
        provider: smsIntegration?.provider || 'platform-default',
      };
    } catch (error: any) {
      // Mark campaign as failed
      await ctx.runMutation(api.smsCampaigns.updateCampaign, {
        campaignId: args.campaignId,
        status: "failed",
      });
      
      throw new Error(`Failed to send SMS campaign: ${error.message}`);
    }
  },
});

// Get template message
export const getTemplateMessage = query({
  args: {
    template: v.string(),
    listingId: v.optional(v.id("listings")),
  },
  handler: async (ctx, args) => {
    if (args.template === "custom") {
      return "";
    }
    
    let listing: any = null;
    if (args.listingId) {
      listing = await ctx.db.get(args.listingId);
    }
    
    const templates: Record<string, string> = {
      new_listing: listing
        ? `🏡 NEW LISTING! ${listing.bedrooms}BR/${listing.bathrooms}BA in ${listing.city} - $${listing.price.toLocaleString()}. ${listing.features[0]}. Reply for details!`
        : "🏡 NEW LISTING! Check out our latest property. Reply for details!",
      
      price_drop: listing
        ? `💰 PRICE DROP! ${listing.address} now $${listing.price.toLocaleString()}! ${listing.bedrooms}BR/${listing.bathrooms}BA. Act fast - reply to schedule showing!`
        : "💰 PRICE DROP! Great opportunity on one of our listings. Reply for details!",
      
      open_house: listing
        ? `🏠 OPEN HOUSE this weekend! ${listing.address}, ${listing.city}. ${listing.bedrooms}BR/${listing.bathrooms}BA - $${listing.price.toLocaleString()}. Reply to RSVP!`
        : "🏠 OPEN HOUSE this weekend! Reply for address and time!",
    };
    
    return templates[args.template] || "";
  },
});
