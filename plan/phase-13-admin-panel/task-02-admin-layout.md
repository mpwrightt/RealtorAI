# Task 02: Admin Layout & Navigation

**Phase:** 13 - Admin Panel  
**Estimated Time:** 45 minutes  
**Priority:** High

---

## Objective

Create the admin panel layout with sidebar navigation, header, and main content area.

---

## Steps

### 1. Create Admin Layout Component

Create `components/admin/admin-layout.tsx`:

```typescript
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
    name: 'Logs',
    href: '/admin/logs',
    icon: IconClipboardList,
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
```

### 2. Create Admin Root Layout

Create `app/admin/layout.tsx`:

```typescript
import { AdminLayout } from '@/components/admin/admin-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
```

### 3. Create Admin Index Page

Create `app/admin/page.tsx`:

```typescript
'use client';

import { useRequireAdmin } from '@/hooks/use-admin-access';

export default function AdminPage() {
  const { isAuthorized, isLoading } = useRequireAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Hook will redirect
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Dashboard Overview
      </h1>
      
      <p className="text-gray-600 dark:text-gray-400">
        Admin dashboard content will go here (Task 03)
      </p>
    </div>
  );
}
```

### 4. Create Placeholder Pages

Create placeholder pages for each route:

**`app/admin/agents/page.tsx`:**
```typescript
'use client';

import { useRequireAdmin } from '@/hooks/use-admin-access';

export default function AgentsPage() {
  const { isAuthorized, isLoading } = useRequireAdmin();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Agent Management</h1>
      <p className="text-gray-600">Coming in Task 06</p>
    </div>
  );
}
```

**`app/admin/analytics/page.tsx`:**
```typescript
'use client';

import { useRequireAdmin } from '@/hooks/use-admin-access';

export default function AnalyticsPage() {
  const { isAuthorized, isLoading } = useRequireAdmin();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <p className="text-gray-600">Coming in Task 13</p>
    </div>
  );
}
```

**`app/admin/revenue/page.tsx`:**
```typescript
'use client';

import { useRequireAdmin } from '@/hooks/use-admin-access';

export default function RevenuePage() {
  const { isAuthorized, isLoading } = useRequireAdmin();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Revenue Tracking</h1>
      <p className="text-gray-600">Coming in Task 11</p>
    </div>
  );
}
```

**`app/admin/system/page.tsx`:**
```typescript
'use client';

import { useRequireAdmin } from '@/hooks/use-admin-access';

export default function SystemPage() {
  const { isAuthorized, isLoading } = useRequireAdmin();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">System Settings</h1>
      <p className="text-gray-600">Coming in Task 16-19</p>
    </div>
  );
}
```

**`app/admin/logs/page.tsx`:**
```typescript
'use client';

import { useRequireAdmin } from '@/hooks/use-admin-access';

export default function LogsPage() {
  const { isAuthorized, isLoading } = useRequireAdmin();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Activity Logs</h1>
      <p className="text-gray-600">Coming in Task 09</p>
    </div>
  );
}
```

---

## Testing

1. **Test Navigation:**
   - Click each nav item
   - Verify active state highlights correctly
   - Check all routes load

2. **Test Responsive:**
   - Resize browser window
   - Verify layout doesn't break
   - Check sidebar stays fixed

3. **Test Authentication:**
   - Verify admin info displays
   - Test sign out button
   - Check redirect works

---

## Acceptance Criteria

- ✅ Admin layout renders with sidebar
- ✅ Navigation works for all routes
- ✅ Active route is highlighted
- ✅ User info displays correctly
- ✅ Sign out button works
- ✅ Breadcrumb shows current location
- ✅ Layout is responsive
- ✅ All placeholder pages load

---

## Design Notes

**Color Scheme:**
- Primary: Blue (#2563eb)
- Background: Gray-50/Gray-900
- Sidebar: White/Gray-800
- Active: Blue-50/Blue-900

**Typography:**
- Headers: Bold, large
- Body: Regular, readable
- Labels: Medium weight

---

## Next Steps

After completing this task:
- ✅ Admin layout is complete
- ✅ Navigation is functional
- ➡️ Proceed to Task 03: Dashboard Overview
