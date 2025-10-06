'use client';

import { IconCheck, IconAlertCircle, IconX } from '@tabler/icons-react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  message?: string;
}

export function SystemHealth() {
  // In a real implementation, these would be checked via API calls
  // For now, we'll show them as operational
  const services: ServiceStatus[] = [
    {
      name: 'Convex Database',
      status: 'operational',
    },
    {
      name: 'Clerk Authentication',
      status: 'operational',
    },
    {
      name: 'OpenRouter AI',
      status: 'operational',
    },
    {
      name: 'RentCast API',
      status: 'operational',
    },
    {
      name: 'Twilio SMS',
      status: 'operational',
      message: 'Optional service',
    },
    {
      name: 'Resend Email',
      status: 'operational',
      message: 'Optional service',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        System Health
      </h3>

      <div className="space-y-3">
        {services.map((service) => {
          const { icon: Icon, color } = getStatusIcon(service.status);

          return (
            <div key={service.name} className="flex items-start gap-3">
              <Icon className={`w-5 h-5 mt-0.5 ${color}`} />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {service.name}
                </p>
                {service.message && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {service.message}
                  </p>
                )}
              </div>

              <span className={`text-xs font-medium ${getStatusTextColor(service.status)}`}>
                {getStatusText(service.status)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            All Systems
          </span>
          <span className="text-green-600 dark:text-green-400 font-medium">
            Operational
          </span>
        </div>
      </div>
    </div>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'operational':
      return {
        icon: IconCheck,
        color: 'text-green-600 dark:text-green-400',
      };
    case 'degraded':
      return {
        icon: IconAlertCircle,
        color: 'text-yellow-600 dark:text-yellow-400',
      };
    case 'down':
      return {
        icon: IconX,
        color: 'text-red-600 dark:text-red-400',
      };
    default:
      return {
        icon: IconCheck,
        color: 'text-gray-600 dark:text-gray-400',
      };
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'operational':
      return 'Operational';
    case 'degraded':
      return 'Degraded';
    case 'down':
      return 'Down';
    default:
      return 'Unknown';
  }
}

function getStatusTextColor(status: string): string {
  switch (status) {
    case 'operational':
      return 'text-green-600 dark:text-green-400';
    case 'degraded':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'down':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}
