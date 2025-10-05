import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { paymentAttemptSchemaValidator } from "./paymentAttemptTypes";

export default defineSchema({
    users: defineTable({
      name: v.string(),
      // this the Clerk ID, stored in the subject JWT field
      externalId: v.string(),
    }).index("byExternalId", ["externalId"]),
    
    paymentAttempts: defineTable(paymentAttemptSchemaValidator)
      .index("byPaymentId", ["payment_id"])
      .index("byUserId", ["userId"])
      .index("byPayerUserId", ["payer.user_id"]),
    
    // Real Estate Agent Profiles
    agents: defineTable({
      userId: v.id("users"),
      agencyName: v.string(),
      licenseNumber: v.string(),
      inviteCode: v.string(),
      phone: v.optional(v.string()),
      email: v.string(),
      bio: v.optional(v.string()),
      profileImage: v.optional(v.string()),
      active: v.boolean(),
      createdAt: v.number(),
    })
      .index("byInviteCode", ["inviteCode"])
      .index("byUserId", ["userId"])
      .index("byActive", ["active"]),
    
    // Property Listings
    listings: defineTable({
      agentId: v.id("agents"),
      mlsId: v.optional(v.string()),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      price: v.number(),
      bedrooms: v.number(),
      bathrooms: v.number(),
      sqft: v.number(),
      lotSize: v.optional(v.number()),
      yearBuilt: v.optional(v.number()),
      propertyType: v.string(), // "single-family", "condo", "townhouse", etc.
      status: v.string(), // "active", "pending", "sold", "withdrawn"
      description: v.string(),
      features: v.array(v.string()),
      images: v.array(v.string()),
      videos: v.array(v.string()),
      virtualTourUrl: v.optional(v.string()),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
      enrichedData: v.optional(v.object({
        schoolRatings: v.any(),
        walkScore: v.optional(v.number()),
        crimeStats: v.any(),
        nearbyAmenities: v.array(v.any()),
        comps: v.array(v.any()),
        lastEnriched: v.optional(v.number()),
      })),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("byAgentId", ["agentId"])
      .index("byStatus", ["status"])
      .index("byMlsId", ["mlsId"])
      .index("byCity", ["city"])
      .index("byPrice", ["price"]),
    
    // Buyer Portal Sessions
    buyerSessions: defineTable({
      agentId: v.id("agents"),
      buyerName: v.string(),
      buyerEmail: v.string(),
      buyerPhone: v.optional(v.string()),
      sessionCode: v.string(),
      preferences: v.object({
        minPrice: v.optional(v.number()),
        maxPrice: v.optional(v.number()),
        bedrooms: v.optional(v.number()),
        bathrooms: v.optional(v.number()),
        propertyTypes: v.array(v.string()),
        cities: v.array(v.string()),
        mustHaveFeatures: v.array(v.string()),
      }),
      notificationPreferences: v.optional(v.object({
        emailNotifications: v.boolean(),
        smsNotifications: v.boolean(),
      })),
      preQualification: v.optional(v.object({
        amount: v.number(),
        lender: v.string(),
        expirationDate: v.number(),
        verified: v.boolean(),
      })),
      active: v.boolean(),
      createdAt: v.number(),
      lastActive: v.number(),
    })
      .index("bySessionCode", ["sessionCode"])
      .index("byAgentId", ["agentId"])
      .index("byActive", ["active"]),
    
    // Seller Portal Sessions
    sellerSessions: defineTable({
      agentId: v.id("agents"),
      listingId: v.id("listings"),
      sellerName: v.string(),
      sellerEmail: v.string(),
      sellerPhone: v.optional(v.string()),
      sessionCode: v.string(),
      notificationPreferences: v.optional(v.object({
        emailNotifications: v.boolean(),
        smsNotifications: v.boolean(),
      })),
      active: v.boolean(),
      createdAt: v.number(),
      lastActive: v.number(),
    })
      .index("bySessionCode", ["sessionCode"])
      .index("byListingId", ["listingId"])
      .index("byAgentId", ["agentId"]),
    
    // Property View Analytics
    propertyViews: defineTable({
      listingId: v.id("listings"),
      buyerSessionId: v.optional(v.id("buyerSessions")),
      viewerType: v.string(), // "buyer", "anonymous", "agent"
      viewDuration: v.number(),
      imagesViewed: v.array(v.number()),
      videosWatched: v.array(v.number()),
      sectionsVisited: v.array(v.string()),
      timestamp: v.number(),
    })
      .index("byListingId", ["listingId"])
      .index("byBuyerSessionId", ["buyerSessionId"])
      .index("byTimestamp", ["timestamp"]),
    
    // Purchase Offers
    offers: defineTable({
      listingId: v.id("listings"),
      buyerSessionId: v.id("buyerSessions"),
      offerAmount: v.number(),
      earnestMoney: v.number(),
      downPayment: v.number(),
      financingType: v.string(), // "cash", "conventional", "fha", "va"
      contingencies: v.array(v.string()),
      inspectionPeriod: v.optional(v.number()),
      closingDate: v.optional(v.string()),
      additionalTerms: v.optional(v.string()),
      status: v.string(), // "pending", "accepted", "rejected", "countered", "withdrawn"
      aiAnalysis: v.optional(v.object({
        marketComparison: v.string(),
        strengths: v.array(v.string()),
        risks: v.array(v.string()),
        recommendation: v.string(),
        confidence: v.number(),
      })),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("byListingId", ["listingId"])
      .index("byBuyerSessionId", ["buyerSessionId"])
      .index("byStatus", ["status"]),
    
    // AI Agent Conversation Logs
    agentInteractions: defineTable({
      sessionType: v.string(), // "buyer", "seller", "agent"
      sessionId: v.string(),
      agentQuery: v.string(),
      agentResponse: v.string(),
      toolsUsed: v.array(v.string()),
      context: v.optional(v.any()),
      timestamp: v.number(),
    })
      .index("bySessionId", ["sessionId"])
      .index("bySessionType", ["sessionType"])
      .index("byTimestamp", ["timestamp"]),
    
    // Saved Property Searches
    savedSearches: defineTable({
      buyerSessionId: v.id("buyerSessions"),
      searchName: v.string(),
      criteria: v.object({
        minPrice: v.optional(v.number()),
        maxPrice: v.optional(v.number()),
        bedrooms: v.optional(v.number()),
        bathrooms: v.optional(v.number()),
        cities: v.array(v.string()),
        features: v.array(v.string()),
      }),
      notificationsEnabled: v.boolean(),
      createdAt: v.number(),
      lastRun: v.optional(v.number()),
    })
      .index("byBuyerSessionId", ["buyerSessionId"]),
    
    // Favorite Properties
    favorites: defineTable({
      buyerSessionId: v.id("buyerSessions"),
      listingId: v.id("listings"),
      notes: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("byBuyerSessionId", ["buyerSessionId"])
      .index("byListingId", ["listingId"])
      .index("byBuyerAndListing", ["buyerSessionId", "listingId"]),
    
    // Property Alerts (for saved search notifications)
    alerts: defineTable({
      buyerSessionId: v.id("buyerSessions"),
      savedSearchId: v.id("savedSearches"),
      newListingIds: v.array(v.id("listings")),
      notified: v.boolean(),
      createdAt: v.number(),
    })
      .index("byBuyerSessionId", ["buyerSessionId"])
      .index("bySavedSearchId", ["savedSearchId"])
      .index("byNotified", ["notified"]),
    
    // Tour Requests
    tours: defineTable({
      buyerSessionId: v.id("buyerSessions"),
      listingId: v.id("listings"),
      requestedDate: v.number(),
      status: v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("completed"),
        v.literal("cancelled")
      ),
      timeSlot: v.string(),
      notes: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("byBuyerSessionId", ["buyerSessionId"])
      .index("byListingId", ["listingId"])
      .index("byStatus", ["status"]),
    
    // Communication Hub - Messages
    messages: defineTable({
      agentId: v.id("agents"),
      clientType: v.string(), // "buyer" or "seller"
      clientId: v.string(), // Session ID as string (can be buyer or seller)
      clientName: v.string(),
      clientPhone: v.optional(v.string()),
      clientEmail: v.optional(v.string()),
      type: v.string(), // "sms" or "email"
      direction: v.string(), // "inbound" or "outbound"
      subject: v.optional(v.string()), // for emails
      body: v.string(),
      read: v.boolean(),
      replied: v.boolean(),
      listingId: v.optional(v.id("listings")), // related property
      createdAt: v.number(),
    })
      .index("byAgent", ["agentId"])
      .index("byClient", ["clientId"])
      .index("byAgentAndRead", ["agentId", "read"])
      .index("byAgentAndClient", ["agentId", "clientId"]),
    
    // Marketing Campaigns
    marketingCampaigns: defineTable({
      listingId: v.id("listings"),
      agentId: v.id("agents"),
      type: v.string(), // "full", "listing", "social", "email"
      generatedContent: v.object({
        listingDescription: v.optional(v.string()),
        socialMediaPosts: v.optional(v.object({
          facebook: v.string(),
          instagram: v.string(),
          twitter: v.string(),
        })),
        emailTemplate: v.optional(v.string()),
        hashtags: v.array(v.string()),
      }),
      status: v.string(), // "draft", "published"
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("byListing", ["listingId"])
      .index("byAgent", ["agentId"]),
    
    // Client Tracker - Simple CRM for leads
    leads: defineTable({
      agentId: v.id("agents"),
      name: v.string(),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      status: v.string(), // "new", "active", "closed"
      type: v.string(), // "buyer" or "seller"
      source: v.string(), // "website", "referral", "zillow", "realtor.com", "other"
      priority: v.string(), // "hot", "warm", "cold"
      notes: v.optional(v.string()),
      followUpDate: v.optional(v.number()),
      sessionId: v.optional(v.string()), // Linked session if created
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("byAgent", ["agentId"])
      .index("byStatus", ["status"])
      .index("byAgentAndStatus", ["agentId", "status"])
      .index("byAgentAndPriority", ["agentId", "priority"]),
  });