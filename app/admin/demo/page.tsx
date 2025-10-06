'use client';

import { useState } from 'react';
import { useRequireAdmin } from '@/hooks/use-admin-access';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { 
  IconSparkles,
  IconAlertCircle,
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconTrash,
} from '@tabler/icons-react';
import { useUser } from '@clerk/nextjs';

export default function AdminDemoPage() {
  const { isAuthorized, isLoading: authLoading } = useRequireAdmin();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const demoFlag = useQuery(api.admin.featureFlags.getFlag, { key: "demo_mode" });
  const toggleFlag = useMutation(api.admin.featureFlags.toggleFlag);
  const createDemoData = useMutation(api.demoData.createDemoData);
  const clearDemoData = useMutation(api.demoData.clearDemoData);

  if (authLoading) return <div className="text-gray-600">Loading...</div>;
  if (!isAuthorized) return null;

  const handleToggleDemoMode = async () => {
    if (!demoFlag) return;
    try {
      await toggleFlag({ flagId: demoFlag._id });
    } catch (error) {
      console.error('Failed to toggle demo mode:', error);
    }
  };

  const handleGenerateDemo = async () => {
    if (!user?.id || !user?.primaryEmailAddress?.emailAddress) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const res = await createDemoData({
        externalId: user.id,
        email: user.primaryEmailAddress.emailAddress,
      });
      
      setResult(res);
    } catch (error: any) {
      alert(error.message || "Failed to generate demo data");
    } finally {
      setLoading(false);
    }
  };

  const handleClearDemo = async () => {
    if (!user?.id || !user?.primaryEmailAddress?.emailAddress) return;
    if (!confirm('Are you sure you want to clear all demo data?')) return;
    
    setLoading(true);
    
    try {
      await clearDemoData({
        externalId: user.id,
        email: user.primaryEmailAddress.emailAddress,
      });
      
      setResult(null);
      alert('Demo data cleared successfully');
    } catch (error: any) {
      alert(error.message || "Failed to clear demo data");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/buyer/${text}`);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Demo Mode Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Control demo data generation for testing and presentations
        </p>
      </div>

      {/* Demo Mode Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Demo Mode Status
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {demoFlag?.enabled 
                ? 'Demo mode is currently enabled. Users can generate test data.'
                : 'Demo mode is currently disabled. Enable it to allow test data generation.'}
            </p>
          </div>
          
          <button
            onClick={handleToggleDemoMode}
            disabled={!demoFlag}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              demoFlag?.enabled
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {demoFlag?.enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Warning Message */}
      {!demoFlag?.enabled && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <IconAlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900 dark:text-yellow-300 mb-1">
                Demo Mode Disabled
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Enable demo mode above to generate test data. This is useful for presentations and testing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generate Demo Data */}
      {demoFlag?.enabled && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Generate Demo Data
          </h2>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Creates comprehensive test data including listings, buyer sessions, seller sessions, offers, and interactions.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={handleGenerateDemo}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconSparkles className="w-5 h-5" />
              {loading ? 'Generating...' : 'Generate Demo Data'}
            </button>
            
            {result && (
              <button
                onClick={handleClearDemo}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IconTrash className="w-5 h-5" />
                Clear Demo Data
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Success Message */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <IconCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-green-900 dark:text-green-300">
                Demo Data Generated Successfully!
              </h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {result.stats.listings}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Property Listings
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {result.stats.buyerSessions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Buyer Sessions
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {result.stats.sellerSessions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Seller Sessions
                </div>
              </div>
            </div>
          </div>

          {/* Buyer Session Links */}
          {result.buyerSessionCodes && result.buyerSessionCodes.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Buyer Session Links
              </h3>
              <div className="space-y-2">
                {result.buyerSessionCodes.map((code: string, index: number) => (
                  <div key={code} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Buyer Session #{index + 1}
                      </div>
                      <div className="text-xs font-mono text-gray-600 dark:text-gray-400">
                        {code}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(code)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <IconCopy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => window.open(`/buyer/${code}`, '_blank')}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <IconExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seller Session Links */}
          {result.sellerSessionCodes && result.sellerSessionCodes.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Seller Session Links
              </h3>
              <div className="space-y-2">
                {result.sellerSessionCodes.map((code: string, index: number) => (
                  <div key={code} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Seller Session #{index + 1}
                      </div>
                      <div className="text-xs font-mono text-gray-600 dark:text-gray-400">
                        {code}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(code)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <IconCopy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => window.open(`/seller/${code}`, '_blank')}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <IconExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
