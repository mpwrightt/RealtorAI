'use client';

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
    subscriptions: number;
  }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
  const maxSubs = Math.max(...data.map(d => d.subscriptions), 1);

  return (
    <div className="space-y-6">
      {/* Revenue Chart */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Revenue Over Time
        </h3>
        <div className="h-64 flex items-end gap-1">
          {data.map((point, i) => {
            const height = (point.revenue / maxRevenue) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full">
                  <div
                    className="w-full bg-blue-500 hover:bg-blue-600 transition-colors rounded-t"
                    style={{ height: `${Math.max(height, 2)}px` }}
                    title={`$${point.revenue.toFixed(2)}`}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    ${point.revenue.toFixed(2)}
                  </div>
                </div>
                {i % Math.ceil(data.length / 10) === 0 && (
                  <span className="text-xs text-gray-500 mt-2 -rotate-45 origin-top-left">
                    {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscriptions Chart */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          New Subscriptions
        </h3>
        <div className="h-32 flex items-end gap-1">
          {data.map((point, i) => {
            const height = (point.subscriptions / maxSubs) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full">
                  <div
                    className="w-full bg-green-500 hover:bg-green-600 transition-colors rounded-t"
                    style={{ height: `${Math.max(height * 1.2, 2)}px` }}
                    title={`${point.subscriptions} subs`}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {point.subscriptions} new
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
