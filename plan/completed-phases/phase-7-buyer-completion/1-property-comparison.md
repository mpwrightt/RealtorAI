# Feature: Property Comparison View

**Priority:** Critical  
**Effort:** Medium (3-4 days)  
**Dependencies:** Property selection feature (already built)

## Overview
Enable buyers to compare 2-4 selected properties side-by-side with visual charts, feature comparison, and AI-powered analysis to help them make informed decisions.

## User Stories
- As a buyer, I want to compare multiple properties side-by-side so I can evaluate my options
- As a buyer, I want to see visual comparisons of price, size, and features
- As a buyer, I want AI to help me understand the pros/cons of each property
- As a buyer, I want to easily identify the best value among my selections

## Design Specs

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Compare Properties (3 selected)                     [Close] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Property │  │ Property │  │ Property │                  │
│  │    1     │  │    2     │  │    3     │                  │
│  │ [Image]  │  │ [Image]  │  │ [Image]  │                  │
│  │ $1.2M    │  │ $1.5M    │  │ $1.3M    │                  │
│  │ 3bd/2ba  │  │ 4bd/3ba  │  │ 3bd/2.5ba│                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Price Comparison           [Bar Chart]                   ││
│  │ ▓▓▓▓▓▓ $1.2M                                            ││
│  │ ▓▓▓▓▓▓▓▓ $1.5M                                          ││
│  │ ▓▓▓▓▓▓▓ $1.3M                                           ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Feature Comparison                                        ││
│  │ ┌──────────────┬──────┬──────┬──────┐                   ││
│  │ │ Feature      │ Prop1│ Prop2│ Prop3│                   ││
│  │ ├──────────────┼──────┼──────┼──────┤                   ││
│  │ │ Bedrooms     │  3   │  4   │  3   │                   ││
│  │ │ Bathrooms    │  2   │  3   │ 2.5  │                   ││
│  │ │ Square Feet  │ 1800 │ 2200 │ 1950 │                   ││
│  │ │ Parking      │  ✓   │  ✓   │  ✓   │                   ││
│  │ │ Pool         │  ✗   │  ✓   │  ✗   │                   ││
│  │ │ Garden       │  ✓   │  ✗   │  ✓   │                   ││
│  │ └──────────────┴──────┴──────┴──────┘                   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 🤖 AI Analysis                                           ││
│  │                                                           ││
│  │ Property 1: Best value per sqft ($667/sqft). Great      ││
│  │ starter home with outdoor space.                         ││
│  │                                                           ││
│  │ Property 2: Most space and features, but premium price. ││
│  │ Best for families needing extra room.                    ││
│  │                                                           ││
│  │ Property 3: Good compromise between 1 & 2. Modern        ││
│  │ finishes and half bath adds value.                       ││
│  │                                                           ││
│  │ Recommendation: If budget allows, Property 3 offers      ││
│  │ the best balance of space, features, and price.          ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  [Ask AI about comparison] [Export Comparison] [View Details]│
└─────────────────────────────────────────────────────────────┘
```

## Technical Implementation

### 1. Route
**File:** `app/buyer/[sessionCode]/compare/page.tsx`

```typescript
export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionCode: string }>;
  searchParams: Promise<{ ids?: string }>;
}) {
  const { sessionCode } = await params;
  const { ids } = await searchParams;
  
  if (!ids) {
    redirect(`/buyer/${sessionCode}`);
  }
  
  const listingIds = ids.split(',');
  
  if (listingIds.length < 2 || listingIds.length > 4) {
    redirect(`/buyer/${sessionCode}`);
  }
  
  const listings = await fetchQuery(api.listings.getMultipleListings, {
    listingIds: listingIds as Id<"listings">[],
  });
  
  const session = await fetchQuery(
    api.buyerSessions.getBuyerSessionByCode,
    { sessionCode }
  );
  
  return (
    <PropertyComparison 
      listings={listings}
      sessionCode={sessionCode}
      sessionId={session._id}
    />
  );
}
```

### 2. Main Component
**File:** `components/buyer/property-comparison.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Download, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ComparisonChart from './comparison-chart';
import ComparisonTable from './comparison-table';
import { useAGUIStream } from '@/hooks/use-ag-ui-stream';

interface PropertyComparisonProps {
  listings: any[];
  sessionCode: string;
  sessionId: string;
}

export default function PropertyComparison({
  listings,
  sessionCode,
  sessionId,
}: PropertyComparisonProps) {
  const [showAIChat, setShowAIChat] = useState(false);
  const { startStream } = useAGUIStream();
  
  const handleAIAnalysis = async () => {
    setShowAIChat(true);
    await startStream(
      sessionId,
      `Compare these ${listings.length} properties and help me understand which is the best value`,
      {
        sessionType: 'buyer',
        sessionCode,
        selectedProperties: listings,
      }
    );
  };
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Compare Properties ({listings.length})
        </h1>
        <Link href={`/buyer/${sessionCode}`}>
          <Button variant="ghost" size="icon">
            <X className="h-5 w-5" />
          </Button>
        </Link>
      </div>
      
      {/* Property Cards Row */}
      <div className={`grid gap-4 ${
        listings.length === 2 ? 'grid-cols-2' :
        listings.length === 3 ? 'grid-cols-3' :
        'grid-cols-2 lg:grid-cols-4'
      }`}>
        {listings.map((listing) => (
          <Card key={listing._id}>
            <div className="relative h-48">
              <Image
                src={listing.images?.[0] || '/placeholder.jpg'}
                alt={listing.address}
                fill
                className="object-cover rounded-t-lg"
              />
            </div>
            <CardContent className="pt-4">
              <p className="font-bold text-lg">
                ${listing.price.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                {listing.address}
              </p>
              <p className="text-sm mt-2">
                {listing.bedrooms} bd • {listing.bathrooms} ba • {listing.sqft.toLocaleString()} sqft
              </p>
              <Link href={`/buyer/${sessionCode}/properties/${listing._id}`}>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  View Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Price Comparison Chart */}
      <ComparisonChart listings={listings} />
      
      {/* Feature Comparison Table */}
      <ComparisonTable listings={listings} />
      
      {/* AI Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showAIChat ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Get AI-powered insights comparing these properties
              </p>
              <Button onClick={handleAIAnalysis}>
                Get AI Comparison
              </Button>
            </div>
          ) : (
            <div className="prose max-w-none">
              {/* AI chat will appear here */}
              <p className="text-sm text-muted-foreground">
                AI analysis will stream here...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="h-4 w-4 mr-2" />
          Export Comparison
        </Button>
        <Link href={`/buyer/${sessionCode}`}>
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
```

### 3. Comparison Chart
**File:** `components/buyer/comparison-chart.tsx`

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ComparisonChartProps {
  listings: any[];
}

export default function ComparisonChart({ listings }: ComparisonChartProps) {
  const data = {
    labels: listings.map((l) => l.address.split(',')[0]),
    datasets: [
      {
        label: 'Price ($)',
        data: listings.map((l) => l.price),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
      {
        label: 'Price per sqft ($)',
        data: listings.map((l) => Math.round(l.price / l.sqft)),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
      },
    ],
  };
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Price Comparison',
      },
    },
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Price & Value Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Bar data={data} options={options} />
      </CardContent>
    </Card>
  );
}
```

### 4. Comparison Table
**File:** `components/buyer/comparison-table.tsx`

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

interface ComparisonTableProps {
  listings: any[];
}

export default function ComparisonTable({ listings }: ComparisonTableProps) {
  // Extract all unique features
  const allFeatures = new Set<string>();
  listings.forEach((listing) => {
    listing.features?.forEach((f: string) => allFeatures.add(f));
  });
  
  const features = [
    { label: 'Price', getValue: (l: any) => `$${l.price.toLocaleString()}` },
    { label: 'Bedrooms', getValue: (l: any) => l.bedrooms },
    { label: 'Bathrooms', getValue: (l: any) => l.bathrooms },
    { label: 'Square Feet', getValue: (l: any) => l.sqft.toLocaleString() },
    { label: 'Price per sqft', getValue: (l: any) => `$${Math.round(l.price / l.sqft)}` },
    { label: 'Property Type', getValue: (l: any) => l.propertyType },
    { label: 'Year Built', getValue: (l: any) => l.yearBuilt || 'N/A' },
    { label: 'Lot Size', getValue: (l: any) => l.lotSize ? `${l.lotSize} acres` : 'N/A' },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Feature</th>
                {listings.map((listing, idx) => (
                  <th key={listing._id} className="text-center p-3 font-medium">
                    Property {idx + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr key={feature.label} className="border-b">
                  <td className="p-3 text-muted-foreground">{feature.label}</td>
                  {listings.map((listing) => (
                    <td key={listing._id} className="p-3 text-center">
                      {feature.getValue(listing)}
                    </td>
                  ))}
                </tr>
              ))}
              
              {/* Feature checkboxes */}
              {Array.from(allFeatures).map((feature) => (
                <tr key={feature} className="border-b">
                  <td className="p-3 text-muted-foreground">{feature}</td>
                  {listings.map((listing) => (
                    <td key={listing._id} className="p-3 text-center">
                      {listing.features?.includes(feature) ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 5. Convex Function
**File:** `convex/listings.ts`

```typescript
export const getMultipleListings = query({
  args: {
    listingIds: v.array(v.id("listings")),
  },
  handler: async (ctx, args) => {
    const listings = await Promise.all(
      args.listingIds.map((id) => ctx.db.get(id))
    );
    
    return listings.filter((l) => l !== null);
  },
});
```

### 6. Update Dashboard Component
**File:** `components/buyer/dashboard-ai-assistant.tsx`

Add "Compare" button when 2+ properties selected:

```typescript
{selectedProperties.size >= 2 && (
  <Link href={`/buyer/${sessionCode}/compare?ids=${Array.from(selectedProperties).join(',')}`}>
    <Button className="w-full" variant="default">
      Compare Selected ({selectedProperties.size})
    </Button>
  </Link>
)}
```

## Dependencies
- `chart.js` and `react-chartjs-2` for charts
- Existing property selection feature
- AI streaming integration

## Installation
```bash
npm install chart.js react-chartjs-2
```

## Testing Scenarios
1. Compare 2 properties
2. Compare 3 properties
3. Compare 4 properties (max)
4. Try to compare 1 property (should redirect)
5. Try to compare 5+ properties (should limit to 4)
6. Export comparison (print preview)
7. AI analysis generates relevant insights
8. Mobile responsive on all screen sizes

## Success Metrics
- 60%+ of buyers use comparison feature
- Average 2.8 properties compared per session
- 40%+ users request AI analysis
- 20%+ conversion rate from comparison to offer

## Future Enhancements
- Save comparisons for later
- Share comparison with others
- Neighborhood comparison overlay
- Commute time comparison
- Custom comparison criteria selection
