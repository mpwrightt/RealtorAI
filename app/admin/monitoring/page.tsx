'use client';

import { useState } from 'react';
import { useRequireAdmin } from '@/hooks/use-admin-access';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { 
  IconCheck,
  IconAlertCircle,
  IconClock,
  IconTrendingUp,
  IconCurrencyDollar,
} from '@tabler/icons-react';

export default function MonitoringPage() {
  const { isAuthorized, isLoading: authLoading } = useRequireAdmin();
  const [days, setDays] = useState(7);
  const [costDays, setCostDays] = useState(30);
  
  const serviceStatus = useQuery(api.admin.monitoring.getServiceStatus);
  const apiUsage = useQuery(api.admin.monitoring.getApiUsageStats, { days });
  const costEstimates = useQuery(api.admin.monitoring.getCostEstimates, { days: costDays });

  if (authLoading) return <div className="text-gray-600">Loading...</div>;
  if (!isAuthorized) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <IconCheck className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <IconAlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <IconAlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <IconClock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          API Monitoring & Cost Tracking
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor service health, API usage, and estimated costs
        </p>
      </div>

      {/* Service Status */}
      {serviceStatus && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Service Health
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(serviceStatus.overall)}`}>
                {serviceStatus.overall}
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {serviceStatus.services.map((service, idx) => (
              <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {service.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last checked: {new Date(service.lastChecked).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {'usage' in service && service.usage !== undefined && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {service.usage} calls/hour
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Usage Stats */}
      {apiUsage && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              API Usage Statistics
            </h2>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Total AI Calls
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {apiUsage.summary.totalAiCalls.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {apiUsage.summary.period}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Property API Calls
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {apiUsage.summary.totalApiCalls.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {apiUsage.summary.period}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                SMS Messages Sent
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {apiUsage.summary.totalSmsSent.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {apiUsage.summary.period}
              </p>
            </div>
          </div>

          {/* Service Usage Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Usage by Service
            </h3>
            <div className="space-y-4">
              {apiUsage.services.map((service, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {service.name}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {service.calls.toLocaleString()} calls
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {service.avgPerDay.toFixed(1)}/day
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min((service.calls / Math.max(...apiUsage.services.map(s => s.calls))) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Cost Estimates */}
      {costEstimates && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Cost Estimates
            </h2>
            <select
              value={costDays}
              onChange={(e) => setCostDays(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-2">
                <IconCurrencyDollar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Cost
                </h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${costEstimates.totalCost.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {costEstimates.period}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-2">
                <IconTrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Daily Average
                </h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${costEstimates.projections.daily.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Per day
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-2">
                <IconCurrencyDollar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Monthly Estimate
                </h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${costEstimates.monthlyEstimate.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Projected
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-2">
                <IconTrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Yearly Estimate
                </h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${costEstimates.projections.yearly.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Projected
              </p>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Cost Breakdown by Service
            </h3>
            <div className="space-y-3">
              {Object.values(costEstimates.breakdown).map((service, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {service.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {service.usage}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ${service.estimated.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {service.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
