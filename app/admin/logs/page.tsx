'use client';

import { useState } from 'react';
import { useRequireAdmin } from '@/hooks/use-admin-access';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { formatDistanceToNow } from 'date-fns';
import { IconFilter, IconDownload } from '@tabler/icons-react';

export default function LogsPage() {
  const { isAuthorized, isLoading: authLoading } = useRequireAdmin();
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [limit, setLimit] = useState(100);
  
  const logs = useQuery(api.admin.logs.getActivityLogs, {
    limit,
    category: category || undefined,
    severity: severity || undefined,
  });

  if (authLoading) return <div className="text-gray-600">Loading...</div>;
  if (!isAuthorized) return null;

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  const exportToCSV = () => {
    if (!logs) return;
    
    const headers = ['Timestamp', 'Event Type', 'Category', 'Description', 'User', 'Severity'];
    const rows = logs.map(log => [
      new Date(log.timestamp).toISOString(),
      log.eventType,
      log.eventCategory,
      log.description,
      log.userEmail || log.userId || 'System',
      log.severity || 'info',
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Activity Logs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            System events and user activity history
          </p>
        </div>
        
        <button
          onClick={exportToCSV}
          disabled={!logs || logs.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IconDownload className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">All Categories</option>
          <option value="user">User</option>
          <option value="revenue">Revenue</option>
          <option value="system">System</option>
        </select>

        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">All Severity</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="50">Last 50</option>
          <option value="100">Last 100</option>
          <option value="250">Last 250</option>
          <option value="500">Last 500</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Severity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {!logs ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.eventType}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {log.eventCategory}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-md truncate">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {log.userEmail || log.userId || 'System'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                        {log.severity || 'info'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {logs && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {logs.length} log entries
        </p>
      )}
    </div>
  );
}
