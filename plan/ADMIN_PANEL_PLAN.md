# Admin Panel Plan - Platform Overview Dashboard

**Purpose:** Complete platform management and monitoring for administrators  
**Route:** `/admin` (protected, admin-only access)  
**Priority:** High (operational necessity)  
**Estimated Effort:** 2-3 days  
**Status:** ✅ 50% COMPLETE (10 of 20 tasks done)  
**Last Updated:** January 16, 2025

---

## 🎉 COMPLETION STATUS

**✅ Phase 1: Foundation (100% Complete)**
- Task 01: Admin Authentication ✅
- Task 02: Admin Layout & Navigation ✅
- Task 03: Dashboard Overview ✅

**✅ Phase 2: Agent Management (100% Complete)**
- Task 06: Agent List with Search/Filters ✅
- Task 07: Agent Details Page ✅
- Task 08: Agent Actions (Toggle, Delete) ✅

**✅ Phase 3: Logging & Revenue (100% Complete)**
- Task 09: Activity Logs with CSV Export ✅
- Task 11: Revenue Dashboard with Charts ✅

**⏳ Phase 4: Analytics & Monitoring (0% Complete)**
- Task 13: Usage Analytics (DAU/MAU) ⏳
- Task 16: Feature Flags Management ⏳
- Task 17: API Monitoring ⏳
- Task 18: Cost Tracking ⏳

**📊 Overall Progress:** 10 of 20 tasks complete (50%)  
**✅ All completed features are production-ready and fully functional!**

---

## 🎯 Core Objectives

1. **Monitor Platform Health** - Real-time status of all systems
2. **Manage Users** - View, edit, disable agents
3. **Track Revenue** - Subscriptions, usage, billing
4. **View Analytics** - Platform-wide metrics and trends
5. **System Control** - Feature flags, maintenance mode
6. **Support Tools** - Quick access to help users

---

## 🔐 Access Control

### Admin Role Setup

**Who gets access:**
- Platform owners
- Technical administrators
- Support team leads

**Authentication:**
```typescript
// convex/schema.ts - Add admin field to agents table
agents: defineTable({
  // ... existing fields
  role: v.optional(v.union(
    v.literal("agent"),      // Regular agent
    v.literal("admin"),      // Full admin access
    v.literal("support")     // Support team (limited)
  )),
  isActive: v.boolean(),     // Can disable accounts
})
```

**Middleware protection:**
```typescript
// middleware.ts - Add admin route protection
export default clerkMiddleware((auth, req) => {
  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    auth().protect();
    // Additional check: verify admin role in Convex
  }
});
```

---

## 📊 Dashboard Layout

### Main Dashboard View

```
┌─────────────────────────────────────────────────────────────┐
│  ADMIN PANEL                        👤 Admin Name  [Logout] │
├─────────────────────────────────────────────────────────────┤
│  [Overview] [Agents] [Analytics] [Revenue] [System] [Logs]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Total Agents│  │Active Today │  │ Total Portals│        │
│  │    127      │  │     89      │  │    1,456     │        │
│  │  ↑ +12 (M) │  │  ↑ +8 (D)  │  │   ↑ +45 (W) │        │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Revenue   │  │  AI Calls   │  │  SMS Sent   │        │
│  │  $12,730/mo │  │   45,234    │  │   23,456    │        │
│  │  ↑ +23% (M) │  │  ↑ +156 (D)│  │   ↑ +89 (D) │        │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                               │
│  Recent Activity                          System Health      │
│  ┌────────────────────────────┐  ┌──────────────────────┐  │
│  │ • Agent #127 signed up     │  │ ✅ Convex: Healthy   │  │
│  │ • 45 new portals created   │  │ ✅ Clerk: Healthy    │  │
│  │ • 234 AI queries today     │  │ ✅ APIs: Healthy     │  │
│  │ • $399 revenue (today)     │  │ ⚠️  High SMS usage   │  │
│  └────────────────────────────┘  └──────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Feature Sections

### 1. Overview Dashboard (Main View)

**Key Metrics Cards:**
```typescript
interface DashboardMetrics {
  // User Metrics
  totalAgents: number;
  activeAgentsToday: number;
  activeAgentsThisWeek: number;
  newAgentsThisMonth: number;
  churnRate: number;
  
  // Portal Metrics
  totalBuyerPortals: number;
  totalSellerPortals: number;
  activePortalsToday: number;
  newPortalsThisWeek: number;
  
  // Revenue Metrics
  monthlyRecurringRevenue: number;
  revenueThisMonth: number;
  revenueGrowth: number;
  averageRevenuePerAgent: number;
  
  // Usage Metrics
  aiCallsToday: number;
  aiCallsThisMonth: number;
  smsMessagesThisMonth: number;
  emailsSentThisMonth: number;
  
  // Engagement Metrics
  propertiesViewed: number;
  offersSubmitted: number;
  toursScheduled: number;
  messagesExchanged: number;
}
```

**Charts:**
- 📈 Agent Growth (last 30 days)
- 📈 Portal Creation (last 30 days)
- 📈 Revenue Trend (last 12 months)
- 📈 AI Usage (last 7 days)
- 📈 Feature Adoption (% using each feature)

**Recent Activity Feed:**
- Last 20 significant events
- Real-time updates (Convex subscriptions)
- Filterable by type (agent signup, portal created, etc.)

**System Health:**
- ✅ Convex status
- ✅ Clerk status
- ✅ OpenRouter status
- ✅ RentCast status
- ✅ Twilio status (if enabled)
- ✅ Resend status (if enabled)
- ⚠️ Warning indicators for issues

---

### 2. Agents Management

**Agent List View:**
```
┌────────────────────────────────────────────────────────────┐
│  Agents (127)                    [Search] [Filter] [Export]│
├────────────────────────────────────────────────────────────┤
│  ☑️ Name          Email           Status   Joined   Actions│
├────────────────────────────────────────────────────────────┤
│  ☑️ John Smith    john@...       ✅Active  Jan 5   [View] │
│  ☑️ Jane Doe      jane@...       ✅Active  Jan 3   [View] │
│  ☑️ Bob Wilson    bob@...        ⏸️Paused  Dec 28  [View] │
│  ☑️ Sarah Jones   sarah@...      🔴Trial   Jan 15  [View] │
└────────────────────────────────────────────────────────────┘
```

**Filters:**
- Status (Active, Paused, Trial, Cancelled)
- Plan (Starter, Professional, Enterprise)
- Date joined (Today, Week, Month, All)
- Activity (Active today, Inactive 7+ days)
- Search by name or email

**Agent Detail View:**
```typescript
interface AgentDetails {
  // Basic Info
  id: string;
  name: string;
  email: string;
  agencyName?: string;
  phone?: string;
  
  // Account Status
  status: "active" | "paused" | "trial" | "cancelled";
  plan: "starter" | "professional" | "enterprise";
  joinedDate: number;
  trialEndDate?: number;
  
  // Usage Stats
  buyerPortalsCreated: number;
  sellerPortalsCreated: number;
  activePortals: number;
  aiCallsThisMonth: number;
  smsMessagesThisMonth: number;
  
  // Revenue
  monthlySubscription: number;
  lifetimeValue: number;
  lastPaymentDate: number;
  nextBillingDate: number;
  
  // Activity
  lastActive: number;
  propertiesViewed: number;
  offersSubmitted: number;
  messagesExchanged: number;
}
```

**Admin Actions:**
- View full profile
- Edit details
- Change plan
- Pause/Resume account
- Login as agent (impersonate)
- View activity logs
- Contact agent
- Delete account

---

### 3. Analytics Dashboard

**Platform-Wide Analytics:**

**User Analytics:**
- Daily/Weekly/Monthly Active Users (DAU/WAU/MAU)
- New user signups over time
- User retention cohorts
- Churn rate analysis
- Top agents by activity

**Portal Analytics:**
- Portals created per day
- Average portals per agent
- Portal engagement rates
- Time spent in portals
- Most viewed properties

**Feature Usage:**
- AI Chat usage (queries per day)
- Property comparison usage
- Favorites added
- Offers submitted
- Tours scheduled
- SMS campaigns sent
- Marketing content generated
- Open houses created

**Revenue Analytics:**
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- ARPU (Average Revenue Per User)
- Churn rate & revenue impact
- Expansion revenue (upgrades)
- Payment failures

**Performance Metrics:**
- Average page load time
- API response times
- Error rates
- Database query performance
- Real-time connections

---

### 4. Revenue Management

**Revenue Overview:**
```
┌────────────────────────────────────────────────────────────┐
│  Revenue                                   This Month       │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  MRR: $12,730      ↑ +23%        ARPU: $100    → Same      │
│  ARR: $152,760     ↑ +15%        LTV: $2,400   ↑ +8%       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Revenue Breakdown                                     │  │
│  │ ▓▓▓▓▓▓▓▓▓▓ Subscriptions: $10,500 (82%)             │  │
│  │ ▓▓▓ Usage (AI): $1,200 (9%)                          │  │
│  │ ▓▓ Usage (SMS): $830 (7%)                            │  │
│  │ ▓ Other: $200 (2%)                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Subscription Plans                                         │
│  • Starter ($99):       45 agents = $4,455                 │
│  • Professional ($199): 68 agents = $13,532                │
│  • Enterprise ($399):   14 agents = $5,586                 │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

**Features:**
- Revenue charts (daily, monthly, yearly)
- Subscription breakdown by plan
- Usage-based revenue (AI, SMS)
- Failed payments tracking
- Refund tracking
- Revenue forecasting

**Agent Revenue View:**
- List all agents with revenue
- Sort by LTV, MRR, usage
- Identify high-value customers
- Find at-risk customers (low usage)

---

### 5. System Settings

**Feature Flags:**
```typescript
interface FeatureFlags {
  // Feature toggles
  aiChatEnabled: boolean;
  smsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  openHousesEnabled: boolean;
  marketingGeneratorEnabled: boolean;
  
  // Limits
  maxPortalsPerAgent: number;
  maxAICallsPerMonth: number;
  maxSMSPerMonth: number;
  
  // Maintenance
  maintenanceMode: boolean;
  maintenanceMessage?: string;
}
```

**System Configuration:**
- Enable/disable features globally
- Set usage limits per plan
- Configure API rate limits
- Maintenance mode toggle
- Announcement banners

**API Status:**
- OpenRouter usage & costs
- RentCast API quota
- Twilio balance & usage
- Resend email quota
- Clerk user limits
- Convex usage

**Cost Monitoring:**
```typescript
interface CostTracking {
  openRouter: {
    callsThisMonth: number;
    costThisMonth: number;
    projectedCost: number;
  };
  twilio: {
    messagesThisMonth: number;
    costThisMonth: number;
    balance: number;
  };
  // Other services...
}
```

---

### 6. Activity Logs

**System Event Log:**
```
┌────────────────────────────────────────────────────────────┐
│  Activity Logs                      [Filter] [Export]       │
├────────────────────────────────────────────────────────────┤
│  Timestamp        User            Event              Details │
├────────────────────────────────────────────────────────────┤
│  Jan 16, 2:45 PM  john@agent.com  Signup            Trial   │
│  Jan 16, 2:42 PM  admin@app.com   Changed Plan      Pro→Ent│
│  Jan 16, 2:38 PM  jane@agent.com  Created Portal    Buyer  │
│  Jan 16, 2:35 PM  bob@agent.com   Sent SMS          x45    │
│  Jan 16, 2:30 PM  system          AI Generation     Success│
│  Jan 16, 2:28 PM  sarah@agent.com Payment Failed    $199   │
└────────────────────────────────────────────────────────────┘
```

**Log Types:**
- User signups/logins
- Subscription changes
- Portal creation/deletion
- Feature usage (AI, SMS, etc.)
- Payment events
- System errors
- Admin actions
- API calls

**Filters:**
- Time range (today, week, month, custom)
- Event type
- User
- Status (success, error, warning)

**Export:**
- CSV export for compliance
- JSON export for analysis

---

## 🗄️ Database Schema

### New Tables

```typescript
// convex/schema.ts

// Admin users (can be same as agents with role)
agents: defineTable({
  // Existing fields...
  role: v.optional(v.union(
    v.literal("agent"),
    v.literal("admin"),
    v.literal("support")
  )),
  isActive: v.boolean(),
  plan: v.optional(v.union(
    v.literal("starter"),
    v.literal("professional"),
    v.literal("enterprise")
  )),
  planStartDate: v.optional(v.number()),
  trialEndDate: v.optional(v.number()),
}),

// Activity logs
activityLogs: defineTable({
  timestamp: v.number(),
  userId: v.optional(v.string()), // Could be agentId or system
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
}).index("by_timestamp", ["timestamp"])
  .index("by_user", ["userId"])
  .index("by_category", ["eventCategory"]),

// Feature flags
featureFlags: defineTable({
  key: v.string(), // "ai_chat_enabled", etc.
  value: v.any(), // boolean, number, string, object
  description: v.string(),
  lastModified: v.number(),
  modifiedBy: v.string(),
}).index("by_key", ["key"]),

// System metrics (cached aggregations)
systemMetrics: defineTable({
  date: v.string(), // "2025-01-16"
  metricType: v.string(), // "daily_active_users", "portals_created", etc.
  value: v.number(),
  metadata: v.optional(v.any()),
}).index("by_date_type", ["date", "metricType"]),

// Revenue tracking
revenueEvents: defineTable({
  timestamp: v.number(),
  agentId: v.id("agents"),
  eventType: v.string(), // "subscription", "usage", "refund"
  amount: v.number(), // In cents
  currency: v.string(), // "USD"
  plan: v.optional(v.string()),
  description: v.string(),
  metadata: v.optional(v.any()),
}).index("by_agent", ["agentId"])
  .index("by_timestamp", ["timestamp"]),
```

---

## 🔧 Backend Functions

### Admin Queries

```typescript
// convex/admin.ts

// Dashboard metrics
export const getDashboardMetrics = query({
  args: {},
  handler: async (ctx) => {
    // Verify admin access
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    const admin = await ctx.db
      .query("agents")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!admin || admin.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    // Calculate metrics
    const agents = await ctx.db.query("agents").collect();
    const buyerSessions = await ctx.db.query("buyerSessions").collect();
    const sellerSessions = await ctx.db.query("sellerSessions").collect();
    
    // ... more aggregations
    
    return {
      totalAgents: agents.length,
      activeAgentsToday: calculateActiveToday(agents),
      totalBuyerPortals: buyerSessions.length,
      totalSellerPortals: sellerSessions.length,
      // ... more metrics
    };
  },
});

// Agent list with filters
export const getAgents = query({
  args: {
    status: v.optional(v.string()),
    plan: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify admin
    // ...
    
    let query = ctx.db.query("agents");
    let agents = await query.collect();
    
    // Apply filters
    if (args.status) {
      agents = agents.filter(a => a.status === args.status);
    }
    if (args.plan) {
      agents = agents.filter(a => a.plan === args.plan);
    }
    if (args.search) {
      agents = agents.filter(a => 
        a.email.includes(args.search) || 
        a.agencyName?.includes(args.search)
      );
    }
    
    return agents;
  },
});

// Agent details with stats
export const getAgentDetails = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    // Verify admin
    // ...
    
    const agent = await ctx.db.get(args.agentId);
    if (!agent) throw new Error("Agent not found");
    
    // Get related data
    const buyerSessions = await ctx.db
      .query("buyerSessions")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();
      
    const sellerSessions = await ctx.db
      .query("sellerSessions")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();
    
    // Calculate stats
    return {
      ...agent,
      stats: {
        buyerPortalsCreated: buyerSessions.length,
        sellerPortalsCreated: sellerSessions.length,
        // ... more stats
      },
    };
  },
});

// Activity logs
export const getActivityLogs = query({
  args: {
    limit: v.optional(v.number()),
    eventCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify admin
    // ...
    
    const logs = await ctx.db
      .query("activityLogs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit || 100);
    
    return logs;
  },
});

// Revenue metrics
export const getRevenueMetrics = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify admin
    // ...
    
    const events = await ctx.db
      .query("revenueEvents")
      .withIndex("by_timestamp")
      .filter((q) => 
        q.gte(q.field("timestamp"), args.startDate || 0)
      )
      .collect();
    
    // Calculate MRR, ARR, etc.
    return calculateRevenueMetrics(events);
  },
});
```

### Admin Mutations

```typescript
// Update agent status
export const updateAgentStatus = mutation({
  args: {
    agentId: v.id("agents"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify admin
    // ...
    
    await ctx.db.patch(args.agentId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    
    // Log activity
    await logActivity(ctx, {
      eventType: "agent_status_changed",
      description: `Agent status changed to ${args.status}`,
      metadata: { agentId: args.agentId },
    });
  },
});

// Update feature flag
export const updateFeatureFlag = mutation({
  args: {
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    // Verify admin
    // ...
    
    const flag = await ctx.db
      .query("featureFlags")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    
    if (flag) {
      await ctx.db.patch(flag._id, {
        value: args.value,
        lastModified: Date.now(),
      });
    } else {
      await ctx.db.insert("featureFlags", {
        key: args.key,
        value: args.value,
        description: "",
        lastModified: Date.now(),
        modifiedBy: identity.subject,
      });
    }
  },
});

// Log activity helper
async function logActivity(ctx: any, event: {
  eventType: string;
  description: string;
  metadata?: any;
  severity?: "info" | "warning" | "error";
}) {
  await ctx.db.insert("activityLogs", {
    timestamp: Date.now(),
    eventType: event.eventType,
    eventCategory: "system",
    description: event.description,
    metadata: event.metadata,
    severity: event.severity || "info",
  });
}
```

---

## 🎨 UI Components

### Key Components to Build

```typescript
// components/admin/admin-layout.tsx
// Main admin layout with sidebar navigation

// components/admin/metric-card.tsx
// Reusable metric card with value, change, trend

// components/admin/agent-table.tsx
// Sortable, filterable agent table

// components/admin/activity-feed.tsx
// Real-time activity feed

// components/admin/revenue-chart.tsx
// Revenue visualization (recharts)

// components/admin/system-health.tsx
// Service status indicators

// components/admin/feature-flag-toggle.tsx
// Toggle switches for feature flags
```

---

## 📱 Routes Structure

```
/admin
├── /admin                     # Dashboard overview
├── /admin/agents              # Agent management
├── /admin/agents/[id]         # Agent details
├── /admin/analytics           # Analytics dashboard
├── /admin/revenue             # Revenue tracking
├── /admin/system              # System settings
├── /admin/system/features     # Feature flags
├── /admin/system/api-status   # API monitoring
├── /admin/logs                # Activity logs
└── /admin/support             # Support tools
```

---

## 🔔 Real-Time Features

### Live Updates with Convex

```typescript
// Real-time dashboard updates
const metrics = useQuery(api.admin.getDashboardMetrics);
const recentActivity = useQuery(api.admin.getActivityLogs, { limit: 20 });

// Auto-refresh every 30 seconds for system health
useEffect(() => {
  const interval = setInterval(() => {
    // Convex handles this automatically with subscriptions
  }, 30000);
  return () => clearInterval(interval);
}, []);
```

### Notifications

- New agent signups (toast notification)
- Payment failures (alert)
- System errors (urgent alert)
- High usage warnings (info)

---

## 🎯 Success Metrics

### Track These KPIs

**User Metrics:**
- DAU/MAU ratio (target: 40%+)
- New signups per day (target: 2-5)
- Churn rate (target: < 5%/month)
- Activation rate (target: 80%+)

**Revenue Metrics:**
- MRR growth (target: 10%+ month-over-month)
- ARPU (target: $150+)
- LTV:CAC ratio (target: 3:1+)
- Payment success rate (target: 95%+)

**Engagement Metrics:**
- Portals per agent (target: 5+)
- AI calls per agent (target: 50+/month)
- Feature adoption (target: 60%+)
- Daily active portals (target: 30%+)

---

## 🚀 Implementation Priority

### Phase 1: Core Dashboard (Day 1)
- Basic layout and navigation
- Metric cards (agents, portals, revenue)
- Recent activity feed
- System health indicators

### Phase 2: Agent Management (Day 2)
- Agent list with filters
- Agent detail view
- Basic admin actions (pause, edit)
- Activity logs

### Phase 3: Analytics & Revenue (Day 3)
- Revenue charts and breakdown
- Usage analytics
- Feature adoption tracking
- Cost monitoring

### Phase 4: System Control (Day 4)
- Feature flag management
- API status monitoring
- Maintenance mode
- Advanced admin tools

---

## 📚 Technical Stack

**Frontend:**
- Next.js App Router
- shadcn/ui components
- Recharts for visualizations
- Real-time Convex subscriptions

**Backend:**
- Convex queries (real-time)
- Admin-only mutations
- Activity logging
- Aggregation functions

**Charts:**
- Recharts (recharts.org)
- Simple, performant, responsive
- Line charts, bar charts, pie charts

---

## ✅ Admin Panel Checklist

### Must Have
- [ ] Dashboard overview with key metrics
- [ ] Agent list and management
- [ ] Activity logs
- [ ] System health monitoring
- [ ] Revenue tracking
- [ ] Admin authentication

### Nice to Have
- [ ] Advanced analytics
- [ ] Feature flag management
- [ ] Impersonate agent feature
- [ ] Email blast tool
- [ ] Export data (CSV)
- [ ] Announcement system

### Future Enhancements
- [ ] Automated alerts
- [ ] Forecasting & predictions
- [ ] A/B testing tools
- [ ] Customer success metrics
- [ ] Cohort analysis
- [ ] Mobile app version

---

## 🎉 Expected Outcome

**An admin panel that provides:**
- ✅ Complete platform visibility
- ✅ Quick agent management
- ✅ Real-time monitoring
- ✅ Revenue insights
- ✅ System control
- ✅ Operational efficiency

**Time saved:** 5-10 hours/week on manual monitoring and support tasks

---

**Ready to build?** This plan provides everything needed to implement a comprehensive admin panel. Let me know when you want to start implementation! 🚀
