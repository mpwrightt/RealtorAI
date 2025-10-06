'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { IconAlertTriangle } from '@tabler/icons-react';

export function MaintenanceBanner() {
  const maintenanceFlag = useQuery(api.admin.featureFlags.getFlag, { key: "maintenance_mode" });
  
  if (!maintenanceFlag) return null;
  
  return (
    <div className="bg-yellow-500 text-white px-4 py-3">
      <div className="container mx-auto flex items-center justify-center gap-2">
        <IconAlertTriangle className="w-5 h-5" />
        <p className="font-medium">
          Platform is currently in maintenance mode. Some features may be unavailable.
        </p>
      </div>
    </div>
  );
}
