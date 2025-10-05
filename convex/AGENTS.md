# Convex Directory - Agent Instructions

## Overview
This directory contains all Convex backend functions, schema definitions, and webhooks. Convex provides real-time database and serverless functions.

## File Structure

```
convex/
├── schema.ts                # Database schema definition
├── agents.ts                # Agent management functions
├── listings.ts              # Property listing CRUD
├── buyerSessions.ts         # Buyer session management
├── sellerSessions.ts        # Seller session management
├── offers.ts                # Offer management
├── telemetry.ts             # Analytics tracking
├── agentInteractions.ts     # AI conversation logs
├── savedSearches.ts         # Saved search management
├── http.ts                  # Webhook handlers
├── _generated/              # Auto-generated types (don't edit)
└── utils.ts                 # Utility functions
```

## Function Types

### Queries (Read Data)
- Pure functions that read from database
- Automatically cached and reactive
- Use for data fetching

```typescript
export const getById = query({
  args: { id: v.id("tableName") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

### Mutations (Write Data)
- Transactional writes to database
- Use for creating, updating, deleting
- Changes trigger reactive updates

```typescript
export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("tableName", {
      name: args.name,
      createdAt: Date.now(),
    });
    return id;
  },
});
```

### Actions (External Calls)
- Call external APIs
- Not transactional
- Can call queries and mutations via `ctx.runQuery`/`ctx.runMutation`

```typescript
export const enrichData = action({
  args: { id: v.id("listings") },
  handler: async (ctx, args) => {
    // Call external API
    const data = await fetch('https://api.example.com/data');
    
    // Update database
    await ctx.runMutation(api.listings.update, {
      id: args.id,
      enrichedData: data,
    });
  },
});
```

## Schema Definition

### Defining Tables
```typescript
export default defineSchema({
  tableName: defineTable({
    field1: v.string(),
    field2: v.number(),
    field3: v.optional(v.string()),
    nestedObject: v.object({
      key: v.string(),
    }),
    arrayField: v.array(v.string()),
  })
    .index("byField1", ["field1"])
    .index("byField2", ["field2"]),
});
```

### Field Types
- `v.string()` - String
- `v.number()` - Number
- `v.boolean()` - Boolean
- `v.id("tableName")` - Foreign key reference
- `v.optional(type)` - Optional field
- `v.array(type)` - Array
- `v.object({ ... })` - Nested object
- `v.any()` - Any type (use sparingly)

### Indexes
- Required for efficient queries
- Define in schema: `.index("indexName", ["field1", "field2"])`
- Use in queries: `.withIndex("indexName", q => q.eq("field1", value))`

## Common Patterns

### CRUD Operations
```typescript
// Create
export const create = mutation({
  args: { ...fieldValidators },
  handler: async (ctx, args) => {
    return await ctx.db.insert("table", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Read
export const get = query({
  args: { id: v.id("table") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update
export const update = mutation({
  args: { id: v.id("table"), ...updateFields },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Delete
export const remove = mutation({
  args: { id: v.id("table") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
```

### Queries with Filters
```typescript
export const searchListings = query({
  args: {
    city: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("listings");
    
    // Use index if available
    if (args.city) {
      query = query.withIndex("byCity", q => q.eq("city", args.city));
    }
    
    const results = await query.collect();
    
    // Apply additional filters
    return results.filter(listing => {
      if (args.minPrice && listing.price < args.minPrice) return false;
      if (args.maxPrice && listing.price > args.maxPrice) return false;
      return true;
    });
  },
});
```

### Relationships
```typescript
// Get related data
export const getListingWithAgent = query({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    if (!listing) return null;
    
    const agent = await ctx.db.get(listing.agentId);
    
    return { ...listing, agent };
  },
});
```

### Pagination
```typescript
export const listPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tableName")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

## Authentication

### Accessing User Identity
```typescript
export const getUserData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    // identity.subject contains Clerk user ID
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", q => q.eq("externalId", identity.subject))
      .first();
    
    return user;
  },
});
```

### Authorization
```typescript
export const updateListing = mutation({
  args: { id: v.id("listings"), updates: v.object({}) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    const listing = await ctx.db.get(args.id);
    const agent = await ctx.db
      .query("agents")
      .withIndex("byUserId", q => q.eq("userId", identity.subject))
      .first();
    
    // Verify ownership
    if (listing.agentId !== agent?._id) {
      throw new Error("Forbidden");
    }
    
    await ctx.db.patch(args.id, args.updates);
  },
});
```

## Webhooks (HTTP Routes)

### Location
`convex/http.ts`

### Pattern
```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/webhook-endpoint",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Verify webhook signature
    const signature = request.headers.get("webhook-signature");
    // ... verify signature
    
    const payload = await request.json();
    
    // Process webhook
    await ctx.runMutation(api.module.function, { data: payload });
    
    return new Response(null, { status: 200 });
  }),
});

export default http;
```

## Testing Functions

### In Convex Dashboard
1. Navigate to Functions tab
2. Select function to test
3. Enter arguments as JSON
4. Click "Run" to execute
5. View results and logs

### In Code
```typescript
// Test in development
npx convex run module:functionName '{"arg": "value"}'
```

## Best Practices

1. **Always validate inputs**
   ```typescript
   args: { 
     email: v.string(),
     age: v.number(),
   }
   ```

2. **Use indexes for queries**
   - Define indexes in schema
   - Query by indexed fields
   - Avoid full table scans

3. **Keep functions focused**
   - One responsibility per function
   - Compose larger operations from smaller functions

4. **Handle errors gracefully**
   ```typescript
   if (!data) throw new Error("Not found");
   ```

5. **Use timestamps**
   ```typescript
   createdAt: Date.now(),
   updatedAt: Date.now(),
   ```

6. **Avoid deeply nested objects**
   - Flatten when possible
   - Use separate tables for complex relationships

## Common Issues

### Schema Deployment Fails
- Check for TypeScript errors
- Verify all table definitions
- Ensure indexes reference valid fields
- Clear `.convex/` cache if needed

### Query Performance
- Add appropriate indexes
- Limit result sets
- Use pagination for large datasets
- Check query execution time in dashboard

### Function Not Found
- Ensure function is exported
- Check function name matches import
- Verify `_generated/api.js` is up to date
- Restart `convex dev`

## Deployment

### To Production
```bash
npx convex deploy --prod
```

### Environment Variables
- Set in Convex dashboard
- Access via `process.env.VARIABLE_NAME`
- Use for API keys, secrets

## Useful Commands

```bash
# Start development
npx convex dev

# Deploy to production
npx convex deploy --prod

# Run function
npx convex run module:function '{"arg": "value"}'

# View logs
npx convex logs

# Clear data (dev only)
npx convex data clear
```
