'use client';

import { useState } from 'react';
import * as React from 'react';
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
  const [targetEmail, setTargetEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [myRole, setMyRole] = useState<any>(null);
  
  const setAdminRole = useMutation(api.admin.setup.setAdminRole);
  const checkMyRole = useMutation(api.admin.setup.checkMyRole);

  // Check role on mount
  React.useEffect(() => {
    const checkRole = async () => {
      try {
        const result = await checkMyRole({});
        console.log('Role check result:', result);
        setMyRole(result);
        // If user is already admin, show email input
        if (result.role === 'admin') {
          setShowEmailInput(true);
        }
      } catch (error) {
        console.error('Error checking role:', error);
      }
    };
    checkRole();
  }, [checkMyRole]);

  // Don't render admin layout on this page
  if (typeof window !== 'undefined') {
    document.body.style.overflow = 'auto';
  }

  const handleGrantAdmin = async () => {
    // Determine which email to grant admin to
    const emailToGrant = showEmailInput && targetEmail 
      ? targetEmail 
      : user?.primaryEmailAddress?.emailAddress;

    if (!emailToGrant) {
      setStatus('error');
      setMessage('Please enter an email address.');
      return;
    }

    setStatus('loading');
    setMessage('Requesting admin access...');

    try {
      const result = await setAdminRole({ 
        email: emailToGrant 
      });
      
      setStatus('success');
      
      // If granting to self
      if (emailToGrant === user?.primaryEmailAddress?.emailAddress) {
        setMessage(`Success! Admin role granted to ${emailToGrant}${result.isFirstAdmin ? ' (First Admin)' : ''}\n\nIMPORTANT: Please sign out and sign back in for changes to take effect, then visit /admin`);
        // Don't auto-redirect - user needs to refresh their auth token
      } else {
        // If granting to someone else
        setMessage(`Success! Admin role granted to ${emailToGrant}. They can now access /admin.`);
        setTargetEmail('');
      }
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
            Admin Access Request
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Request admin access to the platform
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
            {myRole?.role === 'admin' && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                ✓ Admin
              </p>
            )}
          </div>

          {/* Email Input (only for admins) */}
          {showEmailInput && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Grant admin access to:
              </label>
              <input
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty to grant to yourself ({user?.primaryEmailAddress?.emailAddress})
              </p>
            </div>
          )}

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
              How it works:
            </h3>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
              <li><strong>First-time setup:</strong> If no admins exist, you can grant yourself access</li>
              <li><strong>After setup:</strong> Only existing admins can grant access to others</li>
              <li>Once successful, you'll be redirected to /admin</li>
            </ol>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              <strong>🔒 Security:</strong> This page is protected. After the first admin is created, only existing admins can grant admin access to others.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
