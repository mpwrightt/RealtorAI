# Task 7.2: Performance Optimization

**Phase:** 7 - Testing & Polish  
**Estimated Time:** 6-8 hours  
**Priority:** High  
**Dependencies:** Task 7.1 (Testing Strategy)

## Overview
Optimize application performance including page load times, API responses, image loading, and overall user experience.

## Subtasks

### 7.2.1 Implement Image Optimization

- [ ] Configure Next.js Image Optimization:
  ```typescript
  // next.config.ts
  const config = {
    images: {
      formats: ['image/avif', 'image/webp'],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      domains: ['your-cdn-domain.com'],
      minimumCacheTTL: 60,
    },
  };
  ```

- [ ] Add blur placeholders for images
- [ ] Implement lazy loading for gallery images
- [ ] Compress uploaded images before storage

### 7.2.2 Optimize Bundle Size

- [ ] Analyze bundle:
  ```bash
  npm run build
  npx @next/bundle-analyzer
  ```

- [ ] Dynamic imports for heavy components:
  ```typescript
  // Lazy load chat widget
  const AIChat = dynamic(() => import('@/components/buyer/ai-chat-widget'), {
    loading: () => <p>Loading chat...</p>,
    ssr: false,
  });
  ```

- [ ] Remove unused dependencies
- [ ] Tree-shake unused code
- [ ] Split vendor bundles

### 7.2.3 Implement Code Splitting

- [ ] Route-based splitting (already handled by Next.js)
- [ ] Component-level splitting:
  ```typescript
  const PropertyGallery = dynamic(() => import('@/components/buyer/property-gallery'));
  const NeighborhoodInsights = dynamic(() => import('@/components/buyer/neighborhood-insights'));
  ```

- [ ] Lazy load modals and dialogs
- [ ] Lazy load charts (Recharts)

### 7.2.4 Optimize API Responses

**Implement caching:**
- [ ] Add Convex query caching
- [ ] Cache external API responses
- [ ] Implement Redis for session data (optional)

**Optimize queries:**
- [ ] Add pagination to listings queries
- [ ] Implement cursor-based pagination
- [ ] Add query limits
- [ ] Optimize indexes in Convex

### 7.2.5 Implement Loading States

- [ ] Add skeleton loaders:
  ```typescript
  // components/ui/skeleton-card.tsx
  export function PropertyCardSkeleton() {
    return (
      <div className="border rounded-lg overflow-hidden animate-pulse">
        <div className="h-48 bg-muted" />
        <div className="p-4 space-y-2">
          <div className="h-6 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-full" />
        </div>
      </div>
    );
  }
  ```

- [ ] Add loading states to all data fetches
- [ ] Add optimistic updates for mutations
- [ ] Add progress indicators for long operations

### 7.2.6 Optimize Streaming Responses

- [ ] Implement streaming for AI responses (already done)
- [ ] Add response compression
- [ ] Optimize chunk sizes
- [ ] Add timeout handling

### 7.2.7 Implement Request Debouncing

- [ ] Debounce search inputs:
  ```typescript
  import { useDebouncedCallback } from 'use-debounce';
  
  const debouncedSearch = useDebouncedCallback(
    (value) => {
      // Perform search
    },
    500
  );
  ```

- [ ] Throttle scroll events
- [ ] Debounce filter changes

### 7.2.8 Optimize Fonts

- [ ] Use Next.js font optimization:
  ```typescript
  import { Inter } from 'next/font/google';
  
  const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
  });
  ```

- [ ] Preload critical fonts
- [ ] Remove unused font weights

### 7.2.9 Add Service Worker (Optional)

- [ ] Implement offline support
- [ ] Cache static assets
- [ ] Background sync for analytics

### 7.2.10 Performance Monitoring

- [ ] Add Web Vitals tracking:
  ```typescript
  // app/layout.tsx
  import { SpeedInsights } from '@vercel/speed-insights/next';
  
  export default function RootLayout({ children }) {
    return (
      <html>
        <body>
          {children}
          <SpeedInsights />
        </body>
      </html>
    );
  }
  ```

- [ ] Set up error tracking with Sentry
- [ ] Monitor API performance
- [ ] Track user interactions

## Performance Targets
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Time to Interactive (TTI) < 3.8s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] First Input Delay (FID) < 100ms
- [ ] Total bundle size < 300KB (gzipped)

## Acceptance Criteria
- [ ] Lighthouse score > 90 (Performance)
- [ ] All images optimized
- [ ] Bundle size reduced by 30%
- [ ] API response times < 500ms
- [ ] No render-blocking resources
- [ ] Smooth 60fps animations

## Testing Checklist
- [ ] Test on slow 3G connection
- [ ] Test on low-end devices
- [ ] Measure with Lighthouse
- [ ] Test with Chrome DevTools
- [ ] Monitor bundle analyzer
- [ ] Test with real user data volumes

## Next Steps
Proceed to Phase 8: Deployment
