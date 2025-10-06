'use client';

import { useState } from 'react';
import { useRequireAdmin } from '@/hooks/use-admin-access';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { MetricCard } from '@/components/admin/metric-card';
import { 
  IconUsers, 
  IconTrendingUp,
  IconActivity,
  IconCalendar,
} from '@tabler/icons-react';

export default function AnalyticsPage() {
  const { isAuthorized, isLoading: authLoading } = useRequireAdmin();
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [chartDays, setChartDays] = useState(30);
  
  const analytics = useQuery(api.admin.analytics.getUsageAnalytics, { period });
  const engagementTrend = useQuery(api.admin.analytics.getEngagementTrend, { days: chartDays });
  const featureUsage = useQuery(api.admin.analytics.getFeatureUsage);

  if (authLoading) return <div className="text-gray-600">Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Usage Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track engagement, retention, and feature adoption
          </p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="day">Last 24 Hours</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
        </select>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Daily Active Users"
            value={analytics.dau}
            icon={IconUsers}
            trend="neutral"
            changeLabel={`${analytics.dau_mau_ratio.toFixed(1)}% of MAU`}
          />
          
          <MetricCard
            title="Weekly Active Users"
            value={analytics.wau}
            icon={IconCalendar}
            trend="neutral"
            changeLabel={`${analytics.wau_mau_ratio.toFixed(1)}% of MAU`}
          />
          
          <MetricCard
            title="Monthly Active Users"
            value={analytics.mau}
            icon={IconActivity}
            trend="up"
            changeLabel="This month"
          />
          
          <MetricCard
            title="Retention Rate"
            value={`${analytics.retentionRate.toFixed(1)}%`}
            icon={IconTrendingUp}
            trend={analytics.retentionRate > 50 ? 'up' : 'neutral'}
            changeLabel="Returning agents"
          />
        </div>
      )}

      {/* Simple stats when no data */}
      {!analytics && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Loading analytics...
          </p>
        </div>
      )}
    </div>
  );
}
