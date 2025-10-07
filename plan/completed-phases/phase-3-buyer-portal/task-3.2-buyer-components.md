# Task 3.2: Buyer Portal Components

**Phase:** 3 - Frontend - Buyer Portal  
**Estimated Time:** 10-12 hours  
**Priority:** High  
**Dependencies:** Task 3.1 (Buyer Routes)

## Overview
Build reusable components for the buyer portal including property cards, galleries, calculators, and interactive elements.

## Subtasks

### 3.2.1 Create Property Card Component

**File:** `components/buyer/property-card.tsx`

- [ ] Create property card:
  ```typescript
  import Image from "next/image";
  import Link from "next/link";
  import { Heart, Bed, Bath, Square } from "lucide-react";
  import { Button } from "@/components/ui/button";
  
  export default function PropertyCard({
    listing,
    sessionCode,
  }: {
    listing: any;
    sessionCode: string;
  }) {
    return (
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
        <div className="relative h-48">
          <Image
            src={listing.images[0] || '/placeholder.jpg'}
            alt={listing.address}
            fill
            className="object-cover"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 bg-white/80"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 space-y-2">
          <div className="text-2xl font-bold">
            ${listing.price.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            {listing.address}, {listing.city}
          </div>
          
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              {listing.bedrooms} beds
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              {listing.bathrooms} baths
            </div>
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              {listing.sqft} sqft
            </div>
          </div>
          
          <Link href={`/buyer/${sessionCode}/properties/${listing._id}`}>
            <Button className="w-full mt-2">View Details</Button>
          </Link>
        </div>
      </div>
    );
  }
  ```

- [ ] Test card rendering
- [ ] Add skeleton loading state

### 3.2.2 Create Property Gallery Component

**File:** `components/buyer/property-gallery.tsx`

- [ ] Create interactive gallery:
  ```typescript
  'use client';
  
  import { useState } from 'react';
  import Image from 'next/image';
  import { ChevronLeft, ChevronRight, X } from 'lucide-react';
  
  export default function PropertyGallery({
    images,
    videos,
  }: {
    images: string[];
    videos: string[];
  }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    
    return (
      <div className="space-y-4">
        {/* Main image */}
        <div className="relative h-[500px] cursor-pointer" onClick={() => setIsLightboxOpen(true)}>
          <Image
            src={images[currentIndex]}
            alt="Property"
            fill
            className="object-cover rounded-lg"
          />
        </div>
        
        {/* Thumbnail strip */}
        <div className="grid grid-cols-6 gap-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative h-20 cursor-pointer ${idx === currentIndex ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            >
              <Image src={img} alt="" fill className="object-cover rounded" />
            </div>
          ))}
        </div>
        
        {/* Lightbox modal */}
        {isLightboxOpen && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
            {/* Lightbox controls */}
          </div>
        )}
      </div>
    );
  }
  ```

- [ ] Test gallery interactions
- [ ] Add keyboard navigation

### 3.2.3 Create Property Details Component

**File:** `components/buyer/property-details.tsx`

- [ ] Create details component:
  ```typescript
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
  
  export default function PropertyDetails({ listing }: { listing: any }) {
    return (
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <h3 className="text-xl font-semibold">Property Description</h3>
          <p>{listing.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Price</div>
              <div className="font-semibold">${listing.price.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Bedrooms</div>
              <div className="font-semibold">{listing.bedrooms}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Bathrooms</div>
              <div className="font-semibold">{listing.bathrooms}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Square Feet</div>
              <div className="font-semibold">{listing.sqft}</div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="features">
          <div className="grid grid-cols-2 gap-2">
            {listing.features.map((feature: string) => (
              <div key={feature} className="flex items-center gap-2">
                <span>✓</span> {feature}
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="location">
          <div>Map and location details</div>
        </TabsContent>
      </Tabs>
    );
  }
  ```

- [ ] Test tabs functionality

### 3.2.4 Create Neighborhood Insights Component

**File:** `components/buyer/neighborhood-insights.tsx`

- [ ] Create insights component:
  ```typescript
  import { School, Footprints, Shield, MapPin } from "lucide-react";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  
  export default function NeighborhoodInsights({ enrichedData }: { enrichedData: any }) {
    if (!enrichedData) return null;
    
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Neighborhood Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Walk Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Footprints className="h-4 w-4" />
                Walk Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{enrichedData.walkScore || 'N/A'}</div>
            </CardContent>
          </Card>
          
          {/* Schools */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <School className="h-4 w-4" />
                Schools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {enrichedData.schoolRatings?.elementary?.[0]?.rating || 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">
                Nearby elementary
              </div>
            </CardContent>
          </Card>
          
          {/* Safety */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Safety Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {enrichedData.crimeStats?.safetScore || 'N/A'}
              </div>
            </CardContent>
          </Card>
          
          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Nearby Places
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {enrichedData.nearbyAmenities?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                Points of interest
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  ```

- [ ] Test with sample data

### 3.2.5 Create Comparables Table Component

**File:** `components/buyer/comparables-table.tsx`

- [ ] Create table:
  ```typescript
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  
  export default function ComparablesTable({ comps }: { comps: any[] }) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Beds/Baths</TableHead>
            <TableHead>Sqft</TableHead>
            <TableHead>$/Sqft</TableHead>
            <TableHead>Sold Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comps.map((comp, idx) => (
            <TableRow key={idx}>
              <TableCell>{comp.address}</TableCell>
              <TableCell>${comp.price.toLocaleString()}</TableCell>
              <TableCell>{comp.beds}/{comp.baths}</TableCell>
              <TableCell>{comp.sqft}</TableCell>
              <TableCell>${Math.round(comp.price / comp.sqft)}</TableCell>
              <TableCell>{comp.soldDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
  ```

### 3.2.6 Create Mortgage Calculator Component

**File:** `components/buyer/mortgage-calculator.tsx`

- [ ] Create calculator:
  ```typescript
  'use client';
  
  import { useState } from 'react';
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  
  export default function MortgageCalculator({ listingPrice }: { listingPrice: number }) {
    const [downPayment, setDownPayment] = useState(listingPrice * 0.2);
    const [interestRate, setInterestRate] = useState(7.0);
    const [loanTerm, setLoanTerm] = useState(30);
    
    const principal = listingPrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;
    
    const monthlyPayment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mortgage Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Down Payment</Label>
            <Input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
            />
          </div>
          
          <div>
            <Label>Interest Rate (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
            />
          </div>
          
          <div>
            <Label>Loan Term (years)</Label>
            <Input
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
            />
          </div>
          
          <div className="pt-4 border-t">
            <div className="text-2xl font-bold">
              ${Math.round(monthlyPayment).toLocaleString()}/mo
            </div>
            <div className="text-sm text-muted-foreground">
              Estimated monthly payment
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  ```

- [ ] Test calculations

### 3.2.7 Create Property Filters Component

**File:** `components/buyer/property-filters.tsx`

- [ ] Create filters sidebar
- [ ] Add price range slider
- [ ] Add bedroom/bathroom selectors
- [ ] Add property type checkboxes
- [ ] Add city/location filters
- [ ] Add "Apply Filters" button

### 3.2.8 Create Property Grid Component

**File:** `components/buyer/property-grid.tsx`

- [ ] Create grid with client-side filtering
- [ ] Add sorting options
- [ ] Add pagination
- [ ] Add loading states
- [ ] Add empty state

### 3.2.9 Create Save/Favorite Button Component

**File:** `components/buyer/save-button.tsx`

- [ ] Create toggle button:
  ```typescript
  'use client';
  
  import { useState } from 'react';
  import { Heart } from 'lucide-react';
  import { Button } from '@/components/ui/button';
  
  export default function SaveButton({ listingId }: { listingId: string }) {
    const [isSaved, setIsSaved] = useState(false);
    
    const handleToggle = async () => {
      // Call mutation to save/unsave
      setIsSaved(!isSaved);
    };
    
    return (
      <Button
        variant={isSaved ? 'default' : 'outline'}
        size="icon"
        onClick={handleToggle}
      >
        <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
      </Button>
    );
  }
  ```

### 3.2.10 Create Schedule Tour Button Component

**File:** `components/buyer/schedule-tour-button.tsx`

- [ ] Create button with modal
- [ ] Add date/time picker
- [ ] Add contact preferences
- [ ] Submit tour request

## Acceptance Criteria
- [ ] All components render correctly
- [ ] Components are reusable
- [ ] Responsive design implemented
- [ ] Interactive elements functional
- [ ] Loading states implemented
- [ ] Error handling in place

## Testing Checklist
- [ ] Test each component in isolation
- [ ] Test responsive behavior
- [ ] Test user interactions
- [ ] Test with various data sets
- [ ] Test error states
- [ ] Verify accessibility

## Next Steps
Proceed to Task 3.3: AI Chat Widget
