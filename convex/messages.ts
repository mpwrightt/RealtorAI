import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get all messages for an agent
export const getMessagesByAgent = query({
  args: {
    agentId: v.id("agents"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("byAgent", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .take(args.limit || 100);
    
    return messages;
  },
});

// Get messages for a specific client conversation
export const getConversation = query({
  args: {
    agentId: v.id("agents"),
    clientId: v.string(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("byAgentAndClient", (q) => 
        q.eq("agentId", args.agentId).eq("clientId", args.clientId)
      )
      .order("desc")
      .collect();
    
    return messages;
  },
});

// Get unread count
export const getUnreadCount = query({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("byAgentAndRead", (q) => 
        q.eq("agentId", args.agentId).eq("read", false)
      )
      .collect();
    
    return messages.length;
  },
});

// Send a message
export const sendMessage = mutation({
  args: {
    agentId: v.id("agents"),
    clientType: v.string(),
    clientId: v.string(),
    clientName: v.string(),
    clientPhone: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    type: v.string(), // "sms" or "email"
    subject: v.optional(v.string()),
    body: v.string(),
    listingId: v.optional(v.id("listings")),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      agentId: args.agentId,
      clientType: args.clientType,
      clientId: args.clientId,
      clientName: args.clientName,
      clientPhone: args.clientPhone,
      clientEmail: args.clientEmail,
      type: args.type,
      direction: "outbound",
      subject: args.subject,
      body: args.body,
      read: true, // outbound messages are "read" by definition
      replied: false,
      listingId: args.listingId,
      createdAt: Date.now(),
    });
    
    // TODO: In production, integrate with Twilio (SMS) or SendGrid (email)
    // For now, just store in database
    
    return messageId;
  },
});

// Mark message as read
export const markAsRead = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      read: true,
    });
  },
});

// Mark all messages in a conversation as read
export const markConversationAsRead = mutation({
  args: {
    agentId: v.id("agents"),
    clientId: v.string(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("byAgentAndClient", (q) => 
        q.eq("agentId", args.agentId).eq("clientId", args.clientId)
      )
      .filter((q) => q.eq(q.field("read"), false))
      .collect();
    
    for (const message of messages) {
      await ctx.db.patch(message._id, { read: true });
    }
  },
});

// Create a simulated inbound message (for demo/testing)
export const simulateInboundMessage = mutation({
  args: {
    agentId: v.id("agents"),
    clientType: v.string(),
    clientId: v.string(),
    clientName: v.string(),
    clientPhone: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    type: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      agentId: args.agentId,
      clientType: args.clientType,
      clientId: args.clientId,
      clientName: args.clientName,
      clientPhone: args.clientPhone,
      clientEmail: args.clientEmail,
      type: args.type,
      direction: "inbound",
      body: args.body,
      read: false,
      replied: false,
      createdAt: Date.now(),
    });
  },
});

// Send message from buyer portal
export const sendBuyerMessage = mutation({
  args: {
    buyerSessionId: v.id("buyerSessions"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.buyerSessionId);
    if (!session) {
      throw new Error("Buyer session not found");
    }

    const agent = await ctx.db.get(session.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    const messageId = await ctx.db.insert("messages", {
      agentId: session.agentId,
      clientType: "buyer",
      clientId: args.buyerSessionId,
      clientName: session.buyerName,
      clientPhone: session.buyerPhone,
      clientEmail: session.buyerEmail,
      type: "chat",
      direction: "inbound",
      body: args.body,
      read: false,
      replied: false,
      createdAt: Date.now(),
    });

    // TODO: Send notification to agent based on preferences
    
    return messageId;
  },
});

// Send message from seller portal
export const sendSellerMessage = mutation({
  args: {
    sellerSessionId: v.id("sellerSessions"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sellerSessionId);
    if (!session) {
      throw new Error("Seller session not found");
    }

    const agent = await ctx.db.get(session.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    const messageId = await ctx.db.insert("messages", {
      agentId: session.agentId,
      clientType: "seller",
      clientId: args.sellerSessionId,
      clientName: session.sellerName,
      clientPhone: session.sellerPhone,
      clientEmail: session.sellerEmail,
      type: "chat",
      direction: "inbound",
      body: args.body,
      read: false,
      replied: false,
      createdAt: Date.now(),
    });

    // TODO: Send notification to agent based on preferences
    
    return messageId;
  },
});

// Get messages for a buyer session
export const getBuyerMessages = query({
  args: {
    buyerSessionId: v.id("buyerSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.buyerSessionId);
    if (!session) {
      throw new Error("Buyer session not found");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("byAgentAndClient", (q) => 
        q.eq("agentId", session.agentId).eq("clientId", args.buyerSessionId)
      )
      .order("desc")
      .collect();
    
    return messages.reverse();
  },
});

// Get messages for a seller session
export const getSellerMessages = query({
  args: {
    sellerSessionId: v.id("sellerSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sellerSessionId);
    if (!session) {
      throw new Error("Seller session not found");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("byAgentAndClient", (q) => 
        q.eq("agentId", session.agentId).eq("clientId", args.sellerSessionId)
      )
      .order("desc")
      .collect();
    
    return messages.reverse();
  },
});
