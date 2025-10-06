'use client';

import { useState } from 'react';
import { useRequireAdmin } from '@/hooks/use-admin-access';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AgentTable } from '@/components/admin/agent-table';
import { exportToCSV, formatAgentsForExport } from '@/lib/exports';
import { IconDownload } from '@tabler/icons-react';

export default function AgentsPage() {
  const { isAuthorized, isLoading: authLoading } = useRequireAdmin();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [plan, setPlan] = useState('');
  
  const agents = useQuery(api.admin.agents.getAgents, {
    search: search || undefined,
    status: status || undefined,
    plan: plan || undefined,
  });

  if (authLoading) return <div className="text-gray-600">Loading...</div>;
  if (!isAuthorized) return null;

  const handleExport = () => {
    if (agents) {
      const exportData = formatAgentsForExport(agents);
      exportToCSV(exportData, 'agents');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Agent Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all agents on the platform
          </p>
        </div>
        
        <button
          onClick={handleExport}
          disabled={!agents || agents.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IconDownload className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {agents === undefined ? (
        <div className="text-gray-600">Loading agents...</div>
      ) : (
        <AgentTable
          agents={agents}
          onSearch={setSearch}
          onFilterStatus={setStatus}
          onFilterPlan={setPlan}
        />
      )}
    </div>
  );
}
