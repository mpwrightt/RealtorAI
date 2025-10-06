import { formatDistanceToNow } from 'date-fns';
import { 
  IconUserPlus, 
  IconFolderPlus, 
  IconCurrencyDollar,
  IconFileText,
  IconAlertCircle,
} from '@tabler/icons-react';

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'success';
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No recent activity
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Activity
      </h3>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = getIcon(activity.type);
          const colorClass = getSeverityColor(activity.severity);

          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${colorClass.bg}`}>
                <Icon className={`w-4 h-4 ${colorClass.text}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getIcon(type: string) {
  switch (type) {
    case 'agent_signup':
      return IconUserPlus;
    case 'buyer_portal_created':
    case 'seller_portal_created':
      return IconFolderPlus;
    case 'offer_submitted':
      return IconCurrencyDollar;
    case 'payment':
      return IconCurrencyDollar;
    default:
      return IconFileText;
  }
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'success':
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-600 dark:text-green-400',
      };
    case 'warning':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-600 dark:text-yellow-400',
      };
    case 'info':
    default:
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
      };
  }
}
