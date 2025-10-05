# Task 8.1: Production Environment Setup

**Phase:** 8 - Deployment  
**Estimated Time:** 4-6 hours  
**Priority:** Critical  
**Dependencies:** All previous phases completed

## Overview
Set up production environment with proper security, monitoring, and deployment configurations.

## Subtasks

### 8.1.1 Configure Production Environment Variables

**Vercel Environment Variables:**
- [ ] Set all required variables in Vercel dashboard:
  ```bash
  # Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
  CLERK_SECRET_KEY=
  NEXT_PUBLIC_CLERK_FRONTEND_API_URL=
  
  # Convex
  CONVEX_DEPLOYMENT=
  NEXT_PUBLIC_CONVEX_URL=
  
  # OpenRouter
  OPENROUTER_API_KEY=
  OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
  OPENROUTER_SITE_URL=https://your-production-domain.com
  OPENROUTER_SITE_NAME=Neighborhood Deal Finder
  
  # External APIs
  MLS_API_KEY=
  MLS_API_URL=
  MAPBOX_ACCESS_TOKEN=
  WALKSCORE_API_KEY=
  GREATSCHOOLS_API_KEY=
  ```

**Convex Production Environment:**
- [ ] Set production variables in Convex dashboard:
  ```bash
  CLERK_WEBHOOK_SECRET=
  NEXT_PUBLIC_CLERK_FRONTEND_API_URL=
  OPENROUTER_API_KEY=
  MLS_API_KEY=
  MAPBOX_ACCESS_TOKEN=
  ```

### 8.1.2 Configure Clerk Production

- [ ] Update Clerk production instance
- [ ] Configure production webhook URL:
  ```
  https://your-production-domain.com/api/clerk-users-webhook
  ```
- [ ] Enable required webhook events:
  - user.created
  - user.updated
  - user.deleted
  - paymentAttempt.updated
- [ ] Copy webhook secret to Convex environment
- [ ] Configure production redirect URLs
- [ ] Test authentication flow

### 8.1.3 Set Up Custom Domain

- [ ] Purchase/configure domain
- [ ] Add domain to Vercel project
- [ ] Configure DNS records
- [ ] Enable SSL/TLS
- [ ] Test domain accessibility

### 8.1.4 Configure Security Headers

**File:** `next.config.ts`

- [ ] Add security headers:
  ```typescript
  const config = {
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'on'
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=63072000; includeSubDomains; preload'
            },
            {
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN'
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block'
            },
            {
              key: 'Referrer-Policy',
              value: 'origin-when-cross-origin'
            },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=()'
            }
          ]
        }
      ];
    },
  };
  ```

### 8.1.5 Set Up Error Monitoring

- [ ] Install Sentry:
  ```bash
  npm install @sentry/nextjs
  ```

- [ ] Configure Sentry:
  ```typescript
  // sentry.client.config.ts
  import * as Sentry from '@sentry/nextjs';
  
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });
  ```

- [ ] Test error reporting
- [ ] Configure error alerts

### 8.1.6 Set Up Analytics

- [ ] Configure Vercel Analytics
- [ ] Set up Google Analytics (optional)
- [ ] Configure custom events tracking
- [ ] Set up conversion tracking

### 8.1.7 Configure Rate Limiting

**File:** `middleware.ts`

- [ ] Add rate limiting:
  ```typescript
  import { Ratelimit } from '@upstash/ratelimit';
  import { Redis } from '@upstash/redis';
  
  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '10 s'),
  });
  
  export async function middleware(request: NextRequest) {
    const ip = request.ip ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);
    
    if (!success) {
      return new Response('Too Many Requests', { status: 429 });
    }
    
    return NextResponse.next();
  }
  ```

- [ ] Test rate limiting

### 8.1.8 Set Up Backup Strategy

- [ ] Configure Convex backups
- [ ] Set up automated database snapshots
- [ ] Test restore procedure
- [ ] Document backup locations

### 8.1.9 Create Deployment Checklist

**File:** `DEPLOYMENT.md`

- [ ] Create checklist document:
  ```markdown
  # Deployment Checklist
  
  ## Pre-Deployment
  - [ ] All tests passing
  - [ ] Environment variables set
  - [ ] Security audit completed
  - [ ] Performance benchmarks met
  - [ ] Staging tested
  
  ## Deployment
  - [ ] Deploy to Vercel
  - [ ] Verify Convex connection
  - [ ] Test authentication
  - [ ] Test webhooks
  - [ ] Smoke test critical paths
  
  ## Post-Deployment
  - [ ] Monitor error rates
  - [ ] Check performance metrics
  - [ ] Verify analytics tracking
  - [ ] Test all integrations
  ```

### 8.1.10 Set Up Status Page

- [ ] Create status monitoring
- [ ] Set up uptime monitoring
- [ ] Configure health check endpoints:
  ```typescript
  // app/api/health/route.ts
  export async function GET() {
    // Check database connection
    // Check external APIs
    // Return health status
    return Response.json({ status: 'healthy' });
  }
  ```

## Acceptance Criteria
- [ ] All environment variables configured
- [ ] Custom domain working
- [ ] SSL/TLS enabled
- [ ] Security headers active
- [ ] Error monitoring functional
- [ ] Analytics tracking
- [ ] Rate limiting working
- [ ] Backups configured

## Security Checklist
- [ ] API keys not exposed in client
- [ ] CORS properly configured
- [ ] Authentication required on protected routes
- [ ] Webhook signatures verified
- [ ] SQL injection prevention (N/A for Convex)
- [ ] XSS prevention
- [ ] CSRF protection

## Next Steps
Proceed to Task 8.2: Deployment & Launch
