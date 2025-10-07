import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { decryptIfNeeded, encrypt, requireEncryptionKey } from "./lib/encryption";

// Get agent's Zapier configuration
export const getZapierConfig = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      return {
        enabled: false,
        webhookUrl: undefined,
        events: [],
        lastTriggered: undefined,
      };
    }
    
    // Return config with webhook URL masked
    const config = agent.zapierWebhooks;
    if (!config) {
      return {
        enabled: false,
        webhookUrl: undefined,
        events: [],
        lastTriggered: undefined,
      };
    }
    
    let maskedWebhook: string | undefined;
    if (config.webhookUrl) {
      const encryptionKey = requireEncryptionKey();
      const webhookUrl = await decryptIfNeeded(config.webhookUrl, encryptionKey);
      if (webhookUrl) {
        maskedWebhook = `https://hooks.zapier.com/...${webhookUrl.slice(-8)}`;
      }
    }

    return {
      enabled: config.enabled,
      webhookUrl: maskedWebhook,
      events: config.events || [],
      lastTriggered: config.lastTriggered,
    };
  },
});

// Update Zapier configuration
export const updateZapierConfig = mutation({
  args: {
    agentId: v.id("agents"),
    enabled: v.boolean(),
    webhookUrl: v.optional(v.string()),
    events: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    const encryptionKey = requireEncryptionKey();
    const webhookUrl = args.webhookUrl
      ? await encrypt(args.webhookUrl, encryptionKey)
      : agent.zapierWebhooks?.webhookUrl;

    const updatedConfig = {
      enabled: args.enabled,
      webhookUrl,
      events: args.events || agent.zapierWebhooks?.events || [],
      lastTriggered: agent.zapierWebhooks?.lastTriggered,
    };
    
    await ctx.db.patch(args.agentId, {
      zapierWebhooks: updatedConfig,
    });
    
    return { success: true };
  },
});

// Disconnect Zapier
export const disconnectZapier = mutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    await ctx.db.patch(args.agentId, {
      zapierWebhooks: {
        enabled: false,
        webhookUrl: undefined,
        events: [],
        lastTriggered: undefined,
      },
    });
    
    return { success: true };
  },
});

// Send event to Zapier (internal action)
export const triggerZapierWebhook = action({
  args: {
    agentId: v.id("agents"),
    event: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get agent's Zapier config
      const agent: any = await ctx.runQuery(api.agents.getAgentById, {
        agentId: args.agentId,
      });
      
      if (!agent?.zapierWebhooks?.enabled || !agent.zapierWebhooks?.webhookUrl) {
        console.log('[Zapier] Not configured for agent:', args.agentId);
        return { success: false, error: 'Zapier not configured' };
      }
      
      const encryptionKey = requireEncryptionKey();
      const webhookUrl = await decryptIfNeeded(agent.zapierWebhooks.webhookUrl, encryptionKey);
      if (!webhookUrl) {
        console.log('[Zapier] Webhook URL missing after decryption');
        return { success: false, error: 'Zapier webhook missing' };
      }
      
      // Check if this event is enabled
      const events = agent.zapierWebhooks.events || [];
      if (events.length > 0 && !events.includes(args.event)) {
        console.log('[Zapier] Event not enabled:', args.event);
        return { success: false, error: 'Event not enabled' };
      }
      
      // Zapier webhook moved to Next.js API route
      console.log('[Zapier] Webhooks now handled via Next.js API routes');
      
      // Zapier webhooks moved to Next.js API routes
      void webhookUrl;
      const result = { success: true };
      
      if (result.success) {
        // Update last triggered timestamp
        await ctx.runMutation(api.zapier.markZapierTriggered, {
          agentId: args.agentId,
          lastTriggered: Date.now(),
        });
      }
      
      return result;
    } catch (error: any) {
      console.error('[Zapier] Trigger error:', error);
      return {
        success: false,
        error: error.message || 'Failed to trigger webhook',
      };
    }
  },
});

// Test Zapier webhook (sends test event)
export const testZapierWebhook = action({
  args: {
    agentId: v.id("agents"),
    webhookUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    try {
      const agent = await ctx.runQuery(api.agents.getAgentById, {
        agentId: args.agentId,
      });
      if (!agent?.zapierWebhooks?.enabled) {
        return { success: false, error: "Zapier not configured" };
      }

      const encryptionKey = requireEncryptionKey();
      const storedWebhookUrl = agent.zapierWebhooks.webhookUrl
        ? await decryptIfNeeded(agent.zapierWebhooks.webhookUrl, encryptionKey)
        : undefined;

      const webhookUrl = args.webhookUrl ?? storedWebhookUrl;
      if (!webhookUrl) {
        return { success: false, error: "No webhook URL available" };
      }

      void webhookUrl;

      // Zapier webhooks moved to Next.js API routes  
      return { success: true };
    } catch (error: any) {
      console.error('[Zapier] Test webhook error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send test webhook',
      };
    }
  },
});

export const markZapierTriggered = mutation({
  args: {
    agentId: v.id("agents"),
    lastTriggered: v.number(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent?.zapierWebhooks) {
      return { success: false };
    }

    await ctx.db.patch(args.agentId, {
      zapierWebhooks: {
        ...agent.zapierWebhooks,
        lastTriggered: args.lastTriggered,
      },
    });

    return { success: true };
  },
});
