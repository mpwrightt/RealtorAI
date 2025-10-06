'use client';

import { ReactNode } from 'react';
import { IconTrendingUp, IconTrendingDown, IconMinus } from '@tabler/icons-react';

interface EnhancedMetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  sparklineData?: number[];
  loading?: boolean;
}

export function EnhancedMetricCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  variant = 'default',
  sparklineData,
  loading = false,
}: EnhancedMetricCardProps) {
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10';
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10';
      case 'danger':
        return 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10';
      case 'info':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10';
      default:
        return 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return <IconTrendingUp className="w-4 h-4" />;
      case 'down':
        return <IconTrendingDown className="w-4 h-4" />;
      default:
        return <IconMinus className="w-4 h-4" />;
    }
  };

  const getTrendStyles = () => {
    if (!trend) return '';
    switch (trend.direction) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className={`rounded-lg border p-6 ${getVariantStyles()} animate-pulse`}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-6 transition-all hover:shadow-md ${getVariantStyles()}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </h3>
        <div className="text-gray-600 dark:text-gray-400">
          {icon}
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${getTrendStyles()}`}>
            {getTrendIcon()}
            <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">
              {trend.label}
            </span>
          </div>
        )}
        
        {subtitle && !trend && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
        
        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-4">
            <MiniSparkline data={sparklineData} />
          </div>
        )}
      </div>
    </div>
  );
}

// Simple sparkline component
function MiniSparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg
      className="w-full h-12"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={points}
        className="text-blue-600 dark:text-blue-400"
      />
    </svg>
  );
}
