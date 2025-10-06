import { LucideIcon } from 'lucide-react';
import { IconTrendingUp, IconTrendingDown, IconMinus } from '@tabler/icons-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: string;
  changeLabel?: string;
  icon: LucideIcon | any;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'number' | 'currency' | 'percentage';
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  trend = 'neutral',
  format = 'number',
}: MetricCardProps) {
  const formattedValue = formatValue(value, format);

  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  const TrendIcon = trend === 'up' ? IconTrendingUp : trend === 'down' ? IconTrendingDown : IconMinus;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </h3>
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {formattedValue}
        </p>

        {change && (
          <div className="flex items-center gap-2 text-sm">
            <div className={`flex items-center gap-1 ${trendColors[trend]}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="font-medium">{change}</span>
            </div>
            {changeLabel && (
              <span className="text-gray-500 dark:text-gray-400">
                {changeLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatValue(value: number | string, format: string): string {
  if (typeof value === 'string') return value;

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(value);
    case 'percentage':
      return `${value}%`;
    case 'number':
    default:
      return value.toLocaleString();
  }
}
