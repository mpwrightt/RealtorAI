'use client';

import { useRequireAdmin } from '@/hooks/use-admin-access';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { MetricCard } from '@/components/admin/metric-card';
import { EnhancedMetricCard } from '@/components/admin/enhanced-metric-card';
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
  const { isAuthorized, isLoading: authLoading } = useRequireAdmin();
  const metrics = useQuery(api.admin.dashboard.getDashboardMetrics);
  const activity = useQuery(api.admin.dashboard.getRecentActivity);

  if (authLoading || !metrics) {
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
    return null; // Hook will redirect
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
        <EnhancedMetricCard
          title="Total Agents"
          value={metrics.totalAgents}
          icon={<IconUsers className="w-6 h-6" />}
          trend={{
            value: metrics.newAgentsThisMonth > 0 ? Math.round((metrics.newAgentsThisMonth / metrics.totalAgents) * 100) : 0,
            label: "this month",
            direction: metrics.newAgentsThisMonth > 0 ? "up" : "neutral"
          }}
          variant="success"
        />
        
        <EnhancedMetricCard
          title="Active Today"
          value={metrics.activeToday}
          icon={<IconUserCheck className="w-6 h-6" />}
          subtitle={`${metrics.activeAgents} total active agents`}
          variant="info"
        />
        
        <EnhancedMetricCard
          title="Total Portals"
          value={metrics.totalPortals}
          icon={<IconFolders className="w-6 h-6" />}
          trend={{
            value: metrics.newPortalsThisWeek > 0 ? Math.round((metrics.newPortalsThisWeek / metrics.totalPortals) * 100) : 0,
            label: "this week",
            direction: metrics.newPortalsThisWeek > 0 ? "up" : "neutral"
          }}
          variant="default"
        />
        
        <MetricCard
          title="Buyer Portals"
          value={metrics.totalBuyerPortals}
          change={`${metrics.averagePortalsPerAgent} avg/agent`}
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
