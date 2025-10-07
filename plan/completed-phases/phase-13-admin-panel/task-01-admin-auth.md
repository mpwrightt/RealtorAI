# Task 01: Admin Authentication Setup

**Phase:** 13 - Admin Panel  
**Estimated Time:** 30 minutes  
**Priority:** High (required first)

---

## Objective

Set up admin role authentication and route protection to ensure only authorized users can access the admin panel.

---

## Steps

### 1. Update Database Schema

Edit `convex/schema.ts`:

```typescript
// Add to agents table
agents: defineTable({
  // ... existing fields
  
  // Admin fields
  role: v.optional(v.union(
    v.literal("agent"),
    v.literal("admin"),
    v.literal("support")
  )),
  isActive: v.boolean(),
  
  // Subscription fields
  plan: v.optional(v.union(
    v.literal("starter"),
    v.literal("professional"),
    v.literal("enterprise"),
    v.literal("trial")
  )),
  planStartDate: v.optional(v.number()),
  trialEndDate: v.optional(v.number()),
  subscriptionStatus: v.optional(v.union(
    v.literal("active"),
    v.literal("paused"),
    v.literal("cancelled"),
    v.literal("trial")
  )),
})
```

### 2. Create Admin Verification Helper

Create `convex/lib/adminAuth.ts`:

```typescript
import { QueryCtx, MutationCtx } from "../_generated/server";

export async function verifyAdmin(ctx: QueryCtx | MutationCtx): Promise<{
  userId: string;
  email: string;
  role: string;
}> {
  const identity = await ctx.auth.getUserIdentity();
  
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const agent = await ctx.db
    .query("agents")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!agent) {
    throw new Error("Agent not found");
  }

  if (agent.role !== "admin" && agent.role !== "support") {
    throw new Error("Admin access required");
  }

  return {
    userId: agent._id,
    email: agent.email,
    role: agent.role || "agent",
  };
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const admin = await verifyAdmin(ctx);
  if (admin.role !== "admin") {
    throw new Error("Full admin access required");
  }
  return admin;
}
```

### 3. Create Admin Auth Query

Create `convex/admin/auth.ts`:

```typescript
import { query } from "../_generated/server";
import { verifyAdmin } from "../lib/adminAuth";

export const checkAdminAccess = query({
  args: {},
  handler: async (ctx) => {
    try {
      const admin = await verifyAdmin(ctx);
      return {
        hasAccess: true,
        role: admin.role,
        email: admin.email,
      };
    } catch (error) {
      return {
        hasAccess: false,
        role: null,
        email: null,
      };
    }
  },
});

export const getCurrentAdmin = query({
  args: {},
  handler: async (ctx) => {
    const admin = await verifyAdmin(ctx);
    
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_clerkId", (q) => 
        q.eq("clerkId", (await ctx.auth.getUserIdentity())!.subject)
      )
      .first();

    return {
      id: admin.userId,
      email: admin.email,
      role: admin.role,
      name: agent?.agencyName || agent?.email,
    };
  },
});
```

### 4. Protect Admin Routes

Update `middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/buyer/(.*)',
  '/seller/(.*)',
]);

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
  
  // Admin routes require authentication (role check done in component)
  if (isAdminRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### 5. Create Admin Access Hook

Create `hooks/use-admin-access.ts`:

```typescript
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
```

### 6. Manually Set Admin Role (One-Time)

Create a script or use Convex dashboard to set yourself as admin:

```typescript
// In Convex dashboard, run this mutation once:
// Or create a temporary migration function

export const setAdminRole = mutation({
  args: { 
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    
    if (!agent) {
      throw new Error("Agent not found");
    }
    
    await ctx.db.patch(agent._id, {
      role: "admin",
      isActive: true,
    });
    
    return { success: true };
  },
});
```

---

## Testing

1. **Test Admin Access:**
   - Log in with admin account
   - Verify you can access `/admin`
   - Check admin query returns correct data

2. **Test Non-Admin Blocked:**
   - Log in with regular agent account
   - Try to access `/admin`
   - Should redirect to `/dashboard`

3. **Test Unauthenticated:**
   - Log out
   - Try to access `/admin`
   - Should redirect to sign-in

---

## Acceptance Criteria

- ✅ Database schema includes admin role fields
- ✅ Admin verification helper works correctly
- ✅ Admin routes are protected
- ✅ Admin access hook redirects non-admins
- ✅ Can manually set admin role via Convex
- ✅ All tests pass

---

## Code Example

**Test your admin access:**

```typescript
// In a page component
'use client';

import { useRequireAdmin } from '@/hooks/use-admin-access';

export default function AdminPage() {
  const { isAuthorized, isLoading } = useRequireAdmin();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthorized) {
    return null; // Hook will redirect
  }
  
  return <div>Admin Panel</div>;
}
```

---

## Next Steps

After completing this task:
- ✅ Admin authentication is set up
- ➡️ Proceed to Task 02: Admin Layout & Navigation
