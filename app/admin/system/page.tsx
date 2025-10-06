'use client';

import { useState } from 'react';
import { useRequireAdmin } from '@/hooks/use-admin-access';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { 
  IconToggleLeft,
  IconToggleRight,
  IconPlus,
  IconTrash,
  IconEdit,
  IconRefresh,
} from '@tabler/icons-react';

export default function SystemPage() {
  const { isAuthorized, isLoading: authLoading } = useRequireAdmin();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFlag, setNewFlag] = useState({
    key: '',
    name: '',
    description: '',
    enabled: true,
    category: 'features',
  });
  
  const flags = useQuery(api.admin.featureFlags.getAllFlags);
  const toggleFlag = useMutation(api.admin.featureFlags.toggleFlag);
  const createFlag = useMutation(api.admin.featureFlags.createFlag);
  const deleteFlag = useMutation(api.admin.featureFlags.deleteFlag);
  const initializeFlags = useMutation(api.admin.featureFlags.initializeDefaultFlags);

  if (authLoading) return <div className="text-gray-600">Loading...</div>;
  if (!isAuthorized) return null;

  const handleToggle = async (flagId: string) => {
    await toggleFlag({ flagId: flagId as any });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFlag(newFlag);
      setShowCreateModal(false);
      setNewFlag({
        key: '',
        name: '',
        description: '',
        enabled: true,
        category: 'features',
      });
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDelete = async (flagId: string) => {
    if (confirm('Are you sure you want to delete this feature flag?')) {
      await deleteFlag({ flagId: flagId as any });
    }
  };

  const handleInitialize = async () => {
    if (confirm('Initialize default feature flags? This will not overwrite existing flags.')) {
      const result = await initializeFlags();
      alert(`Created ${result.created} new flags out of ${result.total} defaults.`);
    }
  };

  const groupedFlags = flags?.reduce((acc, flag) => {
    if (!acc[flag.category]) acc[flag.category] = [];
    acc[flag.category].push(flag);
    return acc;
  }, {} as Record<string, typeof flags>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            System Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage feature flags and system configuration
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleInitialize}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
          >
            <IconRefresh className="w-5 h-5" />
            Initialize Defaults
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <IconPlus className="w-5 h-5" />
            New Flag
          </button>
        </div>
      </div>

      {/* Feature Flags */}
      {groupedFlags && Object.entries(groupedFlags).map(([category, categoryFlags]) => (
        <div key={category} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
              {category}
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {categoryFlags.map((flag) => (
              <div key={flag._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {flag.name}
                    </h3>
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">
                      {flag.key}
                    </code>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {flag.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Last updated by {flag.updatedBy} • {new Date(flag.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggle(flag._id)}
                    className={`p-2 rounded-lg transition-colors ${
                      flag.enabled
                        ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title={flag.enabled ? 'Disable' : 'Enable'}
                  >
                    {flag.enabled ? (
                      <IconToggleRight className="w-6 h-6" />
                    ) : (
                      <IconToggleLeft className="w-6 h-6" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(flag._id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <IconTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {flags && flags.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No feature flags yet. Click "Initialize Defaults" to create default flags.
          </p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Create Feature Flag
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Key *
                </label>
                <input
                  type="text"
                  required
                  value={newFlag.key}
                  onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value })}
                  placeholder="feature_name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={newFlag.name}
                  onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })}
                  placeholder="Feature Name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={newFlag.description}
                  onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                  placeholder="What does this feature do?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  value={newFlag.category}
                  onChange={(e) => setNewFlag({ ...newFlag, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="features">Features</option>
                  <option value="notifications">Notifications</option>
                  <option value="system">System</option>
                  <option value="experimental">Experimental</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={newFlag.enabled}
                  onChange={(e) => setNewFlag({ ...newFlag, enabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="enabled" className="text-sm text-gray-700 dark:text-gray-300">
                  Enable by default
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
