# Troubleshooting Guide

## Common Issues and Solutions

### 1. TypeScript Errors About Missing Convex Functions

**Error:**
```
Property 'buyerSessions' does not exist on type...
Property 'listings' does not exist on type...
```

**Solution:**
You need to run Convex to generate the API types:
```bash
npx convex dev
```

This will:
- Sync your schema with Convex
- Generate TypeScript types in `convex/_generated/`
- Enable all backend functions

### 2. Module Not Found Errors

**Error:**
```
Can't resolve '@/components/ui/progress'
```

**Solution:**
All UI components are now created. If you see this error for any component:
1. Check if the component exists in `components/ui/`
2. Install missing Radix UI dependency:
```bash
npm install @radix-ui/react-progress
# or whichever component is missing
```

### 3. Clerk Authentication Errors

**Error:**
```
Invalid publishableKey
```

**Solution:**
1. Get your Clerk keys from https://dashboard.clerk.com
2. Update `.env.local`:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_real_key
CLERK_SECRET_KEY=sk_test_your_real_key
```

**Error:**
```
ArgumentValidationError: Value does not match validator
Path: .userId
Validator: v.id("users")
```

**Solution:**
This is now fixed! The code automatically creates user records in Convex when you sign in with Clerk. Just refresh the page after signing in.

### 4. OpenRouter API Errors

**Error:**
```
OpenRouter API key not set
```

**Solution:**
1. Get your API key from https://openrouter.ai/keys
2. Update `.env.local`:
```bash
OPENROUTER_API_KEY=sk-or-v1-your_real_key
```

### 5. Build Errors

**Error:**
```
Build failed
```

**Solution:**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### 6. Port Already in Use

**Error:**
```
Port 3000 is already in use
```

**Solution:**
```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### 7. Convex Connection Issues

**Error:**
```
Failed to connect to Convex
```

**Solution:**
1. Make sure `npx convex dev` is running
2. Check your `CONVEX_DEPLOYMENT` in `.env.local`
3. Restart both servers:
```bash
# Terminal 1
npm run dev

# Terminal 2
npx convex dev
```

### 8. Session Code Not Working

**Problem:**
Buyer/seller portal shows "Session not found"

**Solution:**
1. Make sure Convex is running (`npx convex dev`)
2. Create a session through the agent dashboard first
3. Use the exact session code generated
4. Check that the session is marked as `active: true`

## Development Workflow

### Starting Fresh Each Day

```bash
# Terminal 1 - Start Next.js
cd /path/to/project
npm run dev

# Terminal 2 - Start Convex
cd /path/to/project
npx convex dev
```

### Making Schema Changes

1. Edit `convex/schema.ts`
2. Save the file
3. Convex will automatically sync and regenerate types
4. TypeScript errors should resolve automatically

### Adding New UI Components

1. Check if component exists in `components/ui/`
2. If not, create it following shadcn/ui patterns
3. Install required Radix UI dependency
4. Import and use in your components

## Quick Checks

### Verify Environment

```bash
# Check all required env variables are set
cat .env.local | grep -E "(CONVEX|CLERK|OPENROUTER)"
```

### Verify Dependencies

```bash
# Make sure all packages are installed
npm install

# Check for specific packages
npm list openai axios nanoid
```

### Verify TypeScript

```bash
# Check for TypeScript errors
npx tsc --noEmit
```

### Verify Convex Schema

```bash
# In the terminal where convex dev is running
# Look for: "✓ Schema updated successfully"
```

## Testing Tips

### Test Buyer Portal
1. Go to `/dashboard` and sign in as agent
2. Create a new buyer session
3. Copy the session code
4. Open `/buyer/[sessionCode]` in new tab
5. Should see buyer dashboard

### Test Seller Portal
1. Create a listing in agent dashboard
2. Create a seller session linked to that listing
3. Copy the session code
4. Open `/seller/[sessionCode]` in new tab
5. Should see analytics dashboard

### Test AI Features
1. Make sure `OPENROUTER_API_KEY` is set
2. Go to a property detail page
3. Use the AI chat widget
4. Type a question about the property
5. Should get a response (currently shows mock response)

## Performance Tips

### Slow Page Loads
- Check Convex connection (should be instant with subscriptions)
- Clear `.next` cache: `rm -rf .next`
- Check network tab for slow API calls

### TypeScript Slow
- Restart TypeScript server in VS Code: Cmd+Shift+P > "TypeScript: Restart TS Server"
- Check for circular dependencies
- Ensure `convex/_generated` types are up to date

## Getting Help

### Useful Commands

```bash
# Check what's running on ports
lsof -i :3000
lsof -i :3001

# View Convex logs
# (automatically shown in terminal where convex dev runs)

# View Next.js logs
# (automatically shown in terminal where npm run dev runs)

# Check package versions
npm list --depth=0
```

### Debug Mode

Add to your component:
```typescript
console.log('Debug:', { variable, anotherVariable });
```

Check browser console (F12) or terminal output.

### Logs Location
- **Next.js:** Terminal where `npm run dev` runs
- **Convex:** Terminal where `npx convex dev` runs
- **Browser:** Developer Console (F12)

## Still Having Issues?

1. Check the error message carefully
2. Look in the specific file mentioned in the error
3. Check this troubleshooting guide
4. Review the BUILD_SUMMARY.md for architecture details
5. Check PROGRESS.md for what was built and how

## Common Quick Fixes

```bash
# Nuclear option - reset everything
rm -rf node_modules package-lock.json .next
npm install
npm run dev
# (In another terminal) npx convex dev
```

This should resolve 90% of issues!
