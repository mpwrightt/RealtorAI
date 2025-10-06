'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IconSearch, IconFilter, IconCheck, IconX, IconEye } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';

interface Agent {
  _id: string;
  email: string;
  agencyName?: string;
  active: boolean;
  isActive?: boolean;
  plan?: string;
  createdAt: number;
  totalPortals: number;
  buyerPortals: number;
  sellerPortals: number;
}

interface AgentTableProps {
  agents: Agent[];
  onSearch: (query: string) => void;
  onFilterStatus: (status: string) => void;
  onFilterPlan: (plan: string) => void;
}

export function AgentTable({ agents, onSearch, onFilterStatus, onFilterPlan }: AgentTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    onFilterStatus(value === 'all' ? '' : value);
  };

  const handlePlanChange = (value: string) => {
    setPlanFilter(value);
    onFilterPlan(value === 'all' ? '' : value);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email or agency name..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={planFilter}
          onChange={(e) => handlePlanChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Plans</option>
          <option value="starter">Starter</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
          <option value="trial">Trial</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Portals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {agents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No agents found
                  </td>
                </tr>
              ) : (
                agents.map((agent) => {
                  const isActive = agent.active !== false && agent.isActive !== false;
                  
                  return (
                    <tr key={agent._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {agent.agencyName || 'No Agency Name'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {agent.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {isActive ? (
                            <>
                              <IconCheck className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <IconX className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white capitalize">
                          {agent.plan || 'None'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {agent.totalPortals}
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                            ({agent.buyerPortals}B / {agent.sellerPortals}S)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(agent.createdAt, { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/agents/${agent._id}`}
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <IconEye className="w-4 h-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {agents.length} agent{agents.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
