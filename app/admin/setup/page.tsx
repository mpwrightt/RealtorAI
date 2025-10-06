'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { IconCheck, IconAlertCircle, IconLoader2 } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function AdminSetupPage() {
  const router = useRouter();
  const { user } = useUser();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const setAdminRole = useMutation(api.admin.setup.setAdminRole);
  const checkMyRole = useMutation(api.admin.setup.checkMyRole);

  // Don't render admin layout on this page
  if (typeof window !== 'undefined') {
    document.body.style.overflow = 'auto';
  }

  const handleGrantAdmin = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      setStatus('error');
      setMessage('No email found. Please sign in first.');
      return;
    }

    setStatus('loading');
    setMessage('Granting admin access...');

    try {
      const result = await setAdminRole({ 
        email: user.primaryEmailAddress.emailAddress 
      });
      
      setStatus('success');
      setMessage(`Success! Admin role granted to ${user.primaryEmailAddress.emailAddress}`);
      
      // Redirect to admin dashboard after 2 seconds
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      setMessage(`Error: ${error.message || 'Failed to grant admin access'}`);
    }
  };

  const handleCheckRole = async () => {
    setStatus('loading');
    setMessage('Checking your role...');

    try {
      const result = await checkMyRole({});
      setStatus('success');
      setMessage(JSON.stringify(result, null, 2));
    } catch (error: any) {
      setStatus('error');
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Setup
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Grant yourself admin access to the platform
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          {/* Current User */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Signed in as:
            </h2>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {user?.primaryEmailAddress?.emailAddress || 'Not signed in'}
            </p>
          </div>

          {/* Grant Admin Button */}
          <button
            onClick={handleGrantAdmin}
            disabled={status === 'loading' || !user}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {status === 'loading' && <IconLoader2 className="w-5 h-5 animate-spin" />}
            {status === 'loading' ? 'Granting Access...' : 'Grant Admin Access'}
          </button>

          {/* Check Role Button */}
          <button
            onClick={handleCheckRole}
            disabled={status === 'loading' || !user}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Check My Current Role
          </button>

          {/* Status Message */}
          {status !== 'idle' && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              status === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                : status === 'error'
                ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
            }`}>
              {status === 'success' && <IconCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              {status === 'error' && <IconAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              {status === 'loading' && <IconLoader2 className="w-5 h-5 flex-shrink-0 mt-0.5 animate-spin" />}
              <div className="flex-1 text-sm whitespace-pre-wrap">
                {message}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What happens next?
            </h3>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
              <li>Click "Grant Admin Access" above</li>
              <li>You'll be automatically redirected to /admin</li>
              <li>You can delete this page after setup</li>
            </ol>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-xs text-yellow-800 dark:text-yellow-300">
              <strong>Note:</strong> This is a one-time setup page. After granting yourself admin access, you can delete the file: <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 py-0.5 rounded">app/admin/setup/page.tsx</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
