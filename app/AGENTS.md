# App Directory - Agent Instructions

## Overview
This directory contains all Next.js 15 App Router routes and pages. The structure follows App Router conventions with route groups and dynamic segments.

## Directory Structure

```
app/
├── (landing)/              # Landing page route group
├── buyer/[sessionCode]/    # Buyer portal with session-based auth
├── seller/[sessionCode]/   # Seller portal with session-based auth
├── dashboard/              # Agent control center (Clerk protected)
├── api/                    # API routes
├── layout.tsx              # Root layout
├── globals.css             # Global styles
└── not-found.tsx           # 404 page
```

## Routing Conventions

### Server Components (Default)
- All components are server components unless marked with `'use client'`
- Use `async` functions to fetch data directly in components
- Access route params via props: `{ params: { id: string } }`
- Use `fetchQuery` from `convex/nextjs` to query Convex

### Client Components
- Add `'use client'` directive at the top of file
- Use React hooks (useState, useEffect, etc.)
- Use `useQuery`, `useMutation` from `convex/react` for Convex data
- Handle user interactions and browser APIs

### Dynamic Routes
- Use `[paramName]` for dynamic segments
- Access via `params` prop in page component
- Validate params before using

## Authentication Patterns

### Buyer/Seller Routes
- Session-based authentication (no user accounts)
- Verify session code in layout.tsx
- Redirect to `/` if invalid
- Example:
```typescript
const session = await verifyBuyerSession(params.sessionCode);
if (!session) redirect('/');
```

### Dashboard Routes (Agent)
- Clerk authentication required
- Check `userId` from `auth()`
- Protect in middleware or layout
- Example:
```typescript
const { userId } = await auth();
if (!userId) redirect('/sign-in');
```

## Data Fetching

### Server Components
```typescript
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export default async function Page({ params }) {
  const data = await fetchQuery(api.module.query, { id: params.id });
  return <div>{data.name}</div>;
}
```

### Client Components
```typescript
'use client';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Component() {
  const data = useQuery(api.module.query, { filter: 'active' });
  return <div>{data?.name}</div>;
}
```

## Creating New Routes

1. **Create directory structure**
   ```
   app/your-route/
   ├── page.tsx          # Main page component
   ├── layout.tsx        # Optional layout
   ├── loading.tsx       # Loading UI
   └── error.tsx         # Error boundary
   ```

2. **Add page component**
   - Default export required
   - Accept `params` and `searchParams` props
   - Use TypeScript for type safety

3. **Add metadata**
   ```typescript
   export const metadata = {
     title: 'Page Title',
     description: 'Page description',
   };
   ```

4. **Test the route**
   - Navigate to the route
   - Test with valid/invalid params
   - Check loading states
   - Verify error handling

## API Routes

### Location
- `app/api/` directory
- Each folder needs `route.ts` file

### Handlers
```typescript
export async function GET(req: Request) {
  // Handle GET request
  return Response.json({ data: 'value' });
}

export async function POST(req: Request) {
  const body = await req.json();
  // Handle POST request
  return Response.json({ success: true });
}
```

### Streaming Responses (SSE)
```typescript
export async function POST(req: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode('data: message\n\n'));
      controller.close();
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
```

## Special Files

- `layout.tsx` - Shared UI for route segment
- `page.tsx` - Unique UI for route
- `loading.tsx` - Loading UI (Suspense boundary)
- `error.tsx` - Error UI (Error boundary)
- `not-found.tsx` - 404 UI
- `route.ts` - API endpoint

## Best Practices

1. **Keep server components when possible**
   - Better performance
   - Smaller bundle size
   - Direct database access

2. **Use loading states**
   - Add loading.tsx for automatic Suspense
   - Show skeletons for better UX

3. **Handle errors gracefully**
   - Add error.tsx boundaries
   - Show user-friendly messages
   - Log errors for debugging

4. **Optimize images**
   - Always use Next.js Image component
   - Provide width/height or fill
   - Use blur placeholders

5. **Validate inputs**
   - Check params before using
   - Validate session codes
   - Return 404 for invalid data

## Common Patterns

### Protected Route
```typescript
// app/protected/layout.tsx
export default async function Layout({ children }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  return <>{children}</>;
}
```

### Session-Based Route
```typescript
// app/buyer/[sessionCode]/layout.tsx
export default async function Layout({ children, params }) {
  const session = await verifyBuyerSession(params.sessionCode);
  if (!session) redirect('/');
  return <>{children}</>;
}
```

### Data Fetching with Filters
```typescript
export default async function Page({ searchParams }) {
  const listings = await fetchQuery(api.listings.search, {
    city: searchParams.city,
    minPrice: Number(searchParams.minPrice),
  });
  return <PropertyGrid listings={listings} />;
}
```

## Troubleshooting

### Route Not Found
- Check file naming (must be lowercase)
- Verify directory structure
- Ensure `page.tsx` exists
- Check for typos in dynamic segments

### Hydration Errors
- Don't use browser APIs in server components
- Match server/client HTML exactly
- Check for mismatched tags
- Use `suppressHydrationWarning` sparingly

### Authentication Issues
- Verify Clerk middleware is configured
- Check redirect URLs
- Test in incognito mode
- Review console for errors
