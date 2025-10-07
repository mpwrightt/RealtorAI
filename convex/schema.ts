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
      // Campaign branding settings
      brandingSettings: v.optional(v.object({
        companyName: v.optional(v.string()), // For email/SMS (defaults to agencyName)
        replyEmail: v.optional(v.string()), // Custom reply-to (defaults to email)
        smsPhone: v.optional(v.string()), // Custom SMS sender (requires Twilio setup)
        emailSignature: v.optional(v.string()), // Custom email signature
        website: v.optional(v.string()), // Company website
      })),
      // Zapier webhooks
      zapierWebhooks: v.optional(v.object({
        enabled: v.boolean(),
        webhookUrl: v.optional(v.string()),
        events: v.optional(v.array(v.string())), // Which events to forward
        lastTriggered: v.optional(v.number()),
      })),
      // Third-party integrations (agent's own accounts)
      integrations: v.optional(v.object({
        // Email providers (agent can choose which to use)
        email: v.optional(v.object({
          provider: v.union(v.literal("resend"), v.literal("sendgrid"), v.literal("mailgun")),
          apiKey: v.string(), // Encrypted in production
          fromEmail: v.optional(v.string()),
          verified: v.optional(v.boolean()),
          active: v.boolean(),
        })),
        // SMS providers (agent can choose which to use)
        sms: v.optional(v.object({
          provider: v.union(
            v.literal("twilio"),
            v.literal("messagebird"),
            v.literal("vonage"),
            v.literal("aws-sns")
          ),
          // Twilio fields
          accountSid: v.optional(v.string()),
          authToken: v.optional(v.string()), // Encrypted in production
          // MessageBird fields
          accessKey: v.optional(v.string()), // Encrypted in production
          // Vonage fields
          apiKey: v.optional(v.string()), // Encrypted in production
          apiSecret: v.optional(v.string()), // Encrypted in production
          // AWS SNS fields
          awsAccessKeyId: v.optional(v.string()), // Encrypted in production
          awsSecretAccessKey: v.optional(v.string()), // Encrypted in production
          awsRegion: v.optional(v.string()),
          // Common fields
          phoneNumber: v.string(),
          verified: v.optional(v.boolean()),
          active: v.boolean(),
        })),
      })),
      // Admin & subscription fields
      role: v.optional(v.union(
        v.literal("agent"),
        v.literal("admin"),
        v.literal("support")
      )),
      isActive: v.optional(v.boolean()),
      plan: v.optional(v.union(
        v.literal("starter"),
        v.literal("professional"),
        v.literal("enterprise"),
        v.literal("trial")
      )),
      planStartDate: v.optional(v.number()),
      trialEndDate: v.optional(v.number()),
      subscriptionStatus: v.optional(v.union(
        v.literal("active"),
        v.literal("paused"),
        v.literal("cancelled"),
        v.literal("trial")
      )),
      lastActive: v.optional(v.number()),
    })
      .index("byInviteCode", ["inviteCode"])
      .index("byUserId", ["userId"])
      .index("byActive", ["active"])
      .index("byRole", ["role"]),
    
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
      aiNeighborhoodSummary: v.optional(v.object({
        propertyContext: v.string(),
        walkabilityTransit: v.string(),
        amenitiesDining: v.string(),
        schoolsFamily: v.string(),
        communityLifestyle: v.string(),
        generatedAt: v.number(),
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
    
    // Open Houses
    openHouses: defineTable({
      listingId: v.id("listings"),
      agentId: v.id("agents"),
      startTime: v.number(),
      endTime: v.number(),
      status: v.string(), // "scheduled", "active", "completed", "cancelled"
      notes: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("byListing", ["listingId"])
      .index("byAgent", ["agentId"])
      .index("byStatus", ["status"])
      .index("byStartTime", ["startTime"]),
    
    // Open House Attendees
    openHouseAttendees: defineTable({
      openHouseId: v.id("openHouses"),
      name: v.string(),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      notes: v.optional(v.string()),
      interested: v.boolean(),
      followUpSent: v.boolean(),
      createdAt: v.number(),
    })
      .index("byOpenHouse", ["openHouseId"])
      .index("byEmail", ["email"]),
    
    // Showing Feedback
    showingFeedback: defineTable({
      listingId: v.id("listings"),
      agentId: v.id("agents"),
      buyerSessionId: v.optional(v.id("buyerSessions")),
      buyerName: v.optional(v.string()),
      buyerEmail: v.optional(v.string()),
      rating: v.number(), // 1-5 stars
      feedback: v.optional(v.string()),
      interestedInOffer: v.boolean(),
      concerns: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("byListing", ["listingId"])
      .index("byAgent", ["agentId"])
      .index("byBuyerSession", ["buyerSessionId"]),
    
    // SMS Campaigns
    smsCampaigns: defineTable({
      agentId: v.id("agents"),
      name: v.string(),
      template: v.string(), // "new_listing", "price_drop", "open_house", "custom"
      message: v.string(),
      listingId: v.optional(v.id("listings")),
      recipientCount: v.number(),
      sentCount: v.number(),
      deliveredCount: v.number(),
      failedCount: v.number(),
      status: v.string(), // "draft", "sending", "sent", "failed"
      scheduledFor: v.optional(v.number()),
      sentAt: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("byAgent", ["agentId"])
      .index("byStatus", ["status"])
      .index("byCreatedAt", ["createdAt"]),
    
    // SMS Recipients
    smsRecipients: defineTable({
      campaignId: v.id("smsCampaigns"),
      agentId: v.id("agents"),
      name: v.string(),
      phone: v.string(),
      clientType: v.optional(v.string()), // "buyer", "seller", "lead", "custom"
      clientId: v.optional(v.string()),
      status: v.string(), // "pending", "sent", "delivered", "failed"
      twilioSid: v.optional(v.string()),
      error: v.optional(v.string()),
      sentAt: v.optional(v.number()),
      deliveredAt: v.optional(v.number()),
      createdAt: v.number(),
    })
      .index("byCampaign", ["campaignId"])
      .index("byAgent", ["agentId"])
      .index("byStatus", ["status"]),
    
    // Admin: Activity Logs
    activityLogs: defineTable({
      timestamp: v.number(),
      userId: v.optional(v.string()), // Could be agentId or "system"
      userEmail: v.optional(v.string()),
      eventType: v.string(), // "signup", "portal_created", "payment", etc.
      eventCategory: v.string(), // "user", "revenue", "system", etc.
      description: v.string(),
      metadata: v.optional(v.any()), // Additional event data
      severity: v.optional(v.union(
        v.literal("info"),
        v.literal("warning"),
        v.literal("error")
      )),
    })
      .index("by_timestamp", ["timestamp"])
      .index("by_user", ["userId"])
      .index("by_category", ["eventCategory"]),
    
    // Admin: Feature Flags
    featureFlags: defineTable({
      key: v.string(),
      name: v.string(),
      description: v.string(),
      enabled: v.boolean(),
      category: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
      updatedBy: v.string(),
    })
      .index("by_key", ["key"])
      .index("by_category", ["category"]),
    
    // Admin: System Metrics (cached aggregations)
    systemMetrics: defineTable({
      metricType: v.string(), // "daily_active_users", "portals_created", "health_check"
      metricName: v.string(), // Specific metric name
      value: v.number(),
      timestamp: v.number(),
      metadata: v.optional(v.any()),
    })
      .index("by_type", ["metricType"])
      .index("by_name", ["metricName"]),
    
    // Admin: Revenue Tracking
    revenueEvents: defineTable({
      timestamp: v.number(),
      agentId: v.id("agents"),
      eventType: v.string(), // "subscription", "usage", "refund"
      amount: v.number(), // In cents
      currency: v.string(), // "USD"
      plan: v.optional(v.string()),
      description: v.string(),
      metadata: v.optional(v.any()),
    })
      .index("by_agent", ["agentId"])
      .index("by_timestamp", ["timestamp"]),
  });