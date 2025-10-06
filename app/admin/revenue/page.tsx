'use client';

import { useState } from 'react';
import { useRequireAdmin } from '@/hooks/use-admin-access';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { MetricCard } from '@/components/admin/metric-card';
import { RevenueChart } from '@/components/admin/revenue-chart';
import { 
  IconTrendingUp, 
  IconCurrencyDollar, 
  IconUsers,
  IconChartBar,
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';

export default function RevenuePage() {
  const { isAuthorized, isLoading: authLoading } = useRequireAdmin();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [chartDays, setChartDays] = useState(30);
  
  const metrics = useQuery(api.admin.revenue.getRevenueMetrics, { period });
  const chartData = useQuery(api.admin.revenue.getRevenueChart, { days: chartDays });

  if (authLoading) return <div className="text-gray-600">Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Revenue Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track revenue, subscriptions, and financial metrics
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
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Monthly Recurring Revenue"
            value={`$${metrics.mrr.toLocaleString()}`}
            icon={IconCurrencyDollar}
            trend={metrics.newSubscriptions > 0 ? 'up' : 'neutral'}
            change={`+${metrics.newSubscriptions}`}
            changeLabel="new this month"
          />
          
          <MetricCard
            title="Annual Recurring Revenue"
            value={`$${metrics.arr.toLocaleString()}`}
            icon={IconTrendingUp}
            trend="up"
            changeLabel="Projected"
          />
          
          <MetricCard
            title="Total Revenue"
            value={`$${metrics.totalRevenue.toFixed(2)}`}
            icon={IconChartBar}
            trend="neutral"
            changeLabel={`This ${period}`}
          />
          
          <MetricCard
            title="Average Revenue Per User"
            value={`$${metrics.arpu.toFixed(2)}`}
            icon={IconUsers}
            trend="neutral"
            changeLabel="/month"
          />
        </div>
      )}

      {/* Secondary Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Active Subscriptions
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {metrics.totalSubscriptions}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              +{metrics.newSubscriptions} new this {period}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Cancellations
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {metrics.cancellations}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              This {period}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Churn Rate
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {metrics.churnRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              This {period}
            </p>
          </div>
        </div>
      )}

      {/* Revenue by Plan */}
      {metrics && Object.keys(metrics.revenueByPlan).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Revenue by Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(metrics.revenueByPlan).map(([plan, amount]) => (
              <div key={plan} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {plan}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ${amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Revenue Trends
          </h2>
          <select
            value={chartDays}
            onChange={(e) => setChartDays(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
        
        {chartData ? (
          <RevenueChart data={chartData} />
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            Loading chart...
          </div>
        )}
      </div>

      {/* Recent Events */}
      {metrics && metrics.events.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Revenue Events
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {metrics.events.slice(0, 10).map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {event.eventType.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white capitalize">
                      {event.plan || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-medium">
                      ${event.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
