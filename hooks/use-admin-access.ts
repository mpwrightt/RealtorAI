'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAdminAccess() {
  const router = useRouter();
  const access = useQuery(api.admin.auth.checkAdminAccess);

  useEffect(() => {
    if (access && !access.hasAccess) {
      router.push('/dashboard');
    }
  }, [access, router]);

  return {
    hasAccess: access?.hasAccess ?? false,
    role: access?.role ?? null,
    isLoading: access === undefined,
  };
}

export function useRequireAdmin() {
  const { hasAccess, isLoading } = useAdminAccess();
  
  return {
    isAuthorized: hasAccess,
    isLoading,
  };
}
