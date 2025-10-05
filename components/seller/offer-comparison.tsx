'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scale, Check, X } from 'lucide-react';

interface Offer {
  _id: string;
  offerAmount: number;
  earnestMoney: number;
  downPayment: number;
  financingType: string;
  contingencies: string[];
  closingDate?: string;
  status: string;
}

interface OfferComparisonProps {
  offers: Offer[];
  listingPrice: number;
}

export default function OfferComparison({ offers, listingPrice }: OfferComparisonProps) {
  const [selectedOffers, setSelectedOffers] = useState<Set<string>>(new Set());
  
  const toggleOffer = (offerId: string) => {
    setSelectedOffers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(offerId)) {
        newSet.delete(offerId);
      } else if (newSet.size < 3) {
        newSet.add(offerId);
      }
      return newSet;
    });
  };
  
  const comparisonOffers = offers.filter(o => selectedOffers.has(o._id));
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  const getOfferStrength = (offer: Offer): number => {
    let score = 0;
    
    // Price (40 points)
    const pricePercent = (offer.offerAmount / listingPrice) * 100;
    score += Math.min((pricePercent / 100) * 40, 40);
    
    // Down payment (20 points)
    const downPercent = (offer.downPayment / offer.offerAmount) * 100;
    score += Math.min((downPercent / 20) * 20, 20);
    
    // Financing (20 points)
    if (offer.financingType === 'cash') score += 20;
    else if (offer.financingType === 'conventional') score += 15;
    else if (offer.financingType === 'va') score += 12;
    else score += 10;
    
    // Contingencies (20 points)
    score += Math.max(20 - (offer.contingencies.length * 5), 0);
    
    return Math.round(score);
  };
  
  if (offers.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Compare Offers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Offer Selection */}
        {comparisonOffers.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Select 2-3 offers to compare:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {offers.slice(0, 6).map((offer) => (
                <Button
                  key={offer._id}
                  variant={selectedOffers.has(offer._id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleOffer(offer._id)}
                  disabled={!selectedOffers.has(offer._id) && selectedOffers.size >= 3}
                >
                  {formatPrice(offer.offerAmount)}
                  {selectedOffers.has(offer._id) && (
                    <Check className="h-4 w-4 ml-2" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Comparison Table */}
        {comparisonOffers.length >= 2 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Criteria</th>
                    {comparisonOffers.map((offer, idx) => (
                      <th key={offer._id} className="text-center p-3 font-medium">
                        Offer {idx + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Offer Amount</td>
                    {comparisonOffers.map((offer) => (
                      <td key={offer._id} className="p-3 text-center font-bold">
                        {formatPrice(offer.offerAmount)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">% of List Price</td>
                    {comparisonOffers.map((offer) => (
                      <td key={offer._id} className="p-3 text-center">
                        {((offer.offerAmount / listingPrice) * 100).toFixed(1)}%
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Down Payment</td>
                    {comparisonOffers.map((offer) => (
                      <td key={offer._id} className="p-3 text-center">
                        {formatPrice(offer.downPayment)}
                        <br/>
                        <span className="text-xs text-muted-foreground">
                          ({((offer.downPayment / offer.offerAmount) * 100).toFixed(0)}%)
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Earnest Money</td>
                    {comparisonOffers.map((offer) => (
                      <td key={offer._id} className="p-3 text-center">
                        {formatPrice(offer.earnestMoney)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Financing</td>
                    {comparisonOffers.map((offer) => (
                      <td key={offer._id} className="p-3 text-center capitalize">
                        {offer.financingType}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Contingencies</td>
                    {comparisonOffers.map((offer) => (
                      <td key={offer._id} className="p-3 text-center">
                        {offer.contingencies.length}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Closing Date</td>
                    {comparisonOffers.map((offer) => (
                      <td key={offer._id} className="p-3 text-center">
                        {offer.closingDate || 'Flexible'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b bg-muted/50">
                    <td className="p-3 font-semibold">Strength Score</td>
                    {comparisonOffers.map((offer) => {
                      const score = getOfferStrength(offer);
                      return (
                        <td key={offer._id} className="p-3 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-2xl font-bold">{score}</span>
                            <span className="text-xs text-muted-foreground">/100</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* AI Recommendation */}
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="font-semibold mb-2">💡 AI Recommendation:</p>
              <p className="text-sm">
                {(() => {
                  const sorted = [...comparisonOffers].sort((a, b) => 
                    getOfferStrength(b) - getOfferStrength(a)
                  );
                  const best = sorted[0];
                  const score = getOfferStrength(best);
                  
                  if (score >= 80) {
                    return `Offer ${comparisonOffers.indexOf(best) + 1} is exceptionally strong. Consider accepting.`;
                  } else if (score >= 70) {
                    return `Offer ${comparisonOffers.indexOf(best) + 1} is solid. Good value with reasonable terms.`;
                  } else {
                    return `All offers are below ideal strength. Consider countering for better terms.`;
                  }
                })()}
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setSelectedOffers(new Set())}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Comparison
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
