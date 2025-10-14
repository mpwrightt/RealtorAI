'use client';

import { useParams, useRouter } from 'next/navigation';
import { useRequireAdmin } from '@/hooks/use-admin-access';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { 
  IconArrowLeft, 
  IconEdit, 
  IconToggleLeft,
  IconToggleRight,
  IconTrash,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useState } from 'react';

export default function AgentDetailPage() {
  const params = useParams() as Readonly<{ agentId: string }>;
  const router = useRouter();
  const { isAuthorized, isLoading: authLoading } = useRequireAdmin();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const agentId = params.agentId as Id<"agents">;
  const agent = useQuery(api.admin.agents.getAgentById, { agentId });
  const toggleStatus = useMutation(api.admin.agents.toggleAgentStatus);
  const deleteAgent = useMutation(api.admin.agents.deleteAgent);

  if (authLoading) return <div className="text-gray-600">Loading...</div>;
  if (!isAuthorized) return null;
  if (!agent) return <div className="text-gray-600">Loading agent...</div>;

  const isActive = agent.active !== false && agent.isActive !== false;

  const handleToggleStatus = async () => {
    await toggleStatus({ agentId });
  };

  const handleDelete = async () => {
    await deleteAgent({ agentId });
    router.push('/admin/agents');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/agents"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <IconArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {agent.agencyName || 'Agent Details'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {agent.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400'
                : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
            }`}
          >
            {isActive ? (
              <>
                <IconToggleRight className="w-5 h-5" />
                Deactivate
              </>
            ) : (
              <>
                <IconToggleLeft className="w-5 h-5" />
                Activate
              </>
            )}
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 rounded-lg font-medium transition-colors"
          >
            <IconTrash className="w-5 h-5" />
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-400 mb-4">
            Are you sure you want to delete this agent? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Status
          </h3>
          <div className="flex items-center gap-2">
            {isActive ? (
              <IconCheck className="w-5 h-5 text-green-600" />
            ) : (
              <IconX className="w-5 h-5 text-red-600" />
            )}
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Total Portals
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {agent.stats.totalPortals}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Buyer Portals
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {agent.stats.buyerPortals}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Seller Portals
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {agent.stats.sellerPortals}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Agent Information
        </h2>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{agent.email}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Agency Name</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{agent.agencyName || 'N/A'}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{agent.phone || 'N/A'}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">License Number</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{agent.licenseNumber || 'N/A'}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Plan</dt>
            <dd className="mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 capitalize">
                {agent.plan || 'None'}
              </span>
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Role</dt>
            <dd className="mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 capitalize">
                {agent.role || 'Agent'}
              </span>
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Joined</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {formatDistanceToNow(agent.createdAt, { addSuffix: true })}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Listings</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{agent.stats.listings}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
