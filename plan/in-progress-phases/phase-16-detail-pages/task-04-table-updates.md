# Task 04: Table Updates & Navigation

**Phase:** 16 - Dashboard Detail Pages  
**Effort:** 4 hours  
**Priority:** 🔥 MEDIUM  
**Dependencies:** Tasks 01, 02, 03

---

## 🎯 Objective

Update existing dashboard table components to make rows clickable and add navigation to detail pages. Ensure consistent navigation patterns across all tables.

---

## 📋 Subtasks

### 1. Update Listings Table (1 hour)

**Edit:** `components/dashboard/listings-table.tsx`

```typescript
// Add this import at the top
import Link from "next/link";

// Update TableRow in the map function:
<TableRow 
  key={listing._id}
  className="cursor-pointer hover:bg-muted/50"
>
  <TableCell className="font-medium">
    <Link 
      href={`/dashboard/listings/${listing._id}`}
      className="hover:underline"
    >
      {listing.address}
    </Link>
  </TableCell>
  {/* ... rest of cells ... */}
</TableRow>

// Update dropdown menu to include "View Details" option:
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem asChild>
      <Link href={`/dashboard/listings/${listing._id}`}>
        <Eye className="h-4 w-4 mr-2" />
        View Details
      </Link>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Edit className="h-4 w-4 mr-2" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem className="text-destructive">
      <Trash className="h-4 w-4 mr-2" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### 2. Update Buyer Sessions Table (1 hour)

**Edit:** `components/dashboard/buyer-sessions-table.tsx`

```typescript
// Add this import at the top
import Link from "next/link";

// Update TableRow in the map function:
<TableRow 
  key={session._id}
  className="cursor-pointer hover:bg-muted/50"
  onClick={() => window.location.href = `/dashboard/buyers/${session._id}`}
>
  <TableCell className="font-medium">
    <Link 
      href={`/dashboard/buyers/${session._id}`}
      className="hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {session.buyerName}
    </Link>
  </TableCell>
  {/* ... rest of cells ... */}
  <TableCell className="text-right">
    <div 
      className="flex items-center justify-end gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => copyLink(session.sessionCode)}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Link href={`/buyer/${session.sessionCode}`} target="_blank">
        <Button variant="ghost" size="icon">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/buyers/${session._id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Edit Preferences</DropdownMenuItem>
          <DropdownMenuItem>Send Properties</DropdownMenuItem>
          <DropdownMenuItem>Deactivate</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </TableCell>
</TableRow>
```

---

### 3. Update Seller Sessions Table (1 hour)

**Edit:** `components/dashboard/seller-sessions-table.tsx`

```typescript
// Add this import at the top if not present
import Link from "next/link";

// Update TableRow in the map function:
<TableRow 
  key={session._id}
  className="cursor-pointer hover:bg-muted/50"
  onClick={() => window.location.href = `/dashboard/sellers/${session._id}`}
>
  <TableCell className="font-medium">
    <Link 
      href={`/dashboard/sellers/${session._id}`}
      className="hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {session.sellerName}
    </Link>
  </TableCell>
  <TableCell>
    <Link 
      href={`/dashboard/listings/${session.listing?._id}`}
      className="max-w-[200px] truncate hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {session.listing?.address || 'N/A'}
    </Link>
    <div className="text-xs text-muted-foreground">
      {session.listing?.city}, {session.listing?.state}
    </div>
  </TableCell>
  {/* ... rest of cells ... */}
  <TableCell className="text-right">
    <div 
      className="flex items-center justify-end gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => copyPortalLink(session.sessionCode, session._id)}
      >
        {copiedId === session._id ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
      <Link href={`/seller/${session.sessionCode}`} target="_blank">
        <Button variant="ghost" size="sm">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/sellers/${session._id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => copyPortalLink(session.sessionCode, session._id)}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Portal Link
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/seller/${session.sessionCode}`} target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Portal
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">
            <Trash className="h-4 w-4 mr-2" />
            Deactivate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </TableCell>
</TableRow>
```

---

### 4. Update Dashboard Header for Detail Pages (1 hour)

**Edit:** `app/dashboard/site-header.tsx`

Add these route patterns to the header logic:

```typescript
// Add to the route matching logic:
const getPageTitle = (pathname: string) => {
  // ... existing routes ...
  
  // Detail pages
  if (pathname.match(/^\/dashboard\/buyers\/[^\/]+$/)) {
    return "Buyer Details";
  }
  if (pathname.match(/^\/dashboard\/sellers\/[^\/]+$/)) {
    return "Seller Details";
  }
  if (pathname.match(/^\/dashboard\/listings\/[^\/]+$/)) {
    return "Listing Details";
  }
  
  // ... rest of routes ...
};
```

---

### 5. Add Breadcrumbs Component (Optional Enhancement)

**Create:** `components/dashboard/breadcrumbs.tsx`

```typescript
'use client';

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname();
  
  if (!pathname.startsWith('/dashboard')) return null;
  
  const segments = pathname.split('/').filter(Boolean);
  
  const getBreadcrumbLabel = (segment: string, index: number, allSegments: string[]) => {
    if (segment === 'dashboard') return 'Dashboard';
    
    // Capitalize and format segment names
    const formatted = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // If it's an ID (long alphanumeric), show context
    if (segment.length > 15 && /^[a-zA-Z0-9]+$/.test(segment)) {
      const parent = allSegments[index - 1];
      if (parent === 'buyers') return 'Buyer Details';
      if (parent === 'sellers') return 'Seller Details';
      if (parent === 'listings') return 'Listing Details';
      return 'Details';
    }
    
    return formatted;
  };
  
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
      <Link href="/" className="hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;
        const label = getBreadcrumbLabel(segment, index, segments);
        
        return (
          <div key={segment} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
```

Then add to detail pages:

```typescript
import Breadcrumbs from "@/components/dashboard/breadcrumbs";

// In page component, before the main content:
<Breadcrumbs />
```

---

## ✅ Acceptance Criteria

- [ ] Listing address in table links to detail page
- [ ] Buyer name in table links to detail page
- [ ] Seller name in table links to detail page
- [ ] Property address in seller table links to listing detail
- [ ] "View Details" option added to all dropdown menus
- [ ] Row hover states indicate clickability
- [ ] Click events don't conflict with action buttons
- [ ] Dashboard header shows correct title for detail pages
- [ ] Navigation is consistent across all tables
- [ ] Breadcrumbs (if added) show correct path

---

## 🧪 Testing

### Manual Testing:

1. **Listings Table:**
   - Click property address → opens listing detail page
   - Click "View Details" in menu → opens listing detail page
   - Copy/edit/delete buttons still work independently

2. **Buyers Table:**
   - Click buyer name → opens buyer detail page
   - Click "View Details" in menu → opens buyer detail page
   - Portal link and copy buttons still work

3. **Sellers Table:**
   - Click seller name → opens seller detail page
   - Click property address → opens listing detail page
   - Click "View Details" in menu → opens seller detail page
   - Portal link and copy buttons still work

4. **Navigation Flow:**
   - Test clicking between detail pages (buyer → listing → seller)
   - Verify back button returns to previous page
   - Check breadcrumbs show correct path

5. **Edge Cases:**
   - Empty tables still show "Create" buttons
   - Action buttons don't trigger row click
   - External links open in new tabs
   - Loading states during navigation

---

## 📝 Implementation Notes

### Click Event Handling:
- Use `e.stopPropagation()` on action buttons to prevent row click
- Add `cursor-pointer` class to indicate clickable rows
- Add hover state `hover:bg-muted/50` for visual feedback

### Link Accessibility:
- Use semantic `<Link>` components for navigation
- Add descriptive text for screen readers if needed
- Ensure keyboard navigation works (Tab, Enter)

### Performance:
- Links use Next.js prefetching by default
- No client-side JavaScript required for basic navigation
- Detail pages can be server-rendered

---

*Estimated: 4 hours*  
*Priority: MEDIUM*  
*Completes: Phase 16 - Dashboard Detail Pages*
