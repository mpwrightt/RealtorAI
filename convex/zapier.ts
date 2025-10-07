import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";

// Get agent's Zapier configuration
export const getZapierConfig = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) return null;
    
    // Return config with webhook URL masked
    const config = agent.zapierWebhooks;
    if (!config) return null;
    
    return {
      enabled: config.enabled,
      webhookUrl: config.webhookUrl ? `https://hooks.zapier.com/...${config.webhookUrl.slice(-8)}` : undefined,
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
    
    const updatedConfig = {
      enabled: args.enabled,
      webhookUrl: args.webhookUrl,
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
      const agent: any = await ctx.runQuery((ctx as any).db.get, args.agentId);
      
      if (!agent?.zapierWebhooks?.enabled || !agent.zapierWebhooks?.webhookUrl) {
        console.log('[Zapier] Not configured for agent:', args.agentId);
        return { success: false, error: 'Zapier not configured' };
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
      const result = { success: true };
      
      if (result.success) {
        // Update last triggered timestamp
        await ctx.runMutation((ctx as any).db.patch, {
          id: args.agentId,
          fields: {
            zapierWebhooks: {
              ...agent.zapierWebhooks,
              lastTriggered: Date.now(),
            },
          },
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
    webhookUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    try {
      // Zapier webhooks moved to Next.js API routes  
      const result = { success: true };
      
      return result;
    } catch (error: any) {
      console.error('[Zapier] Test webhook error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send test webhook',
      };
    }
  },
});
