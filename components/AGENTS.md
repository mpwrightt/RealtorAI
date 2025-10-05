# Components Directory - Agent Instructions

## Overview
This directory contains all React components organized by feature area. Components follow functional React patterns with hooks.

## Directory Structure

```
components/
├── buyer/                  # Buyer portal components
├── seller/                 # Seller portal components
├── dashboard/              # Agent dashboard components
├── ag-ui/                  # AG-UI protocol components
├── ui/                     # shadcn/ui base components
└── [shared components]     # Shared across features
```

## Component Patterns

### Client Components
Mark with `'use client'` when component needs:
- Browser APIs (localStorage, window, etc.)
- React hooks (useState, useEffect, etc.)
- Event handlers
- Convex hooks (useQuery, useMutation)

```typescript
'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function PropertyCard({ listingId }) {
  const [isSaved, setIsSaved] = useState(false);
  const listing = useQuery(api.listings.getById, { id: listingId });
  
  return <div>{listing?.address}</div>;
}
```

### Server Components (Default)
Use when component:
- Fetches data from Convex
- Doesn't need interactivity
- Can be rendered server-side

```typescript
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export default async function PropertyList({ filters }) {
  const listings = await fetchQuery(api.listings.search, filters);
  return (
    <div>
      {listings.map(listing => (
        <PropertyCard key={listing._id} listing={listing} />
      ))}
    </div>
  );
}
```

## Component Structure

### Standard Pattern
```typescript
// 1. Imports
import { ComponentType } from 'react';
import { ExternalLib } from 'external-lib';
import { Button } from '@/components/ui/button';
import { useCustomHook } from '@/hooks/use-custom';

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

// 3. Component
export default function MyComponent({ title, onClick }: MyComponentProps) {
  // 4. Hooks (top-level only)
  const [state, setState] = useState('');
  const data = useCustomHook();
  
  // 5. Event Handlers
  const handleClick = () => {
    onClick?.();
  };
  
  // 6. Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // 7. Render
  return (
    <div>
      <h2>{title}</h2>
      <Button onClick={handleClick}>Click</Button>
    </div>
  );
}
```

## Naming Conventions

### Files
- PascalCase for component files: `PropertyCard.tsx`
- Kebab-case for utility files: `format-price.ts`

### Components
- PascalCase: `PropertyCard`, `BuyerNav`
- Descriptive names that indicate purpose
- Suffix with component type if needed: `PropertyCardSkeleton`

### Props
- Use descriptive names: `propertyId`, `onSave`, `isLoading`
- Boolean props start with `is`, `has`, `should`: `isActive`, `hasImage`
- Handlers start with `on`: `onClick`, `onSave`, `onChange`

## Props Patterns

### Type Definitions
```typescript
interface ComponentProps {
  // Required props
  title: string;
  count: number;
  
  // Optional props
  description?: string;
  
  // Callbacks
  onSubmit?: (value: string) => void;
  
  // Children
  children?: React.ReactNode;
  
  // Convex IDs
  listingId: Id<"listings">;
  
  // Complex types
  filters: {
    minPrice?: number;
    maxPrice?: number;
  };
}
```

### Prop Destructuring
```typescript
export default function Component({
  title,
  description = 'Default value',
  onSubmit,
  children,
}: ComponentProps) {
  // Component logic
}
```

## State Management

### Local State
```typescript
const [value, setValue] = useState('');
const [isOpen, setIsOpen] = useState(false);
```

### Convex Data
```typescript
// Query (read)
const data = useQuery(api.module.query, { filter: 'active' });

// Mutation (write)
const mutate = useMutation(api.module.mutation);

// Usage
const handleSave = () => {
  mutate({ id: '123', updates: { name: 'New Name' } });
};
```

### Form State
```typescript
const [formData, setFormData] = useState({
  email: '',
  name: '',
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value,
  }));
};
```

## UI Components (shadcn/ui)

### Using Base Components
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function Form() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter value" />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  );
}
```

### Adding New UI Components
```bash
# Use shadcn CLI to add components
npx shadcn@latest add [component-name]
```

## Loading States

### Skeleton Components
```typescript
export function PropertyCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-muted rounded" />
      <div className="p-4 space-y-2">
        <div className="h-6 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-3/4" />
      </div>
    </div>
  );
}
```

### Usage
```typescript
export default function PropertyList() {
  const listings = useQuery(api.listings.getAll);
  
  if (listings === undefined) {
    return <PropertyCardSkeleton />;
  }
  
  return <div>{/* Render listings */}</div>;
}
```

## Error Handling

### Error Boundaries
```typescript
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Inline Error Handling
```typescript
export default function Component() {
  const data = useQuery(api.module.query);
  
  if (data === undefined) return <Skeleton />;
  if (data === null) return <div>Not found</div>;
  
  return <div>{data.name}</div>;
}
```

## Styling

### TailwindCSS Classes
```typescript
<div className="flex items-center justify-between p-4 bg-background border rounded-lg">
  <span className="text-lg font-semibold">Title</span>
</div>
```

### Conditional Classes
```typescript
import { cn } from '@/lib/utils';

<button
  className={cn(
    'px-4 py-2 rounded',
    isActive && 'bg-primary text-primary-foreground',
    isDisabled && 'opacity-50 cursor-not-allowed'
  )}
>
  Button
</button>
```

## Performance Optimization

### Memoization
```typescript
import { useMemo } from 'react';

const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

### Callbacks
```typescript
import { useCallback } from 'react';

const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### Dynamic Imports
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <Skeleton />,
  ssr: false, // Disable SSR if needed
});
```

## Best Practices

1. **Keep components small** (< 200 lines)
2. **Extract reusable logic** to custom hooks
3. **Use TypeScript** for all props and state
4. **Add loading states** for async operations
5. **Handle errors gracefully**
6. **Write accessible HTML** (ARIA labels, semantic tags)
7. **Optimize images** with Next.js Image component
8. **Use proper key props** in lists
9. **Avoid prop drilling** (use context or composition)
10. **Test components** with various props

## Common Patterns

### Modal/Dialog
```typescript
'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function MyModal({ isOpen, onClose, children }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}
```

### Form with Validation
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function MyForm({ onSubmit }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!value) {
      setError('Required field');
      return;
    }
    
    onSubmit(value);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        error={error}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### List with Empty State
```typescript
export default function ItemList({ items }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No items found</p>
      </div>
    );
  }
  
  return (
    <div>
      {items.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

## Accessibility

- Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain proper heading hierarchy
- Provide text alternatives for images

## Testing

- Test component rendering
- Test user interactions
- Test error states
- Test loading states
- Test with various props
- Test accessibility
