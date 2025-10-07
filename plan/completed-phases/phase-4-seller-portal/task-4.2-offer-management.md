# Task 4.2: Seller Offer Management

**Phase:** 4 - Frontend - Seller Portal  
**Estimated Time:** 6-8 hours  
**Priority:** High  
**Dependencies:** Task 2.1.7 (Offer Functions), Task 2.2 (OpenRouter Service)

## Overview
Build the offer management interface where sellers can review, compare, and respond to buyer offers with AI-powered analysis.

## Subtasks

### 4.2.1 Create Offers Page

**File:** `app/seller/[sessionCode]/offers/page.tsx`

- [ ] Create offers page:
  ```typescript
  import { api } from "@/convex/_generated/api";
  import { fetchQuery } from "convex/nextjs";
  import OfferCard from "@/components/seller/offer-card";
  import OfferComparison from "@/components/seller/offer-comparison";
  
  export default async function OffersPage({
    params,
  }: {
    params: { sessionCode: string };
  }) {
    const session = await fetchQuery(
      api.sellerSessions.getSellerSessionByCode,
      { sessionCode: params.sessionCode }
    );
    
    const offers = await fetchQuery(api.offers.getOffersByListing, {
      listingId: session.listingId,
    });
    
    const pending = offers.filter(o => o.status === 'pending');
    const accepted = offers.filter(o => o.status === 'accepted');
    const rejected = offers.filter(o => o.status === 'rejected');
    
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Offers</h2>
          <div className="text-sm text-muted-foreground">
            {pending.length} pending
          </div>
        </div>
        
        {pending.length > 1 && (
          <OfferComparison offers={pending} />
        )}
        
        <section>
          <h3 className="text-xl font-semibold mb-4">Pending Offers</h3>
          <div className="grid gap-4">
            {pending.map(offer => (
              <OfferCard
                key={offer._id}
                offer={offer}
                sessionCode={params.sessionCode}
              />
            ))}
          </div>
        </section>
        
        {accepted.length > 0 && (
          <section>
            <h3 className="text-xl font-semibold mb-4">Accepted</h3>
            <div className="grid gap-4">
              {accepted.map(offer => (
                <OfferCard key={offer._id} offer={offer} sessionCode={params.sessionCode} />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }
  ```

### 4.2.2 Create Offer Card Component

**File:** `components/seller/offer-card.tsx`

- [ ] Create detailed offer card:
  ```typescript
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";
  import { CheckCircle, XCircle, MessageCircle } from "lucide-react";
  import AIAnalysisBadge from "./ai-analysis-badge";
  
  export default function OfferCard({
    offer,
    sessionCode,
  }: {
    offer: any;
    sessionCode: string;
  }) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                ${offer.offerAmount.toLocaleString()}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Submitted {new Date(offer.createdAt).toLocaleDateString()}
              </p>
            </div>
            {offer.aiAnalysis && (
              <AIAnalysisBadge confidence={offer.aiAnalysis.confidence} />
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Offer Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Earnest Money</div>
              <div className="font-semibold">
                ${offer.earnestMoney.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Down Payment</div>
              <div className="font-semibold">
                ${offer.downPayment.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Financing</div>
              <div className="font-semibold">{offer.financingType}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Closing</div>
              <div className="font-semibold">{offer.closingDate || 'Flexible'}</div>
            </div>
          </div>
          
          {/* Contingencies */}
          {offer.contingencies.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Contingencies</div>
              <div className="flex flex-wrap gap-2">
                {offer.contingencies.map((c: string) => (
                  <Badge key={c} variant="outline">{c}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* AI Analysis */}
          {offer.aiAnalysis && (
            <div className="border-t pt-4">
              <div className="text-sm font-medium mb-2">AI Analysis</div>
              <div className="grid gap-3">
                <div>
                  <div className="text-xs font-medium text-green-600">Strengths</div>
                  <ul className="text-sm list-disc list-inside">
                    {offer.aiAnalysis.strengths.map((s: string) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-medium text-orange-600">Risks</div>
                  <ul className="text-sm list-disc list-inside">
                    {offer.aiAnalysis.risks.map((r: string) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-medium">Recommendation</div>
                  <p className="text-sm">{offer.aiAnalysis.recommendation}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Actions */}
          {offer.status === 'pending' && (
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" variant="default">
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept
              </Button>
              <Button className="flex-1" variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Counter
              </Button>
              <Button className="flex-1" variant="destructive">
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  ```

### 4.2.3 Create Offer Comparison Component

**File:** `components/seller/offer-comparison.tsx`

- [ ] Create side-by-side comparison:
  ```typescript
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  
  export default function OfferComparison({ offers }: { offers: any[] }) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compare Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                {offers.map((offer, idx) => (
                  <TableHead key={offer._id}>Offer {idx + 1}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Amount</TableCell>
                {offers.map(offer => (
                  <TableCell key={offer._id}>
                    ${offer.offerAmount.toLocaleString()}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Earnest Money</TableCell>
                {offers.map(offer => (
                  <TableCell key={offer._id}>
                    ${offer.earnestMoney.toLocaleString()}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Financing</TableCell>
                {offers.map(offer => (
                  <TableCell key={offer._id}>{offer.financingType}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Contingencies</TableCell>
                {offers.map(offer => (
                  <TableCell key={offer._id}>
                    {offer.contingencies.length}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">AI Score</TableCell>
                {offers.map(offer => (
                  <TableCell key={offer._id}>
                    {offer.aiAnalysis?.confidence || 'N/A'}/100
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
  ```

### 4.2.4 Create Offer Actions Component

**File:** `components/seller/offer-actions.tsx`

- [ ] Create action handlers:
  ```typescript
  'use client';
  
  import { useState } from 'react';
  import { useMutation } from 'convex/react';
  import { api } from '@/convex/_generated/api';
  import { Button } from '@/components/ui/button';
  import { useToast } from '@/hooks/use-toast';
  
  export default function OfferActions({ offerId }: { offerId: string }) {
    const { toast } = useToast();
    const updateStatus = useMutation(api.offers.updateOfferStatus);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleAccept = async () => {
      setIsLoading(true);
      try {
        await updateStatus({ id: offerId, status: 'accepted' });
        toast({ title: 'Offer accepted!' });
      } catch (error) {
        toast({ title: 'Error', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Similar for reject and counter
    
    return (
      <div className="flex gap-2">
        <Button onClick={handleAccept} disabled={isLoading}>
          Accept
        </Button>
        {/* Other buttons */}
      </div>
    );
  }
  ```

### 4.2.5 Create Counter Offer Modal

**File:** `components/seller/counter-offer-modal.tsx`

- [ ] Create modal with form:
  ```typescript
  'use client';
  
  import { useState } from 'react';
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import { Textarea } from '@/components/ui/textarea';
  import { Button } from '@/components/ui/button';
  
  export default function CounterOfferModal({
    isOpen,
    onClose,
    originalOffer,
  }: {
    isOpen: boolean;
    onClose: () => void;
    originalOffer: any;
  }) {
    const [counterAmount, setCounterAmount] = useState(originalOffer.offerAmount);
    const [terms, setTerms] = useState('');
    
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Counter Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Counter Amount</Label>
              <Input
                type="number"
                value={counterAmount}
                onChange={(e) => setCounterAmount(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Additional Terms</Label>
              <Textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Any changes to terms or contingencies..."
              />
            </div>
            <Button className="w-full">Submit Counter Offer</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  ```

### 4.2.6 Create AI Analysis Trigger

- [ ] Add button to request AI analysis for offers without it
- [ ] Show loading state during analysis
- [ ] Update UI when analysis completes

### 4.2.7 Create Offer Notification System

**File:** `hooks/use-offer-notifications.ts`

- [ ] Create notification hook:
  ```typescript
  import { useEffect } from 'react';
  import { useQuery } from 'convex/react';
  import { api } from '@/convex/_generated/api';
  import { useToast } from './use-toast';
  
  export function useOfferNotifications(listingId: string) {
    const offers = useQuery(api.offers.getOffersByListing, { listingId });
    const { toast } = useToast();
    
    useEffect(() => {
      // Check for new offers
      // Show toast notification
    }, [offers]);
  }
  ```

### 4.2.8 Create Offer Timeline

**File:** `components/seller/offer-timeline.tsx`

- [ ] Show offer history and updates

### 4.2.9 Add Email Notifications

- [ ] Trigger email when new offer received
- [ ] Send updates on offer status changes
- [ ] Include offer summary in email

### 4.2.10 Create Offer Export Feature

- [ ] Export individual offer details
- [ ] Export comparison of all offers
- [ ] PDF generation for sharing with agent

## Acceptance Criteria
- [ ] Offers display correctly
- [ ] AI analysis visible
- [ ] Actions functional (accept/reject/counter)
- [ ] Comparison tool works
- [ ] Real-time updates work
- [ ] Mobile responsive

## Testing Checklist
- [ ] Test with multiple offers
- [ ] Test offer actions
- [ ] Test counter offer flow
- [ ] Test AI analysis trigger
- [ ] Test notifications
- [ ] Test export features

## Next Steps
Proceed to Phase 5: Agent Control Center
