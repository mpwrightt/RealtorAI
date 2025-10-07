# Task 03: Dashboard Overview

**Phase:** 13 - Admin Panel  
**Estimated Time:** 1 hour  
**Priority:** High

---

## Objective

Build the main dashboard overview page with key platform metrics, recent activity, and system health indicators.

---

## Steps

### 1. Create Dashboard Metrics Query

Create `convex/admin/dashboard.ts`:

```typescript
import { query } from "../_generated/server";
import { requireAdmin } from "../lib/adminAuth";

export const getDashboardMetrics = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const now = Date.now();
    const today = new Date().setHours(0, 0, 0, 0);
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Get all agents
    const allAgents = await ctx.db.query("agents").collect();
    const activeAgents = allAgents.filter(a => a.isActive !== false);
    const activeToday = allAgents.filter(a => 
      a.lastActive && a.lastActive >= today
    );
    const newThisMonth = allAgents.filter(a => 
      a.createdAt >= monthAgo
    );

    // Get portals
    const buyerPortals = await ctx.db.query("buyerSessions").collect();
    const sellerPortals = await ctx.db.query("sellerSessions").collect();
    const totalPortals = buyerPortals.length + sellerPortals.length;
    
    const newPortalsThisWeek = [
      ...buyerPortals.filter(p => p.createdAt >= weekAgo),
      ...sellerPortals.filter(p => p.createdAt >= weekAgo),
    ].length;

    // Get activity counts
    const offers = await ctx.db.query("offers").collect();
    const offersThisMonth = offers.filter(o => o.createdAt >= monthAgo);
    
    const messages = await ctx.db.query("messages").collect();
    const messagesToday = messages.filter(m => m.createdAt >= today);

    return {
      // User metrics
      totalAgents: allAgents.length,
      activeAgents: activeAgents.length,
      activeToday: activeToday.length,
      newAgentsThisMonth: newThisMonth.length,
      agentGrowth: calculateGrowth(allAgents, monthAgo),

      // Portal metrics
      totalPortals,
      totalBuyerPortals: buyerPortals.length,
      totalSellerPortals: sellerPortals.length,
      newPortalsThisWeek,
      portalGrowth: calculateGrowth(
        [...buyerPortals, ...sellerPortals],
        weekAgo
      ),

      // Activity metrics
      totalOffers: offers.length,
      offersThisMonth: offersThisMonth.length,
      totalMessages: messages.length,
      messagesToday: messagesToday.length,

      // Engagement
      averagePortalsPerAgent: totalPortals / (activeAgents.length || 1),
    };
  },
});

function calculateGrowth(items: any[], sinceTimestamp: number): number {
  const recent = items.filter(i => i.createdAt >= sinceTimestamp);
  const total = items.length;
  
  if (total === 0) return 0;
  
  return Math.round((recent.length / total) * 100);
}

export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const activities: Array<{
      id: string;
      type: string;
      description: string;
      timestamp: number;
      severity: 'info' | 'warning' | 'success';
    }> = [];

    // Get recent agents (last 24 hours)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentAgents = await ctx.db
      .query("agents")
      .filter((q) => q.gte(q.field("createdAt"), oneDayAgo))
      .collect();

    for (const agent of recentAgents) {
      activities.push({
        id: agent._id,
        type: 'agent_signup',
        description: `New agent signed up: ${agent.email}`,
        timestamp: agent.createdAt,
        severity: 'success',
      });
    }

    // Get recent portals
    const recentBuyerPortals = await ctx.db
      .query("buyerSessions")
      .filter((q) => q.gte(q.field("createdAt"), oneDayAgo))
      .take(10);

    for (const portal of recentBuyerPortals) {
      activities.push({
        id: portal._id,
        type: 'buyer_portal_created',
        description: `Buyer portal created: ${portal.buyerName}`,
        timestamp: portal.createdAt,
        severity: 'info',
      });
    }

    const recentSellerPortals = await ctx.db
      .query("sellerSessions")
      .filter((q) => q.gte(q.field("createdAt"), oneDayAgo))
      .take(10);

    for (const portal of recentSellerPortals) {
      activities.push({
        id: portal._id,
        type: 'seller_portal_created',
        description: `Seller portal created: ${portal.sellerName}`,
        timestamp: portal.createdAt,
        severity: 'info',
      });
    }

    // Sort by timestamp descending
    activities.sort((a, b) => b.timestamp - a.timestamp);

    return activities.slice(0, 20);
  },
});
```

### 2. Create Dashboard Page

Update `app/admin/page.tsx`:

```typescript
'use client';

import { useRequireAdmin } from '@/hooks/use-admin-access';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { MetricCard } from '@/components/admin/metric-card';
import { ActivityFeed } from '@/components/admin/activity-feed';
import { SystemHealth } from '@/components/admin/system-health';
import {
  IconUsers,
  IconUserCheck,
  IconFolders,
  IconFileText,
  IconMessages,
  IconTrendingUp,
} from '@tabler/icons-react';

export default function AdminPage() {
  const { isAuthorized, isLoading } = useRequireAdmin();
  const metrics = useQuery(api.admin.dashboard.getDashboardMetrics);
  const activity = useQuery(api.admin.dashboard.getRecentActivity);

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your platform's key metrics and activity
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Agents"
          value={metrics.totalAgents}
          change={`+${metrics.newAgentsThisMonth}`}
          changeLabel="this month"
          icon={IconUsers}
          trend="up"
        />
        
        <MetricCard
          title="Active Today"
          value={metrics.activeToday}
          change={`${metrics.activeAgents} total active`}
          icon={IconUserCheck}
          trend="neutral"
        />
        
        <MetricCard
          title="Total Portals"
          value={metrics.totalPortals}
          change={`+${metrics.newPortalsThisWeek}`}
          changeLabel="this week"
          icon={IconFolders}
          trend="up"
        />
        
        <MetricCard
          title="Buyer Portals"
          value={metrics.totalBuyerPortals}
          change={`${Math.round(metrics.averagePortalsPerAgent)} avg/agent`}
          icon={IconFileText}
          trend="neutral"
        />
        
        <MetricCard
          title="Seller Portals"
          value={metrics.totalSellerPortals}
          change={`${metrics.totalOffers} offers total`}
          icon={IconFileText}
          trend="neutral"
        />
        
        <MetricCard
          title="Messages Today"
          value={metrics.messagesToday}
          change={`${metrics.totalMessages} total`}
          icon={IconMessages}
          trend="neutral"
        />
      </div>

      {/* Activity and Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed activities={activity || []} />
        </div>
        
        <div>
          <SystemHealth />
        </div>
      </div>
    </div>
  );
}
```

### 3. Test Dashboard

Test the dashboard:
- Verify all metrics display correctly
- Check activity feed shows recent events
- Ensure real-time updates work
- Test responsive layout

---

## Acceptance Criteria

- ✅ Dashboard displays all key metrics
- ✅ Metrics are accurate
- ✅ Activity feed shows recent events
- ✅ System health indicators work
- ✅ Real-time updates via Convex
- ✅ Loading states work
- ✅ Responsive on all screen sizes

---

## Next Steps

After completing this task:
- ✅ Dashboard overview is functional
- ➡️ Proceed to Task 04: Metric Cards (create reusable components)
