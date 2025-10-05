# Neighborhood Deal Finder - Agent Instructions

## Project Overview

This is a Next.js 15 real estate platform with Convex backend, OpenRouter AI integration, and AG-UI protocol for transparent agent interactions. The project enables real estate agents to create personalized buyer and seller portals with AI-powered property analysis.

**Key Technologies:**
- Next.js 15 (App Router)
- Convex (real-time database and serverless functions)
- OpenRouter (AI model routing with Claude 3.5 Sonnet)
- Clerk (authentication)
- TailwindCSS v4 + shadcn/ui

## Dev Environment Tips

- Use `npm run dev` to start the development server with Turbopack
- Run `npx convex dev` in a separate terminal for real-time database sync
- Check `plan/` folder for detailed implementation tasks organized by phase
- Environment variables go in `.env.local` (copy from `.env.example`)
- All Convex functions are in `convex/` directory
- Frontend routes use Next.js App Router structure in `app/`

## Project Structure

```
app/
  ├── buyer/[sessionCode]/     # Buyer portal (session-based auth)
  ├── seller/[sessionCode]/    # Seller portal (session-based auth)
  ├── dashboard/               # Agent control center (Clerk auth)
  └── api/                     # API routes (chat, webhooks)
convex/
  ├── schema.ts                # Database schema
  ├── agents.ts                # Agent management functions
  ├── listings.ts              # Property listing CRUD
  ├── buyerSessions.ts         # Buyer session management
  ├── sellerSessions.ts        # Seller session management
  ├── offers.ts                # Offer management
  └── http.ts                  # Webhook handlers
lib/
  ├── openrouter/              # OpenRouter AI service layer
  ├── integrations/            # External APIs (MLS, Mapbox, etc.)
  └── buyer-auth.ts            # Session verification helpers
components/
  ├── buyer/                   # Buyer portal components
  ├── seller/                  # Seller portal components
  ├── dashboard/               # Agent dashboard components
  ├── ag-ui/                   # AG-UI protocol components
  └── ui/                      # shadcn/ui components
plan/                          # Detailed implementation plan
```

## Build and Test Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests (when implemented)
- `npx convex dev` - Start Convex development sync
- `npx convex deploy --prod` - Deploy Convex to production

## Code Style Guidelines

### TypeScript
- Use TypeScript for all files (`.ts`, `.tsx`)
- Define proper types, avoid `any` unless absolutely necessary
- Use `interface` for object shapes, `type` for unions/intersections
- Export types alongside functions when needed

### React Components
- Use functional components with hooks
- Prefer server components (default in App Router) unless client interactivity needed
- Mark client components with `'use client'` at the top
- Keep components small and focused (< 200 lines)
- Use `async/await` for server components that fetch data

### File Naming
- Components: PascalCase (e.g., `PropertyCard.tsx`)
- Utilities: kebab-case (e.g., `buyer-auth.ts`)
- API routes: lowercase (e.g., `route.ts`)
- Convex functions: camelCase files (e.g., `buyerSessions.ts`)

### Imports
- Use absolute imports with `@/` prefix (configured in `tsconfig.json`)
- Group imports: React/Next, third-party, local components, utilities
- Import types separately when possible: `import type { ... }`

### Component Structure
```typescript
// 1. Imports
import { ComponentProps } from '@/types';

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
}

// 3. Component
export default function MyComponent({ title }: MyComponentProps) {
  // 4. Hooks
  // 5. Handlers
  // 6. Render
  return <div>{title}</div>;
}
```

## Convex Best Practices

### Queries and Mutations
- Queries for reading data (pure, cacheable)
- Mutations for writing data (transactional)
- Actions for external API calls (not transactional)
- Always validate input with `v` validators from `convex/values`

### Example Pattern
```typescript
export const myQuery = query({
  args: { id: v.id("tableName") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const myMutation = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tableName", { name: args.name });
  },
});
```

### Indexes
- Use indexes defined in `schema.ts` for efficient queries
- Query by indexed fields: `ctx.db.query("table").withIndex("byField", q => q.eq("field", value))`

## OpenRouter AI Integration

### Location
- Main service: `lib/openrouter/`
- Client wrapper: `lib/openrouter/client.ts`
- Agent classes: `lib/openrouter/real-estate-agent.ts`
- Tool definitions: `lib/openrouter/tools.ts`

### Using OpenRouter
```typescript
import { RealEstateAgent } from '@/lib/openrouter/real-estate-agent';

const agent = new RealEstateAgent();
const response = await agent.analyzeProperty(listingData);
```

### Streaming Responses
- Use `streamChat()` for real-time responses
- Implement Server-Sent Events (SSE) in API routes
- Format as AG-UI events for transparency

## Testing Instructions

### Unit Tests (when implemented)
- Test Convex functions in isolation
- Test utility functions
- Test component logic
- Run with `npm test`

### Integration Tests
- Test complete user flows
- Test API endpoints
- Test Convex query/mutation chains

### E2E Tests (Playwright)
- Test critical user journeys
- Test buyer portal flow
- Test seller portal flow
- Test agent dashboard
- Run with `npx playwright test`

### Manual Testing
- Test with real session codes
- Verify authentication flows
- Test AI chat responses
- Verify data enrichment
- Check mobile responsiveness

## Authentication Patterns

### Agent Authentication (Clerk)
- Protected routes use `auth()` from `@clerk/nextjs/server`
- Check `userId` in server components
- Use middleware for route protection

### Buyer/Seller Authentication (Session Codes)
- No user accounts required
- Verify session code in `layout.tsx`
- Use helper: `verifyBuyerSession(sessionCode)` or `verifySellerSession(sessionCode)`
- Redirect to `/` if invalid

## Database Schema

### Core Tables
- `users` - Clerk synced users
- `agents` - Real estate agent profiles
- `listings` - Property listings
- `buyerSessions` - Buyer portal sessions
- `sellerSessions` - Seller portal sessions
- `offers` - Purchase offers
- `propertyViews` - Analytics telemetry
- `agentInteractions` - AI conversation logs
- `savedSearches` - Saved search criteria

### Relationships
- `agents` → `users` (one-to-one)
- `listings` → `agents` (many-to-one)
- `buyerSessions` → `agents` (many-to-one)
- `sellerSessions` → `listings` (one-to-one)
- `offers` → `listings` + `buyerSessions`

## Common Patterns

### Server Component Data Fetching
```typescript
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export default async function Page() {
  const data = await fetchQuery(api.module.functionName, { args });
  return <div>{data}</div>;
}
```

### Client Component with Convex
```typescript
'use client';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Component() {
  const data = useQuery(api.module.query);
  const mutate = useMutation(api.module.mutation);
  
  return <button onClick={() => mutate({ args })}>Click</button>;
}
```

### Dynamic Route with Validation
```typescript
export default async function Page({ params }: { params: { id: string } }) {
  const data = await fetchQuery(api.module.get, { id: params.id as Id<"table"> });
  if (!data) notFound();
  return <div>{data.name}</div>;
}
```

## Environment Variables

### Required for Development
```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=

# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# OpenRouter
OPENROUTER_API_KEY=
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_SITE_NAME=Neighborhood Deal Finder

# External APIs (optional for development)
MAPBOX_ACCESS_TOKEN=
MLS_API_KEY=
```

### Security Notes
- Never commit `.env.local`
- Keep API keys server-side only
- Use `NEXT_PUBLIC_` prefix only for client-safe values
- Verify webhook signatures from Clerk

## AG-UI Protocol

### Event Types
- `message` - User/assistant messages
- `content` - Streaming text chunks
- `tool_call` - AI requesting tool execution
- `tool_result` - Tool execution results
- `state_update` - Session state changes
- `done` - Completion signal

### Implementation
- SSE endpoint: `app/api/ag-ui/stream/route.ts`
- Client hook: `hooks/use-ag-ui-stream.ts`
- Transcript component: `components/ag-ui/transcript.tsx`

## Deployment

### Vercel
- Connect GitHub repo
- Add all environment variables
- Deploy automatically on push to main

### Convex
- Run `npx convex deploy --prod`
- Set environment variables in Convex dashboard
- Update webhook URLs in Clerk

## Error Handling

- Use try/catch in async functions
- Return error responses with proper status codes
- Log errors to Sentry (when configured)
- Show user-friendly error messages
- Add error boundaries in React components

## Performance Considerations

- Use Next.js Image component for all images
- Implement loading states and skeletons
- Use dynamic imports for heavy components
- Optimize bundle size (check with bundle analyzer)
- Cache API responses when appropriate
- Use Convex query caching effectively

## Security Checklist

- Validate all inputs in Convex functions
- Verify session codes before granting access
- Check authentication in protected routes
- Validate webhook signatures
- Never expose API keys in client code
- Implement rate limiting on API routes
- Use HTTPS in production
- Set security headers (see `next.config.ts`)

## Common Tasks

### Adding a New Route
1. Create file in `app/` directory
2. Add layout if needed
3. Fetch data with Convex
4. Add navigation links
5. Test authentication

### Adding a New Convex Function
1. Add to appropriate file in `convex/`
2. Define with `query`, `mutation`, or `action`
3. Add input validation with `v.*`
4. Implement handler
5. Export function
6. Use in frontend with `useQuery` or `useMutation`

### Adding a New Component
1. Create in appropriate `components/` subfolder
2. Define props interface
3. Implement component
4. Export as default
5. Add to parent component

### Adding AI Tool
1. Define schema in `lib/openrouter/tools.ts`
2. Implement handler in `lib/openrouter/tool-handlers.ts`
3. Add to tool array
4. Test with sample queries

## Troubleshooting

### Convex Connection Issues
- Check `npx convex dev` is running
- Verify environment variables
- Clear `.convex/` cache
- Restart both servers

### Build Errors
- Check TypeScript errors: `npm run build`
- Verify imports are correct
- Check for missing dependencies
- Clear `.next/` cache

### Authentication Issues
- Verify Clerk keys
- Check JWT template exists
- Test in incognito mode
- Review middleware configuration

## Documentation

- Main README: `/README.md`
- Implementation plan: `/plan/`
- Quick start guide: `/plan/QUICK-START.md`
- Project overview: `/plan/PROJECT-OVERVIEW.md`
- Schema docs: `/convex/SCHEMA.md` (when created)

## Support

- Check detailed task files in `/plan/` folders
- Review code examples in task subtasks
- Consult external docs (Next.js, Convex, OpenRouter)
- Test incrementally and often
