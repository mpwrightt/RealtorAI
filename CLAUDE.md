# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## PRIMARY WORKFLOW - READ THIS FIRST

**Before writing ANY code, you MUST:**

1. **Check AGENTS.md files first** - Start with `/AGENTS.md`, then check directory-specific ones:
   - `app/AGENTS.md` - Frontend routing and auth patterns
   - `convex/AGENTS.md` - Backend functions and schema
   - `components/AGENTS.md` - Component patterns
   - `lib/AGENTS.md` - OpenRouter AI, utilities, external APIs
   - `plan/AGENTS.md` - Implementation plan navigation

2. **Follow the implementation plan** in `plan/` folder:
   - Check `plan/README.md` for phase overview
   - Find relevant task file in phase folders
   - Follow subtasks with code examples
   - Verify acceptance criteria

3. **Match existing patterns** from AGENTS.md files

## Project Overview

**Neighborhood Deal Finder** - A Next.js 15 real estate platform enabling agents to create personalized buyer/seller portals with AI-powered property analysis.

### Tech Stack
- **Next.js 15** (App Router, Turbopack)
- **Convex** (real-time database, serverless functions)
- **OpenRouter** (AI with Claude 3.5 Sonnet)
- **Clerk** (agent authentication)
- **Session-based auth** (buyers/sellers, no login)
- **AG-UI protocol** (transparent AI interactions)
- **TailwindCSS v4 + shadcn/ui**

{{ ... }}

## Code Style Requirements

### TypeScript
- Use TypeScript for ALL files, avoid `any`
- `interface` for objects, `type` for unions
- Export types alongside functions

### React Components
- Prefer server components (default)
- Mark client with `'use client'`
- Keep focused (< 200 lines)

### File Naming
- Components: **PascalCase** (`PropertyCard.tsx`)
- Utilities: **kebab-case** (`buyer-auth.ts`)
- Convex: **camelCase** (`buyerSessions.ts`)

### Imports
- Use `@/` prefix for absolute imports
- Import types separately: `import type { ... }`

## Convex Patterns

```typescript
export const myQuery = query({
  args: { id: v.id("tableName") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

## Authentication Patterns

### Agent Routes (Clerk)
```typescript
const { userId } = await auth();
if (!userId) redirect('/sign-in');
```

### Buyer/Seller Routes (Session-based)
```typescript
const session = await verifyBuyerSession(sessionCode);
if (!session) redirect('/');
```

## Project Structure

```
/
├── AGENTS.md                    # START HERE
├── app/                         # Next.js routes
│   ├── AGENTS.md               # Routing guide
│   ├── buyer/[sessionCode]/    # Buyer portal
│   ├── seller/[sessionCode]/   # Seller portal
│   └── dashboard/              # Agent dashboard
├── convex/                      # Backend
│   ├── AGENTS.md               # Backend guide
│   └── *.ts                    # Functions & schema
├── components/                  # React components
│   ├── AGENTS.md               # Component guide
│   └── */                      # Feature components
├── lib/                         # Utilities
│   ├── AGENTS.md               # Utils guide
│   ├── openrouter/             # AI service
│   └── integrations/           # External APIs
└── plan/                        # Implementation plan
    ├── AGENTS.md               # Plan guide
    └── phase-*/                # Task files
