'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  IconDashboard,
  IconUsers,
  IconChartBar,
  IconCurrencyDollar,
  IconSettings,
  IconClipboardList,
  IconLogout,
  IconSparkles,
  IconActivity,
} from '@tabler/icons-react';
import { SignOutButton } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  {
    name: 'Overview',
    href: '/admin',
    icon: IconDashboard,
  },
  {
    name: 'Agents',
    href: '/admin/agents',
    icon: IconUsers,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: IconChartBar,
  },
  {
    name: 'Revenue',
    href: '/admin/revenue',
    icon: IconCurrencyDollar,
  },
  {
    name: 'System',
    href: '/admin/system',
    icon: IconSettings,
  },
  {
    name: 'Monitoring',
    href: '/admin/monitoring',
    icon: IconActivity,
  },
  {
    name: 'Logs',
    href: '/admin/logs',
    icon: IconClipboardList,
  },
  {
    name: 'Demo Mode',
    href: '/admin/demo',
    icon: IconSparkles,
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const admin = useQuery(api.admin.auth.getCurrentAdmin);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Admin Panel
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {admin?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {admin?.name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {admin?.email}
              </p>
            </div>
          </div>
          
          <SignOutButton>
            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <IconLogout className="w-4 h-4" />
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/admin" className="hover:text-gray-700 dark:hover:text-gray-300">
              Admin
            </Link>
            {pathname !== '/admin' && (
              <>
                <span>/</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {navigation.find(item => pathname.startsWith(item.href))?.name || 'Page'}
                </span>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
