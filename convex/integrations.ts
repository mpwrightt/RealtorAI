import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get agent's integrations
export const getIntegrations = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) return null;
    
    // Return integrations with sensitive data masked
    const integrations = agent.integrations;
    if (!integrations) return null;
    
    return {
      email: integrations.email ? {
        provider: integrations.email.provider,
        fromEmail: integrations.email.fromEmail,
        verified: integrations.email.verified,
        active: integrations.email.active,
        // Mask API key
        apiKey: integrations.email.apiKey ? "•".repeat(32) : undefined,
      } : null,
      sms: integrations.sms ? {
        provider: integrations.sms.provider,
        phoneNumber: integrations.sms.phoneNumber,
        verified: integrations.sms.verified,
        active: integrations.sms.active,
        // Mask credentials
        accountSid: integrations.sms.accountSid ? "•".repeat(34) : undefined,
        authToken: integrations.sms.authToken ? "•".repeat(32) : undefined,
      } : null,
    };
  },
});

// Connect email provider
export const connectEmailProvider = mutation({
  args: {
    agentId: v.id("agents"),
    provider: v.union(v.literal("resend"), v.literal("sendgrid"), v.literal("mailgun")),
    apiKey: v.string(),
    fromEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    // TODO: In production, encrypt apiKey before storing
    // For now, storing as-is (should use encryption service)
    
    const updatedIntegrations = {
      ...agent.integrations,
      email: {
        provider: args.provider,
        apiKey: args.apiKey,
        fromEmail: args.fromEmail,
        verified: false, // Will be verified by test send
        active: true,
      },
    };
    
    await ctx.db.patch(args.agentId, {
      integrations: updatedIntegrations,
    });
    
    return { success: true };
  },
});

// Connect SMS Provider (Twilio)
export const connectTwilio = mutation({
  args: {
    agentId: v.id("agents"),
    accountSid: v.string(),
    authToken: v.string(),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    // TODO: In production, encrypt credentials before storing
    
    const updatedIntegrations = {
      ...agent.integrations,
      sms: {
        provider: "twilio" as const,
        accountSid: args.accountSid,
        authToken: args.authToken,
        phoneNumber: args.phoneNumber,
        verified: false, // Will be verified by test send
        active: true,
      },
    };
    
    await ctx.db.patch(args.agentId, {
      integrations: updatedIntegrations,
    });
    
    return { success: true };
  },
});

// Connect SMS Provider (MessageBird)
export const connectMessageBird = mutation({
  args: {
    agentId: v.id("agents"),
    accessKey: v.string(),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    const updatedIntegrations = {
      ...agent.integrations,
      sms: {
        provider: "messagebird" as const,
        accessKey: args.accessKey,
        phoneNumber: args.phoneNumber,
        verified: false,
        active: true,
      },
    };
    
    await ctx.db.patch(args.agentId, {
      integrations: updatedIntegrations,
    });
    
    return { success: true };
  },
});

// Connect SMS Provider (Vonage/Nexmo)
export const connectVonage = mutation({
  args: {
    agentId: v.id("agents"),
    apiKey: v.string(),
    apiSecret: v.string(),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    const updatedIntegrations = {
      ...agent.integrations,
      sms: {
        provider: "vonage" as const,
        apiKey: args.apiKey,
        apiSecret: args.apiSecret,
        phoneNumber: args.phoneNumber,
        verified: false,
        active: true,
      },
    };
    
    await ctx.db.patch(args.agentId, {
      integrations: updatedIntegrations,
    });
    
    return { success: true };
  },
});

// Connect SMS Provider (AWS SNS)
export const connectAwsSns = mutation({
  args: {
    agentId: v.id("agents"),
    awsAccessKeyId: v.string(),
    awsSecretAccessKey: v.string(),
    awsRegion: v.string(),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    const updatedIntegrations = {
      ...agent.integrations,
      sms: {
        provider: "aws-sns" as const,
        awsAccessKeyId: args.awsAccessKeyId,
        awsSecretAccessKey: args.awsSecretAccessKey,
        awsRegion: args.awsRegion,
        phoneNumber: args.phoneNumber,
        verified: false,
        active: true,
      },
    };
    
    await ctx.db.patch(args.agentId, {
      integrations: updatedIntegrations,
    });
    
    return { success: true };
  },
});

// Disconnect email provider
export const disconnectEmailProvider = mutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    const updatedIntegrations = {
      ...agent.integrations,
      email: undefined,
    };
    
    await ctx.db.patch(args.agentId, {
      integrations: updatedIntegrations,
    });
    
    return { success: true };
  },
});

// Disconnect SMS provider
export const disconnectSmsProvider = mutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    const updatedIntegrations = {
      ...agent.integrations,
      sms: undefined,
    };
    
    await ctx.db.patch(args.agentId, {
      integrations: updatedIntegrations,
    });
    
    return { success: true };
  },
});

// Toggle integration active status
export const toggleIntegration = mutation({
  args: {
    agentId: v.id("agents"),
    type: v.union(v.literal("email"), v.literal("sms")),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent || !agent.integrations) {
      throw new Error("Agent or integrations not found");
    }
    
    const integrations = agent.integrations;
    
    if (args.type === "email" && integrations.email) {
      integrations.email.active = args.active;
    } else if (args.type === "sms" && integrations.sms) {
      integrations.sms.active = args.active;
    }
    
    await ctx.db.patch(args.agentId, {
      integrations,
    });
    
    return { success: true };
  },
});

// Get raw integrations (for internal use by email/sms services)
export const getRawIntegrations = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    return agent?.integrations || null;
  },
});
